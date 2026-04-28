/**
 * Streaming AI endpoint that analyses a batch of journal entries for a given period
 * (weekly/monthly) and returns a personalized insight report (max 2048 output tokens).
 */

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { JOURNAL_INSIGHT_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';

export const maxDuration = 30;
export const OPTIONS = aiOptions;

export async function POST(req: Request) {
  const { entries, period } = await req.json();

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

  const userContext = await buildUserContext(session.user.id);

  const entrySummary = entries
    .map((e: Record<string, unknown>) => {
      const parts: string[] = [`Date: ${e.date}`];
      if (e.peptideDoses) parts.push(`Doses: ${JSON.stringify(e.peptideDoses)}`);
      if (e.mood) parts.push(`Mood: ${e.mood}/10`);
      if (e.energy) parts.push(`Energy: ${e.energy}/10`);
      if (e.sleepQuality) parts.push(`Sleep: ${e.sleepQuality}/10 (${e.sleepHours}hrs)`);
      if (e.weight) parts.push(`Weight: ${e.weight}`);
      if (e.sideEffects) parts.push(`Side effects: ${JSON.stringify(e.sideEffects)}`);
      if (e.dietNotes) parts.push(`Diet: ${e.dietNotes}`);
      return parts.join(' | ');
    })
    .join('\n');

  const prompt = `Generate a ${period} insight report for the following journal entries:\n\n${entrySummary}\n\nPeriod: ${period}\nNumber of entries: ${entries.length}`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${JOURNAL_INSIGHT_PROMPT}${userContext}`,
    prompt,
    maxOutputTokens: 2048,
  });

  return result.toTextStreamResponse({ headers: AI_CORS_HEADERS });
}
