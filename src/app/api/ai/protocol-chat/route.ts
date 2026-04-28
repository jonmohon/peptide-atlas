/**
 * Streaming AI chat endpoint for protocol-aware conversations.
 * Requires authentication; injects user context into the system prompt before streaming
 * via the Vercel AI SDK (claude-sonnet-4-6, max 1024 output tokens).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { PROTOCOL_CHAT_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';

export const maxDuration = 30;
export const OPTIONS = aiOptions;

export async function POST(req: Request) {
  const { messages, userContext: clientContext } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const session = await auth(req);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: 'Sign in to use Protocol Chat' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const serverContext = await buildUserContext(session.user.id);
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;
  const system = `${PROTOCOL_CHAT_PROMPT}${fullContext}`;

  // Mirror the same dual-shape handling as /api/ai/chat.
  const first = Array.isArray(messages) ? messages[0] : null;
  const looksLikeUI = first && typeof first === 'object' && 'parts' in first;
  const modelMessages = looksLikeUI
    ? convertToModelMessages(messages as UIMessage[])
    : messages;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages: modelMessages,
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse({ headers: AI_CORS_HEADERS });
}
