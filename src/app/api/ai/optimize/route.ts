import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { STACK_OPTIMIZER_PROMPT } from '@/lib/ai/prompts';
import { stackAnalysisSchema } from '@/lib/ai/schemas';
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

  const stackPeptides = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter(Boolean);

  const stackDescription = stackPeptides
    .map(
      (p: (typeof peptides)[0]) =>
        `${p.name}: ${p.description} Effects: ${p.effects.join(', ')}`
    )
    .join('\n');

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system: STACK_OPTIMIZER_PROMPT,
    prompt: `Analyze this peptide stack:\n${stackDescription}`,
    schema: stackAnalysisSchema,
    maxOutputTokens: 1536,
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json' },
  });
}
