/**
 * Multi-stage protocol generator (Opus 4.7).
 *
 * Pipeline (each stage emits an SSE 'stage' event so the mobile UI can show a
 * progress indicator):
 *
 *   1. profile  — user context already gathered, no AI call
 *   2. draft    — Opus 4.7 generateObject → strict Protocol JSON
 *   3. critique — Opus 4.7 generateObject → Critique JSON; if approved=false,
 *                 use revised. This catches contraindications + dose errors
 *                 the drafter missed.
 *   4. format   — chunk the final markdownBody to the client as text-deltas
 *
 * The mobile renders the stage events as a step sequencer and the text-deltas
 * as the streamed response body in a markdown bubble.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { peptides } from '@/data/peptides';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { createSseStream, SSE_HEADERS } from '@/lib/ai/sse';
import {
  protocolSchema,
  critiqueSchema,
  type Protocol,
  type Critique,
} from '@/lib/ai/protocol-schemas';

export const maxDuration = 60;
export const OPTIONS = aiOptions;

const VALID_PEPTIDE_IDS = new Set(peptides.map((p) => p.id));

const DRAFTER_SYSTEM = `You are a careful peptide protocol designer for the Peptide Atlas educational app.

CRITICAL RULES:
1. Recommend ONLY peptides whose IDs exist in the catalog provided in the user context. Use the exact slug (lowercase, hyphen-separated). Never invent a peptide.
2. Doses must stay within the typicalDose ranges from the catalog. If you adjust, stay within ±20% of the typical and explain why in notes.
3. Check the user's allergies, health conditions, age, and sex against each peptide's contraindications before recommending. NEVER recommend a peptide for which the user has an active contraindication.
4. Keep protocols simple — 2-4 peptides typically. Use 5 only when synergy is clearly justified.
5. The 'route' field MUST match the catalog entry's administration route for the peptide.
6. The user's experience level affects depth and conservatism: beginners get shorter cycles and simpler stacks; advanced gets more nuance.
7. The markdownBody is what the user reads — make it well-formatted: bold peptide names + section headers, bullets for dose lines, a horizontal rule before the disclaimer, and end with: "*This is educational information, not medical advice. Consult a licensed clinician before starting any protocol.*"

Return strictly-typed JSON matching the schema. No prose outside the JSON.`;

const CRITIQUE_SYSTEM = `You are a peptide protocol safety reviewer. The user's profile is in the context.

Audit the draft against:
1. Catalog membership — is every peptideId actually in the catalog?
2. Dose range — is each dose within the catalog's typical ±20%?
3. Contraindications — does ANY peptide violate the user's allergies, conditions, age, or sex constraints?
4. Stack interactions — receptor desensitization, redundant pathways, dangerous combinations?
5. Sequencing/timing — is the order/overlap reasonable?
6. Monitoring labs — are the right markers tracked given what these peptides affect?

Severity guide:
- critical: active contraindication, dose dangerously high, hypothesized harmful interaction
- high: significant safety concern (e.g. dose at the upper limit for someone underweight)
- medium: best-practice issue (e.g. should add a monitoring lab)
- low: stylistic

If approved=true, issues array can still note medium/low items the user should know.
If approved=false, you MUST provide a revised Protocol that fixes every critical and high issue. The revised protocol must meet all the same rules from the drafter.

Be conservative — when in doubt, flag and revise.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const { goals, experience, preferences } = await req.json();
  const session = await auth(req);
  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';

  const goalsList = Array.isArray(goals) ? goals.join(', ') : (goals ?? '');
  const userTurn = `User goals: ${goalsList}
Experience level: ${experience}
${preferences ? `Preferences: ${preferences}` : ''}

Generate a personalized peptide protocol that accounts for the user's profile, conditions, allergies, active protocol, and recent journal data (all from the context above).`;

  const stream = createSseStream(async (send) => {
    send({ type: 'stage', id: 'profile', label: 'Reading your profile' });

    send({ type: 'stage', id: 'draft', label: 'Drafting protocol' });
    const draftResult = await generateObject({
      model: anthropic('claude-opus-4-7'),
      system: `${DRAFTER_SYSTEM}\n\n${serverContext}`,
      prompt: userTurn,
      schema: protocolSchema,
      maxOutputTokens: 2000,
    });
    let protocol: Protocol = draftResult.object;

    // Server-side guard: if any peptideId isn't in the catalog, mark and let the
    // critique pass try to fix it. We do NOT silently strip — we want the
    // critic to address it.
    const invalidIds = protocol.peptides
      .map((p) => p.peptideId)
      .filter((id) => !VALID_PEPTIDE_IDS.has(id));

    send({ type: 'stage', id: 'critique', label: 'Running safety check' });
    const critiqueResult = await generateObject({
      model: anthropic('claude-opus-4-7'),
      system: `${CRITIQUE_SYSTEM}\n\n${serverContext}`,
      prompt: `Draft protocol to review:\n\n${JSON.stringify(protocol, null, 2)}${
        invalidIds.length > 0
          ? `\n\nServer-side flag: these peptide IDs are NOT in the catalog and must be replaced or removed: ${invalidIds.join(', ')}`
          : ''
      }`,
      schema: critiqueSchema,
      maxOutputTokens: 2000,
    });
    const critique: Critique = critiqueResult.object;

    if (!critique.approved && critique.revised) {
      protocol = critique.revised;
    }

    // Surface medium/high warnings to the user's transcript even when approved.
    const userVisibleIssues = critique.issues.filter(
      (i) => i.severity === 'critical' || i.severity === 'high'
    );
    for (const issue of userVisibleIssues) {
      send({ type: 'warning', message: `${issue.severity.toUpperCase()}: ${issue.description}` });
    }

    send({ type: 'stage', id: 'format', label: 'Finalizing' });

    // Stream the final markdown to the client in chunks so it feels like
    // text streaming. Splitting on word boundaries keeps it natural.
    const md = protocol.markdownBody.trim();
    const words = md.split(/(\s+)/);
    let buffer = '';
    for (const w of words) {
      buffer += w;
      if (buffer.length >= 16) {
        send({ type: 'text-delta', delta: buffer });
        buffer = '';
        await sleep(8);
      }
    }
    if (buffer) send({ type: 'text-delta', delta: buffer });
  });

  return new Response(stream, { headers: { ...SSE_HEADERS, ...AI_CORS_HEADERS } });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
