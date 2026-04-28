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

export type DiluentType = 'bacteriostatic-water' | 'sterile-water' | 'saline';

export interface ReconstitutionInfo {
  commonVialSizes: number[];        // mg (e.g. [2, 5, 10])
  storageTempCelsius: number;       // refrigerated storage temp
  shelfLifeReconstitutedDays: number; // days after reconstitution
  diluentType: DiluentType;
  typicalDoseMcg: number;           // typical dose in mcg for calculator defaults
}

export interface KeyStudy {
  pmid: string;          // PubMed ID
  title: string;
  year: number;
  finding: string;       // 1-sentence summary of key finding
}

export interface DrugInteraction {
  substance: string;     // medication, supplement, or peptide name
  type: 'medication' | 'supplement' | 'peptide';
  severity: 'mild' | 'moderate' | 'serious';
  description: string;
}

export type SideEffectFrequency = 'common' | 'uncommon' | 'rare';
export type SideEffectSeverity = 'mild' | 'moderate' | 'severe';

export interface DetailedSideEffect {
  name: string;
  frequency: SideEffectFrequency;
  severity: SideEffectSeverity;
  notes?: string;
}

/**
 * Confidence in the catalog entry's accuracy:
 *   verified     — claims cross-checked against literature; PMIDs validated
 *                  on PubMed; reviewed within the last 6 months.
 *   likely       — primary claims sourced but not all citations re-verified.
 *   preliminary  — written from general knowledge; requires review.
 */
export type DataConfidence = 'verified' | 'likely' | 'preliminary';

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
  keyStudies?: KeyStudy[];
  interactions?: DrugInteraction[];
  detailedSideEffects?: DetailedSideEffect[];
  contraindications?: string[];
  sideEffects?: string[];
  reconstitution?: ReconstitutionInfo;
  halfLifeHours?: number;
  /** When was this entry last reviewed against literature (ISO date). */
  lastReviewedAt?: string;
  /** Confidence in the data accuracy. Defaults to 'preliminary' if absent. */
  confidence?: DataConfidence;
}
