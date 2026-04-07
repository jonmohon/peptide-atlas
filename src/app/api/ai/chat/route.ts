import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: CHAT_SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
