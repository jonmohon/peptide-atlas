/**
 * Streaming AI chat endpoint for protocol-aware conversations.
 * Requires authentication; injects user context into the system prompt before streaming
 * via the Vercel AI SDK (claude-sonnet-4-6, max 1024 output tokens).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { PROTOCOL_CHAT_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

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

  const session = await auth();
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: 'Sign in to use Protocol Chat' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userContext = await buildUserContext(session.user.id);
  const system = `${PROTOCOL_CHAT_PROMPT}${userContext}`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages,
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
