/**
 * Parses a bloodwork PDF or image upload into structured markers using Claude vision.
 * Accepts base64-encoded file + mediaType in JSON body; returns BloodworkParse JSON.
 * Pro+ only; 10 MB max per file.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { bloodworkParseSchema } from '@/lib/ai/schemas';
import { auth } from '@/lib/auth';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';

export const maxDuration = 60;
export const OPTIONS = aiOptions;

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const SYSTEM_PROMPT = `You are a clinical lab data extractor. Given a lab report (PDF or image), extract every marker you can find into a structured JSON schema.

Rules:
1. Use the canonical marker name, not the lab-specific spelling (e.g., "IGF-1" not "Somatomedin C", "Testosterone (Total)" not "Total Test").
2. Extract the numeric value exactly as reported.
3. Include the unit exactly as reported.
4. Include the reference range exactly as the lab states it.
5. Flag each marker normal/high/low based on whether the value falls inside, above, or below the reference range. If the value is at the boundary, flag normal.
6. collectionDate should be the specimen/collection date, not the report date, in ISO format (YYYY-MM-DD). If you cannot determine it, return null.
7. If text is illegible or ambiguous, skip that marker and add a one-line entry to warnings.
8. Do NOT interpret, diagnose, or advise. Only extract data. This is a data-extraction task, not a clinical review.
9. If the file is not a lab report, return an empty markers array and a clear warning.

Common markers to watch for (use these canonical names when present):
IGF-1, Testosterone (Total), Testosterone (Free), Estradiol (E2), SHBG, DHT, Progesterone,
TSH, Free T4, Free T3, Reverse T3, Thyroid Antibodies,
Fasting Glucose, HbA1c, Fasting Insulin, HOMA-IR, C-Peptide,
ALT, AST, GGT, ALP, Bilirubin, Albumin,
BUN, Creatinine, eGFR, Cystatin C,
Total Cholesterol, LDL, HDL, Triglycerides, ApoB, Lp(a),
Hemoglobin, Hematocrit, MCV, Platelets, WBC, Ferritin, Iron, TIBC, Transferrin Saturation,
CRP (hs), Homocysteine, Fibrinogen, D-Dimer,
Vitamin D (25-OH), Vitamin B12, Folate, Magnesium, Potassium, Sodium, Calcium, Phosphorus,
Cortisol, DHEA-S, Pregnenolone, ACTH.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS },
    });
  }

  const session = await auth(req);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Sign in required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS },
    });
  }

  let body: { fileBase64?: string; mediaType?: string; fileName?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS },
    });
  }

  const { fileBase64, mediaType } = body;
  if (!fileBase64 || !mediaType) {
    return new Response(
      JSON.stringify({ error: 'Missing fileBase64 or mediaType' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } },
    );
  }

  if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
    return new Response(
      JSON.stringify({
        error: `Unsupported mediaType. Allowed: ${Array.from(ALLOWED_MEDIA_TYPES).join(', ')}`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } },
    );
  }

  const approxBytes = Math.ceil((fileBase64.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    return new Response(
      JSON.stringify({ error: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit` }),
      { status: 413, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } },
    );
  }

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: fileBase64,
            mediaType,
          },
          {
            type: 'text',
            text: 'Extract every marker from this lab report into the structured schema. Follow the rules in the system prompt. Return only valid JSON.',
          },
        ],
      },
    ],
    schema: bloodworkParseSchema,
    maxOutputTokens: 4096,
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS },
  });
}
