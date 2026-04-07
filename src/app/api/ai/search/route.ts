import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { SEARCH_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { searchResultSchema } from '@/lib/ai/schemas';

export const maxDuration = 15;

export async function POST(req: Request) {
  const { query } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: SEARCH_SYSTEM_PROMPT,
    prompt: `Find the most relevant peptides for this query: "${query}"`,
    schema: searchResultSchema,
    maxOutputTokens: 512,
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json' },
  });
}
