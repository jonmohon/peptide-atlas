export type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'preclinical';

export type PeptideCategory =
  | 'growth-hormone'
  | 'healing-repair'
  | 'cognitive'
  | 'metabolic'
  | 'immune'
  | 'sexual-health'
  | 'longevity'
  | 'sleep-recovery';

export type AdministrationRoute = 'subcutaneous' | 'oral' | 'nasal' | 'topical' | 'intramuscular';

export interface DosingProtocol {
  route: AdministrationRoute;
  typicalDose: string;
  frequency: string;
  cycleLength: string;
  notes?: string;
}

export interface TimelinePhase {
  label: string;
  weekStart: number;
  weekEnd: number;
  description: string;
}

export interface RegionEffect {
  regionId: import('./body').RegionId;
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export interface PeptideRatings {
  efficacy: number;
  evidence: number;
  easeOfUse: number;
  cost: number;
  safety: number;
  popularity: number;
}

export interface Peptide {
  id: string;
  slug: string;
  name: string;
  abbreviation: string;
  fullName: string;
  category: PeptideCategory;
  description: string;
  effects: string[];
  affectedRegions: RegionEffect[];
  commonStacks: string[];
  dosing: DosingProtocol;
  timeline: TimelinePhase[];
  evidenceLevel: EvidenceLevel;
  ratings: PeptideRatings;
  keyStudies?: string[];
  contraindications?: string[];
  sideEffects?: string[];
}
