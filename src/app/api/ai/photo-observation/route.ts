/**
 * Returns an AI-generated observation for a single progress photo (or a comparison between two).
 * Receives base64 image data from the client — no server-side S3 fetch required.
 * Pro+ only.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

const BASE_PROMPT = `You are an observational fitness analyst helping a user track visible physical changes in their peptide protocol.

Rules:
1. Describe what you observe objectively: posture, apparent muscle definition, symmetry, visible body-composition changes, skin/hair appearance, general physique notes.
2. Do NOT diagnose medical conditions.
3. Do NOT estimate body-fat percentages as precise numbers — use qualitative ranges only ("appears moderate to low body fat").
4. Focus on observable, physique-relevant details. Skip non-physique context like background or clothing beyond what affects visibility.
5. If comparing two photos, call out specific changes: what increased, decreased, or appears unchanged.
6. Use 2–4 short sentences unless comparing, then up to 6.
7. End with one concrete, actionable observation tied to the user's goals if context is provided.
8. If the photo is unsuitable (not visible physique, too dark, cropped), say so briefly.
9. Stay encouraging but evidence-based. Do not hype changes that aren't visible.`;

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

  let body: {
    photo?: { base64: string; mediaType: string; angle?: string; date?: string };
    baseline?: { base64: string; mediaType: string; angle?: string; date?: string };
    weight?: number;
    bodyFat?: number;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.photo) {
    return new Response(JSON.stringify({ error: 'photo is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const files = [body.photo];
  if (body.baseline) files.push(body.baseline);

  for (const f of files) {
    if (!ALLOWED.has(f.mediaType)) {
      return new Response(
        JSON.stringify({ error: `Unsupported mediaType. Allowed: ${Array.from(ALLOWED).join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
    const approxBytes = Math.ceil((f.base64.length * 3) / 4);
    if (approxBytes > MAX_BYTES) {
      return new Response(
        JSON.stringify({ error: `Image exceeds ${MAX_BYTES / 1024 / 1024} MB` }),
        { status: 413, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const userContext = await buildUserContext(session.user.id);
  const comparing = !!body.baseline;

  const metrics: string[] = [];
  if (body.weight != null) metrics.push(`Weight: ${body.weight} lbs`);
  if (body.bodyFat != null) metrics.push(`Body fat: ${body.bodyFat}%`);

  const textPrompt = comparing
    ? `Compare the two photos for visible physique changes. The first photo is the baseline (earlier), the second is the latest. Call out specific changes in muscle definition, symmetry, body composition, and posture.${metrics.length ? `\n\nLogged metrics for latest: ${metrics.join(', ')}.` : ''}${body.photo.date && body.baseline?.date ? `\n\nBaseline date: ${body.baseline.date}. Latest date: ${body.photo.date}.` : ''}`
    : `Describe what you observe in this progress photo.${metrics.length ? `\n\nLogged metrics: ${metrics.join(', ')}.` : ''}${body.photo.angle ? `\n\nAngle: ${body.photo.angle}.` : ''}`;

  const content: Array<
    | { type: 'text'; text: string }
    | { type: 'file'; data: string; mediaType: string }
  > = [];
  if (body.baseline) {
    content.push({ type: 'text', text: 'BASELINE photo:' });
    content.push({ type: 'file', data: body.baseline.base64, mediaType: body.baseline.mediaType });
    content.push({ type: 'text', text: 'LATEST photo:' });
  }
  content.push({ type: 'file', data: body.photo.base64, mediaType: body.photo.mediaType });
  content.push({ type: 'text', text: textPrompt });

  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${BASE_PROMPT}${userContext}`,
    messages: [{ role: 'user', content }],
    maxOutputTokens: 512,
  });

  return new Response(JSON.stringify({ observation: result.text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
