import type { RegionId } from './body';

export interface StackPeptide {
  peptideId: string;
  role: 'primary' | 'synergist' | 'support';
  notes?: string;
}

export interface Stack {
  id: string;
  name: string;
  slug: string;
  goal: string;
  description: string;
  peptides: StackPeptide[];
  combinedEffects: string[];
  highlightedRegions: { regionId: RegionId; intensity: number }[];
  icon: string;
}
