import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { COMPARISON_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { peptides } from '@/data/peptides';

export const maxDuration = 20;

export async function POST(req: Request) {
  const { peptideIds } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const selected = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter(Boolean);

  const desc = selected
    .map(
      (p: (typeof peptides)[0]) =>
        `${p.name}: ${p.description} Effects: ${p.effects.join(', ')}`
    )
    .join('\n');

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: COMPARISON_SYSTEM_PROMPT,
    prompt: `Compare these peptides:\n${desc}`,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
