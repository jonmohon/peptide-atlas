/**
 * Zod schemas for the multi-stage bloodwork interpretation pipeline.
 *
 * Same shape as the protocol pipeline:
 *   1. drafter — Opus 4.7 generateObject → BloodworkInterpretation JSON
 *   2. critic  — Opus 4.7 generateObject → Critique JSON; if any marker is
 *                misclassified or any finding crosses into clinical advice
 *                instead of education, must return revised
 *   3. format  — server chunks markdownBody to client as text-delta SSE
 */

import { z } from 'zod';

const findingSchema = z.object({
  marker: z.string().describe('Canonical marker name (Total Testosterone, IGF-1, etc).'),
  status: z
    .enum(['optimal', 'in_range', 'low', 'high', 'concerning'])
    .describe(
      'optimal = within target sub-range; in_range = within reference but not optimal; low/high = outside reference; concerning = far outside or pattern signals risk.'
    ),
  interpretation: z
    .string()
    .describe('What the value tells us in plain educational language.'),
  significance: z.string().describe('Why this matters for the user given their goals/protocol.'),
  actionable: z
    .string()
    .nullable()
    .describe(
      'Educational suggestion (lifestyle, follow-up labs, things to discuss with clinician). Never a specific dose or drug recommendation.'
    ),
});

const patternSchema = z.object({
  description: z.string(),
  relatedMarkers: z.array(z.string()),
});

export const bloodworkInterpretationSchema = z.object({
  summary: z.string().describe('One paragraph high-level read of the panel.'),
  findings: z
    .array(findingSchema)
    .describe('One entry per marker; ordered by clinical relevance (concerning first).'),
  patterns: z
    .array(patternSchema)
    .describe('Multi-marker patterns (e.g. metabolic syndrome signal, low-T pattern).'),
  followUp: z
    .array(z.string())
    .describe(
      'Suggested follow-up actions in education terms (re-test markers, discuss with clinician, lifestyle).'
    ),
  warnings: z
    .array(z.string())
    .describe('Specific safety concerns for this user (e.g. interaction risk with current peptide).'),
  markdownBody: z
    .string()
    .describe(
      'Final formatted markdown shown to user. Use ## for sections, **bold** for marker names, bullets for findings. End with: "*This is educational information, not medical advice. Discuss your bloodwork with a licensed clinician.*"'
    ),
});

export type BloodworkInterpretation = z.infer<typeof bloodworkInterpretationSchema>;

export const bloodworkCritiqueSchema = z.object({
  approved: z.boolean(),
  issues: z.array(
    z.object({
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      description: z.string(),
    })
  ),
  revised: bloodworkInterpretationSchema.nullable(),
});

export type BloodworkCritique = z.infer<typeof bloodworkCritiqueSchema>;
