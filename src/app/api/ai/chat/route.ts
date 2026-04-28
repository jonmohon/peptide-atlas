import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { badRequest, enforceInputLimits, hardenedSystemPrompt, outputBudget } from '@/lib/ai/safety';

export const maxDuration = 30;
export const OPTIONS = aiOptions;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const body = await req.json();
  const { messages, userContext: clientContext } = body;

  // auth(req) accepts Bearer tokens (mobile) or falls back to cookies (web).
  const session = await auth(req);
  const tier = session?.user?.tier ?? 'FREE';

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const system = hardenedSystemPrompt(CHAT_SYSTEM_PROMPT, fullContext);

  // Accept both UI shape (web's useChat — { id, role, parts }) and the simpler
  // ModelMessage shape (mobile sends — { role, content }). If the first item has
  // `parts`, treat the array as UIMessage[] and convert; otherwise pass through.
  const first = Array.isArray(messages) ? messages[0] : null;
  const looksLikeUI = first && typeof first === 'object' && 'parts' in first;
  const modelMessages = looksLikeUI
    ? convertToModelMessages(messages as UIMessage[])
    : messages;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages: modelMessages,
    maxOutputTokens: outputBudget(tier, 1024),
  });

  return result.toUIMessageStreamResponse({ headers: AI_CORS_HEADERS });
}
