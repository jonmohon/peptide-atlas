/**
 * Zod schemas for the multi-stage protocol generator.
 *
 * The pipeline runs:
 *   1. drafter — produces a typed Protocol matching `protocolSchema` (Opus 4.7)
 *   2. critic  — reviews against user profile, returns Critique (Opus 4.7);
 *                if approved=false, must include a corrected protocol in `revised`
 *   3. format  — server uses critique.revised || draft directly; markdownBody
 *                is what the mobile renders.
 *
 * Forcing the model to populate `markdownBody` as part of the structured
 * output means we get both safe structured data (for future filtering/analytics)
 * AND a ready-to-display response with no second formatter call.
 */

import { z } from 'zod';

export const peptideEntrySchema = z.object({
  peptideId: z
    .string()
    .describe(
      'The peptide ID slug from the Peptide Atlas catalog (e.g. bpc-157, retatrutide). Must be exactly the catalog slug — lowercase, hyphen-separated. Never invent a peptide that is not in the catalog.'
    ),
  role: z.enum(['primary', 'synergist', 'support']),
  dose: z.string().describe('Per-injection dose, e.g. "250mcg", "2.5mg".'),
  frequency: z.string().describe('Frequency, e.g. "1x daily AM", "2x weekly".'),
  route: z
    .enum(['subcutaneous', 'intramuscular', 'oral', 'nasal', 'topical'])
    .describe('Administration route — must match the catalog entry for this peptide.'),
  durationWeeks: z
    .number()
    .int()
    .min(1)
    .max(52)
    .describe('How many weeks this peptide is taken within the cycle.'),
  notes: z.string().describe('Why this peptide is included; any timing or technique notes.'),
});

export const protocolSchema = z.object({
  summary: z.string().describe('One-paragraph overview of the protocol — what it does and for whom.'),
  peptides: z
    .array(peptideEntrySchema)
    .min(1)
    .max(5)
    .describe('Components of the protocol. Prefer 2–4; only go to 5 when synergy is clearly justified.'),
  totalDurationWeeks: z.number().int().min(1).max(52),
  monitoringLabs: z
    .array(z.string())
    .describe('Lab markers to track (e.g. "Total testosterone", "IGF-1", "HbA1c"). Be specific.'),
  expectedTimeline: z
    .string()
    .describe('Brief week-by-week progression of expected effects.'),
  warnings: z
    .array(z.string())
    .describe(
      'Warnings specific to THIS user given their profile (allergies, conditions, sex, age). Include at least one if any risk exists.'
    ),
  markdownBody: z
    .string()
    .describe(
      'Final formatted markdown response shown to the user. Use **bold** for peptide names + section headers, bullets for dose lines, and a horizontal rule before the disclaimer. End with: "*This is educational information, not medical advice. Consult a licensed clinician before starting any protocol.*"'
    ),
});

export type Protocol = z.infer<typeof protocolSchema>;

export const critiqueIssueSchema = z.object({
  severity: z
    .enum(['critical', 'high', 'medium', 'low'])
    .describe(
      'critical = active contraindication or dangerous dose; high = significant safety concern; medium = best-practice issue; low = stylistic.'
    ),
  description: z.string(),
  affectedPeptideId: z.string().optional(),
});

export const critiqueSchema = z.object({
  approved: z
    .boolean()
    .describe('true only if the protocol is safe and accurate as-is. Any critical/high issue → false.'),
  issues: z.array(critiqueIssueSchema).describe('All issues found, even when approved=true.'),
  revised: protocolSchema
    .nullable()
    .describe('If approved=false, the corrected protocol that fixes every critical/high issue.'),
});

export type Critique = z.infer<typeof critiqueSchema>;
