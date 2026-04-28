import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { MECHANISM_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { badRequest, enforceInputLimits, hardenedSystemPrompt, outputBudget } from '@/lib/ai/safety';

export const maxDuration = 20;
export const OPTIONS = aiOptions;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const session = await auth(req);
  const tier = session?.user?.tier ?? 'FREE';

  const body = await req.json();
  const { peptideId, level = 'intermediate', userContext: clientContext } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  // Server-side guard: only the catalog peptides can be explained. Prevents
  // someone from putting an arbitrary string into peptideId and using the
  // route to ask Claude to explain something off-topic.
  const peptide = peptides.find((p) => p.id === peptideId);
  if (!peptide) {
    return new Response(
      JSON.stringify({ error: 'Peptide not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }
  if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
    return badRequest('Invalid level', AI_CORS_HEADERS);
  }

  const userPrompt = `Explain the mechanism of action for ${peptide.name} (${peptide.fullName}).
Knowledge level: ${level}
Peptide details: ${peptide.description}
Effects: ${peptide.effects.join(', ')}
Affected regions: ${peptide.affectedRegions.map((r) => r.regionId).join(', ')}`;

  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: hardenedSystemPrompt(MECHANISM_SYSTEM_PROMPT, fullContext),
    prompt: userPrompt,
    maxOutputTokens: outputBudget(tier, 1024),
  });

  return result.toTextStreamResponse({ headers: AI_CORS_HEADERS });
}
