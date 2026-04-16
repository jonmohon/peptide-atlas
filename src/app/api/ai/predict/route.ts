import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { BASE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 15;

export async function POST(req: Request) {
  const { peptideIds, level = 'intermediate' } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const selectedPeptides = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter(Boolean);

  const peptideList = selectedPeptides
    .map((p: (typeof peptides)[0]) => `${p.name}: ${p.description}`)
    .join('\n');

  const prompt = `Write a concise "What to Expect" summary for someone using these peptides together:
${peptideList}

Knowledge level: ${level}

Include:
1. A brief summary (2-3 sentences)
2. Timeline broken into phases (Week 1-2, Week 3-4, Week 5+)
3. What to monitor/watch for
4. Best practices

Keep it under 200 words. End with a brief medical disclaimer.`;

  const session = await auth();
  const userContext = session?.user?.id ? await buildUserContext(session.user.id) : '';

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: `${BASE_SYSTEM_PROMPT}${userContext}`,
    prompt,
    maxOutputTokens: 512,
  });

  return result.toTextStreamResponse();
}
