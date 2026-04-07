import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { PROTOCOL_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { goals, experience, preferences } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const prompt = `Generate a personalized peptide protocol for someone with the following profile:
Goals: ${goals.join(', ')}
Experience Level: ${experience}
${preferences ? `Preferences: ${preferences}` : ''}

Provide a detailed, structured protocol recommendation.`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: PROTOCOL_SYSTEM_PROMPT,
    prompt,
    maxTokens: 2048,
  });

  return result.toDataStreamResponse();
}
