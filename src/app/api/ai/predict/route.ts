import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { BASE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { badRequest, enforceInputLimits, hardenedSystemPrompt, outputBudget } from '@/lib/ai/safety';

export const maxDuration = 15;
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
  const { peptideIds, level = 'intermediate', userContext: clientContext } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  if (!Array.isArray(peptideIds) || peptideIds.length === 0 || peptideIds.length > 6) {
    return badRequest('peptideIds must be an array of 1–6 catalog IDs', AI_CORS_HEADERS);
  }
  if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
    return badRequest('Invalid level', AI_CORS_HEADERS);
  }

  const selectedPeptides = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter(Boolean) as typeof peptides;
  if (selectedPeptides.length === 0) {
    return badRequest('No valid catalog peptides supplied', AI_CORS_HEADERS);
  }

  const peptideList = selectedPeptides.map((p) => `${p.name}: ${p.description}`).join('\n');

  const prompt = `Write a concise "What to Expect" summary for someone using these peptides together:
${peptideList}

Knowledge level: ${level}

Include:
1. A brief summary (2-3 sentences)
2. Timeline broken into phases (Week 1-2, Week 3-4, Week 5+)
3. What to monitor/watch for
4. Best practices

Keep it under 200 words. End with a brief medical disclaimer.`;

  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: hardenedSystemPrompt(BASE_SYSTEM_PROMPT, fullContext),
    prompt,
    maxOutputTokens: outputBudget(tier, 512),
  });

  return result.toTextStreamResponse({ headers: AI_CORS_HEADERS });
}
