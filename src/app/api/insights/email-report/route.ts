/**
 * Generates a weekly or monthly journal insight using the existing AI prompt
 * (non-streaming) and emails it to the authenticated user via Resend.
 * The client fetches the entries + profile and passes them in the request body.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { JOURNAL_INSIGHT_PROMPT } from '@/lib/ai/prompts';
import { buildUserContext } from '@/lib/ai/user-context';
import { auth } from '@/lib/auth';
import { sendEmail, renderInsightsEmail } from '@/lib/email';

export const maxDuration = 60;

interface JournalEntry {
  date: string;
  peptideDoses?: unknown;
  weight?: number | null;
  bodyFat?: number | null;
  mood?: number | null;
  energy?: number | null;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  sideEffects?: unknown;
  dietNotes?: string | null;
  subjectiveNotes?: string | null;
}

function summarizeEntries(entries: JournalEntry[]): string {
  return entries
    .map((e) => {
      const parts: string[] = [`Date: ${e.date}`];
      if (e.peptideDoses) parts.push(`Doses: ${JSON.stringify(e.peptideDoses)}`);
      if (e.mood != null) parts.push(`Mood: ${e.mood}/10`);
      if (e.energy != null) parts.push(`Energy: ${e.energy}/10`);
      if (e.sleepQuality != null) parts.push(`Sleep: ${e.sleepQuality}/10 (${e.sleepHours ?? '?'}hrs)`);
      if (e.weight != null) parts.push(`Weight: ${e.weight}`);
      if (e.sideEffects) parts.push(`Side effects: ${JSON.stringify(e.sideEffects)}`);
      if (e.dietNotes) parts.push(`Diet: ${e.dietNotes}`);
      return parts.join(' | ');
    })
    .join('\n');
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

  if (!session.user.email) {
    return new Response(JSON.stringify({ error: 'No email on file' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json().catch(() => ({}))) as {
    period?: 'weekly' | 'monthly';
    entries?: JournalEntry[];
    name?: string;
  };
  const period = body.period === 'monthly' ? 'monthly' : 'weekly';
  const entries = body.entries ?? [];
  const days = period === 'weekly' ? 7 : 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().split('T')[0];

  const filtered = entries.filter((e) => e.date >= cutoffISO);

  if (filtered.length < 3) {
    return new Response(
      JSON.stringify({
        error: `Need at least 3 journal entries in the last ${days} days. You have ${filtered.length}.`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const userContext = await buildUserContext(session.user.id);

  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${JOURNAL_INSIGHT_PROMPT}${userContext}`,
    prompt: `Generate a ${period} insight report for the following journal entries:\n\n${summarizeEntries(filtered)}\n\nPeriod: ${period}\nNumber of entries: ${filtered.length}`,
    maxOutputTokens: 2048,
  });

  const summary = result.text.trim();
  const now = new Date();
  const rangeLabel = `${cutoffISO} → ${now.toISOString().split('T')[0]}`;
  const atlasUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://peptide-atlas.app';

  const name = (body.name ?? session.user.name ?? 'there').split(' ')[0];

  const { html, text, subject } = renderInsightsEmail({
    name,
    period,
    summary,
    rangeLabel,
    atlasUrl: `${atlasUrl}/atlas/journal/insights`,
  });

  const email = await sendEmail({
    to: session.user.email,
    subject,
    html,
    text,
  });

  return new Response(
    JSON.stringify({
      ok: email.ok,
      error: email.error,
      summary,
      rangeLabel,
      entryCount: filtered.length,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
