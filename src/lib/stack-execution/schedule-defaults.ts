/**
 * Heuristic defaults for when to inject each peptide class during the day.
 * No AI required — the rules are well-established in the community.
 * Returns a time-of-day slot that the wizard uses to pre-populate step 5.
 */

import type { Peptide, PeptideCategory } from '@/types/peptide';

export type TimeSlot = 'morning' | 'preworkout' | 'evening' | 'bedtime' | 'weekly' | 'flexible';

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: 'Morning (AM, fasted)',
  preworkout: 'Pre-workout (30–60 min before)',
  evening: 'Evening',
  bedtime: 'Bedtime (fasted ≥2h)',
  weekly: 'Weekly (same day each week)',
  flexible: 'Flexible (any time)',
};

export const TIME_SLOT_HHMM: Record<TimeSlot, string> = {
  morning: '07:30',
  preworkout: '16:30',
  evening: '19:00',
  bedtime: '22:30',
  weekly: '09:00',
  flexible: '08:00',
};

const CATEGORY_DEFAULT: Record<PeptideCategory, TimeSlot> = {
  'growth-hormone': 'bedtime',
  'healing-repair': 'flexible',
  cognitive: 'morning',
  metabolic: 'weekly',
  immune: 'morning',
  'sexual-health': 'evening',
  longevity: 'bedtime',
  'sleep-recovery': 'bedtime',
};

const PEPTIDE_OVERRIDES: Record<string, TimeSlot> = {
  bpc157: 'flexible',
  'bpc-157': 'flexible',
  'tb-500': 'flexible',
  'tb500': 'flexible',
  'ghk-cu': 'evening',
  semax: 'morning',
  selank: 'morning',
  epithalon: 'bedtime',
  'mots-c': 'morning',
  'cjc-1295': 'bedtime',
  ipamorelin: 'bedtime',
  tesamorelin: 'bedtime',
  'ghrp-6': 'preworkout',
  'ghrp-2': 'preworkout',
  semaglutide: 'weekly',
  tirzepatide: 'weekly',
  retatrutide: 'weekly',
  'mt-2': 'evening',
  'pt-141': 'evening',
  kisspeptin: 'evening',
};

export function defaultTimeSlot(peptide: Pick<Peptide, 'id' | 'slug' | 'category'>): TimeSlot {
  return (
    PEPTIDE_OVERRIDES[peptide.slug] ??
    PEPTIDE_OVERRIDES[peptide.id] ??
    CATEGORY_DEFAULT[peptide.category] ??
    'flexible'
  );
}

/**
 * Detects pairs/groups of peptides that are conventionally injected together at the
 * same slot (e.g., CJC-1295 + Ipamorelin, GHRH + GHRP pairings).
 */
const CO_ADMIN_GROUPS: string[][] = [
  ['cjc-1295', 'ipamorelin'],
  ['cjc-1295', 'ghrp-2'],
  ['cjc-1295', 'ghrp-6'],
  ['sermorelin', 'ipamorelin'],
];

export function shouldCoAdminister(aSlug: string, bSlug: string): boolean {
  return CO_ADMIN_GROUPS.some((g) => g.includes(aSlug) && g.includes(bSlug));
}

/**
 * Detects timing conflicts between two peptides being dosed at the same slot.
 * Returns a short human explanation, or null if no conflict.
 */
export function timingConflict(a: Peptide, b: Peptide, slot: TimeSlot): string | null {
  if (a.category === 'growth-hormone' && b.category === 'growth-hormone' && slot !== 'bedtime') {
    return `${a.name} + ${b.name} are GH-class — most effective fasted before bed.`;
  }
  if (slot === 'bedtime' && (a.category === 'cognitive' || b.category === 'cognitive')) {
    return `Stimulating peptides at bedtime may impair sleep quality.`;
  }
  if (slot === 'preworkout' && (a.category === 'sleep-recovery' || b.category === 'sleep-recovery')) {
    return `Sleep/recovery peptides before training may reduce output.`;
  }
  return null;
}
