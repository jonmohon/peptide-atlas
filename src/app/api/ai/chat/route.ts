import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const { messages, userContext: clientContext } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  // auth(req) accepts Bearer tokens (mobile) or falls back to cookies (web).
  const session = await auth(req);
  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const system = `${CHAT_SYSTEM_PROMPT}${fullContext}`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    messages,
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse({
    headers: CORS_HEADERS,
  });
}
