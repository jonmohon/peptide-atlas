import type { PeptideRatings } from './peptide';

export type ComparisonAxis = keyof PeptideRatings;

export interface ComparisonData {
  peptideIds: string[];
  axes: ComparisonAxis[];
}
