/**
 * Cheap one-sentence insight returned right after a journal save.
 * Uses Haiku for low latency + cost. Observes patterns in the last N entries
 * (energy/mood/sleep/sides) and returns a single actionable observation.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';

export const maxDuration = 15;

const SYSTEM_PROMPT = `You are PeptideAtlas Micro-Insight. Given a user's last 7 journal entries, return ONE short observation (≤ 140 chars) that highlights a pattern worth knowing.

Rules:
1. Must be one sentence, ≤ 140 chars.
2. Ground it in the data. Do not invent numbers.
3. Prefer observations tied to sleep/energy/mood/side-effects/doses over vague platitudes.
4. If no clear pattern exists, return an encouraging note about continued tracking.
5. No disclaimers, no medical advice, no emojis.
6. Plain text, no markdown.`;

interface JournalEntry {
  date: string;
  peptideDoses?: unknown;
  mood?: number | null;
  energy?: number | null;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  weight?: number | null;
  sideEffects?: unknown;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Sign in required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json().catch(() => ({}))) as { entries?: JournalEntry[] };
  const entries = (body.entries ?? []).slice(0, 14);

  if (entries.length < 2) {
    return new Response(
      JSON.stringify({
        insight: 'Nice — keep logging daily. Patterns start showing up after about a week.',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  const summary = entries
    .map((e) => {
      const parts: string[] = [e.date];
      if (e.mood != null) parts.push(`mood=${e.mood}`);
      if (e.energy != null) parts.push(`energy=${e.energy}`);
      if (e.sleepQuality != null) parts.push(`sleep=${e.sleepQuality}/${e.sleepHours ?? '?'}h`);
      if (e.weight != null) parts.push(`weight=${e.weight}`);
      if (e.sideEffects && Array.isArray(e.sideEffects) && e.sideEffects.length > 0) {
        parts.push(`sides=${e.sideEffects.length}`);
      }
      return parts.join(' ');
    })
    .join(' | ');

  const result = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: SYSTEM_PROMPT,
    prompt: `Recent entries:\n${summary}\n\nReturn one observation.`,
    maxOutputTokens: 120,
  });

  return new Response(
    JSON.stringify({ insight: result.text.trim().replace(/^["'`]|["'`]$/g, '') }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
