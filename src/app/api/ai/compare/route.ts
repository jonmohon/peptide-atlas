import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { COMPARISON_SYSTEM_PROMPT } from '@/lib/ai/prompts';
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
  const { peptideIds } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  if (!Array.isArray(peptideIds) || peptideIds.length < 2 || peptideIds.length > 5) {
    return badRequest('peptideIds must be an array of 2–5 catalog IDs', AI_CORS_HEADERS);
  }

  // Drop any IDs not in the catalog before they reach the model.
  const selected = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter(Boolean) as typeof peptides;
  if (selected.length < 2) {
    return badRequest('At least two valid catalog peptides required', AI_CORS_HEADERS);
  }

  const desc = selected
    .map((p) => `${p.name}: ${p.description} Effects: ${p.effects.join(', ')}`)
    .join('\n');

  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: hardenedSystemPrompt(COMPARISON_SYSTEM_PROMPT, serverContext),
    prompt: `Compare these peptides:\n${desc}`,
    maxOutputTokens: outputBudget(tier, 1024),
  });

  return result.toTextStreamResponse({ headers: AI_CORS_HEADERS });
}
