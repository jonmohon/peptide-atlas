/**
 * Cycle Planner types — shape of individual peptide entries within a cycle plan
 * and the cycle plan itself. Stored in Cycle.entries as JSON.
 */

export type CyclePattern = 'continuous' | '5on2off' | '4w2w' | '8w4w' | '12w4w';

export const CYCLE_PATTERNS: Record<CyclePattern, { label: string; desc: string }> = {
  continuous: { label: 'Continuous', desc: 'Every day while on-cycle' },
  '5on2off': { label: '5-on / 2-off', desc: '5 days dosing, 2 days rest each week' },
  '4w2w': { label: '4 weeks on / 2 off', desc: '4-week blocks with 2-week washout' },
  '8w4w': { label: '8 weeks on / 4 off', desc: 'Standard GH-secretagogue pattern' },
  '12w4w': { label: '12 weeks on / 4 off', desc: 'Long cycle with receptor-reset gap' },
};

export interface CycleEntry {
  id: string;
  peptideId: string;
  startWeek: number;
  durationWeeks: number;
  pattern: CyclePattern;
  dose: string;
  unit: 'mcg' | 'mg' | 'iu';
  notes?: string;
}

export interface CyclePlan {
  id?: string;
  name: string;
  startDate: string;
  durationWeeks: number;
  entries: CycleEntry[];
  notes?: string;
  active?: boolean;
  aiAnalysis?: {
    overallScore: number;
    synergies: string[];
    issues: string[];
    suggestions: string[];
    summary: string;
  } | null;
}

export function cycleEntryIsActiveInWeek(entry: CycleEntry, week: number): boolean {
  return week >= entry.startWeek && week < entry.startWeek + entry.durationWeeks;
}

export function detectOverlaps(entries: CycleEntry[]): Array<{ a: CycleEntry; b: CycleEntry; weeks: number[] }> {
  const overlaps: Array<{ a: CycleEntry; b: CycleEntry; weeks: number[] }> = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      const weeks: number[] = [];
      const maxWeek = Math.max(a.startWeek + a.durationWeeks, b.startWeek + b.durationWeeks);
      for (let w = 1; w <= maxWeek; w++) {
        if (cycleEntryIsActiveInWeek(a, w) && cycleEntryIsActiveInWeek(b, w)) {
          weeks.push(w);
        }
      }
      if (weeks.length > 0) {
        overlaps.push({ a, b, weeks });
      }
    }
  }
  return overlaps;
}
