import type { ReconstitutionInfo } from '@/types/peptide';

/**
 * Reconstitution data for injectable peptides.
 * Key is the peptide ID from the peptides database.
 */
export const reconstitutionData: Record<string, ReconstitutionInfo> = {
  'bpc-157': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 250,
  },
  'tb-500': {
    commonVialSizes: [2, 5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 2500,
  },
  'ghk-cu': {
    commonVialSizes: [5, 10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'cjc-1295': {
    commonVialSizes: [2, 5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 300,
  },
  'ipamorelin': {
    commonVialSizes: [2, 5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'tesamorelin': {
    commonVialSizes: [2],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 14,
    diluentType: 'sterile-water',
    typicalDoseMcg: 2000,
  },
  'sermorelin': {
    commonVialSizes: [2, 5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 300,
  },
  'ghrp-2': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'ghrp-6': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'hexarelin': {
    commonVialSizes: [2, 5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'pt-141': {
    commonVialSizes: [10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 1750,
  },
  'melanotan-ii': {
    commonVialSizes: [10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 500,
  },
  'selank': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 300,
  },
  'semax': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 600,
  },
  'dihexa': {
    commonVialSizes: [10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 200,
  },
  'na-selank': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 300,
  },
  'na-semax': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 600,
  },
  'aod-9604': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 300,
  },
  'mots-c': {
    commonVialSizes: [5, 10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 5000,
  },
  'ss-31': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'sterile-water',
    typicalDoseMcg: 500,
  },
  'epithalon': {
    commonVialSizes: [10],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 28,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 5000,
  },
  'thymosin-alpha-1': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 14,
    diluentType: 'sterile-water',
    typicalDoseMcg: 1600,
  },
  'kpv': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 500,
  },
  'll-37': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 14,
    diluentType: 'sterile-water',
    typicalDoseMcg: 100,
  },
  'vip': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 14,
    diluentType: 'sterile-water',
    typicalDoseMcg: 50,
  },
  'dsip': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 21,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 100,
  },
  'kisspeptin-10': {
    commonVialSizes: [5],
    storageTempCelsius: 4,
    shelfLifeReconstitutedDays: 14,
    diluentType: 'sterile-water',
    typicalDoseMcg: 1000,
  },
  'mk-677': {
    // MK-677 is oral, not injectable — no reconstitution needed
    commonVialSizes: [],
    storageTempCelsius: 20,
    shelfLifeReconstitutedDays: 0,
    diluentType: 'bacteriostatic-water',
    typicalDoseMcg: 25000,
  },
};

/**
 * Returns reconstitution info for a peptide, or undefined if not available.
 * Peptides with empty commonVialSizes (like MK-677) are oral and don't need reconstitution.
 */
export function getReconstitutionInfo(peptideId: string): ReconstitutionInfo | undefined {
  const info = reconstitutionData[peptideId];
  if (!info || info.commonVialSizes.length === 0) return undefined;
  return info;
}
