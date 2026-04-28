import type { RegionId } from './body';

export type EffectCategory =
  | 'body-composition'
  | 'healing'
  | 'cognitive'
  | 'longevity'
  | 'sleep'
  | 'sexual'
  | 'immune';

export interface Effect {
  id: string;
  label: string;
  category: EffectCategory;
  description: string;
  primaryRegions: RegionId[];
  relatedPeptideIds: string[];
  icon: string;
}
