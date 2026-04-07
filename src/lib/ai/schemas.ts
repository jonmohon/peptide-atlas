import { z } from 'zod';

export const searchResultSchema = z.object({
  results: z.array(
    z.object({
      peptideId: z.string().describe('The ID of the peptide from the database'),
      relevanceScore: z.number().min(1).max(10).describe('Relevance score 1-10'),
      explanation: z.string().describe('One sentence explaining why this peptide matches'),
    })
  ),
  suggestedCategory: z.string().optional().describe('Suggested category to explore'),
});

export const stackAnalysisSchema = z.object({
  overallScore: z.number().min(1).max(10).describe('Overall synergy score'),
  synergies: z.array(
    z.object({
      peptideA: z.string(),
      peptideB: z.string(),
      type: z.enum(['synergistic', 'complementary', 'neutral', 'redundant', 'conflicting']),
      explanation: z.string(),
    })
  ),
  issues: z.array(
    z.object({
      severity: z.enum(['low', 'medium', 'high']),
      description: z.string(),
    })
  ),
  suggestions: z.array(
    z.object({
      action: z.enum(['add', 'remove', 'replace']),
      peptide: z.string(),
      reason: z.string(),
    })
  ),
  timingSchedule: z.array(
    z.object({
      peptide: z.string(),
      timeOfDay: z.string(),
      withFood: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

export const protocolSchema = z.object({
  overview: z.string().describe('Brief protocol overview'),
  peptides: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
    })
  ),
  timeline: z.array(
    z.object({
      week: z.string(),
      milestone: z.string(),
    })
  ),
  expectedResults: z.array(z.string()),
  warnings: z.array(z.string()),
  disclaimer: z.string(),
});

export type SearchResult = z.infer<typeof searchResultSchema>;
export type StackAnalysis = z.infer<typeof stackAnalysisSchema>;
export type Protocol = z.infer<typeof protocolSchema>;
