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
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { badRequest, enforceInputLimits, hardenedSystemPrompt, outputBudget } from '@/lib/ai/safety';

export const maxDuration = 30;
export const OPTIONS = aiOptions;

const MAX_MARKERS = 60;

export async function POST(req: Request) {
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
      JSON.stringify({ error: 'Sign in required' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }
  const tier = session.user.tier;

  const body = await req.json();
  const { markers, labDate } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  if (!Array.isArray(markers) || markers.length === 0) {
    return badRequest('markers array required', AI_CORS_HEADERS);
  }
  if (markers.length > MAX_MARKERS) {
    return badRequest(`Max ${MAX_MARKERS} markers per request`, AI_CORS_HEADERS);
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
    system: hardenedSystemPrompt(BLOODWORK_INTERPRETATION_PROMPT, userContext),
    prompt,
    maxOutputTokens: outputBudget(tier, 1500),
  });

  return result.toTextStreamResponse({ headers: AI_CORS_HEADERS });
}
