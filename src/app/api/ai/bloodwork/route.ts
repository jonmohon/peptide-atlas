/**
 * Streaming AI endpoint for bloodwork interpretation.
 * Accepts an array of lab markers with reference ranges and streams an educational
 * analysis (not medical advice) using the BLOODWORK_INTERPRETATION_PROMPT system prompt.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { BLOODWORK_INTERPRETATION_PROMPT } from '@/lib/ai/prompts';
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
  const { markers, labDate } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const session = await auth(req);
  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: 'Sign in required' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const userContext = await buildUserContext(session.user.id);

  const markerSummary = markers
    .map((m: { name: string; value: number; unit: string; referenceRange?: string }) =>
      `${m.name}: ${m.value} ${m.unit}${m.referenceRange ? ` (ref: ${m.referenceRange})` : ''}`
    )
    .join('\n');

  const prompt = `Interpret this bloodwork panel from ${labDate || 'recent labs'}:\n\n${markerSummary}`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${BLOODWORK_INTERPRETATION_PROMPT}${userContext}`,
    prompt,
    maxOutputTokens: 1536,
  });

  return result.toTextStreamResponse({ headers: CORS_HEADERS });
}
