/**
 * Multi-stage bloodwork interpretation (Opus 4.7).
 *
 * Pipeline (same shape as /api/ai/protocol):
 *   1. profile  — context already gathered server-side
 *   2. draft    — Opus 4.7 generateObject → BloodworkInterpretation
 *   3. critique — Opus 4.7 generateObject → Critique; if approved=false and
 *                 revised is present, server uses it instead of the draft
 *   4. format   — chunked markdownBody to client as SSE text-deltas
 *
 * Mobile renders the stages with the StepSequencer; warnings flagged at
 * critical/high severity surface as a Safety-check banner.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import {
  badRequest,
  enforceInputLimits,
  hardenedSystemPrompt,
} from '@/lib/ai/safety';
import { createSseStream, SSE_HEADERS } from '@/lib/ai/sse';
import {
  bloodworkInterpretationSchema,
  bloodworkCritiqueSchema,
  type BloodworkInterpretation,
  type BloodworkCritique,
} from '@/lib/ai/bloodwork-schemas';

export const maxDuration = 60;
export const OPTIONS = aiOptions;

const MAX_MARKERS = 60;

const DRAFTER_SYSTEM = `You are a careful bloodwork educator for the Peptide Atlas educational app.

CRITICAL RULES:
1. Your job is EDUCATION, not medical advice. Never diagnose, never recommend drugs/peptides/doses, never tell the user to start or stop a medication.
2. Use the user's profile (goals, current protocol, conditions) to make findings personally relevant — but defer treatment decisions to a clinician.
3. For each marker, classify status using the panel's reference range first; only call something "concerning" if the value is meaningfully outside the range or fits a worrisome pattern.
4. The 'actionable' field on each finding is education-only: e.g. "ask your clinician about re-testing in 4 weeks", "consider whether sleep quality could be contributing", "discuss timing of testosterone draw with your provider". NEVER write doses or drug names there.
5. Identify multi-marker patterns when relevant (e.g. low T + high SHBG, or insulin resistance signal across glucose/A1c/lipids).
6. The markdownBody is what the user reads. Use ## section headers, **bold** for marker names, bullets for findings. End with: "*This is educational information, not medical advice. Discuss your bloodwork with a licensed clinician.*"

Return strictly-typed JSON matching the schema. No prose outside the JSON.`;

const CRITIQUE_SYSTEM = `You are reviewing a bloodwork interpretation for safety + accuracy. The user's profile is in the context.

Audit the draft against:
1. Status classification — does the assigned status (optimal/in_range/low/high/concerning) actually match the value vs reference range, AND is "concerning" reserved for values that are meaningfully out-of-range or fit a worrisome pattern?
2. Scope — does any finding cross from education into clinical advice? Any specific dose, drug recommendation, or instruction to start/stop a medication is OUT OF SCOPE.
3. Warnings — is every contraindication-level concern (e.g. very high hematocrit on testosterone, severe thyroid panel) flagged?
4. Pattern detection — is anything obvious missed (low-T pattern, metabolic syndrome cluster, anaemia signal)?
5. Personalization — does the interpretation actually use the user's protocol/goals/conditions, or is it generic?
6. Disclaimer — is the educational disclaimer present at end of markdownBody?

Severity:
- critical: clinical advice, dangerous misclassification, missed serious finding
- high: significant accuracy issue
- medium: best-practice issue (e.g. should mention pattern)
- low: stylistic

If approved=true, issues array can still note medium/low items.
If approved=false, you MUST provide a revised interpretation that fixes every critical/high issue.

Be conservative — when in doubt, flag and revise.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const session = await auth(req);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: 'Sign in required' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }
  const tier = session.user.tier;

  const body = await req.json();
  const { markers, labDate } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  if (!Array.isArray(markers) || markers.length === 0) {
    return badRequest('markers array required', AI_CORS_HEADERS);
  }
  if (markers.length > MAX_MARKERS) {
    return badRequest(`Max ${MAX_MARKERS} markers per request`, AI_CORS_HEADERS);
  }

  const userContext = await buildUserContext(session.user.id);

  const markerSummary = markers
    .map(
      (m: { name: string; value: number; unit: string; referenceRange?: string }) =>
        `${m.name}: ${m.value} ${m.unit}${m.referenceRange ? ` (ref: ${m.referenceRange})` : ''}`
    )
    .join('\n');

  const userTurn = `Interpret this bloodwork panel from ${labDate || 'recent labs'}:\n\n${markerSummary}`;

  const stream = createSseStream(async (send) => {
    send({ type: 'stage', id: 'profile', label: 'Reading your profile' });

    send({ type: 'stage', id: 'draft', label: 'Interpreting markers' });
    const draftResult = await generateObject({
      model: anthropic('claude-opus-4-7'),
      system: hardenedSystemPrompt(DRAFTER_SYSTEM, userContext),
      prompt: userTurn,
      schema: bloodworkInterpretationSchema,
      maxOutputTokens: 2000,
    });
    let interpretation: BloodworkInterpretation = draftResult.object;

    send({ type: 'stage', id: 'critique', label: 'Running safety check' });
    const critiqueResult = await generateObject({
      model: anthropic('claude-opus-4-7'),
      system: hardenedSystemPrompt(CRITIQUE_SYSTEM, userContext),
      prompt: `Draft to review:\n\n${JSON.stringify(interpretation, null, 2)}`,
      schema: bloodworkCritiqueSchema,
      maxOutputTokens: 2000,
    });
    const critique: BloodworkCritique = critiqueResult.object;

    if (!critique.approved && critique.revised) {
      interpretation = critique.revised;
    }

    for (const issue of critique.issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        send({ type: 'warning', message: `${issue.severity.toUpperCase()}: ${issue.description}` });
      }
    }

    send({ type: 'stage', id: 'format', label: 'Finalizing' });

    const md = interpretation.markdownBody.trim();
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
