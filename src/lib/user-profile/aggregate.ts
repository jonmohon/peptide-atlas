/**
 * Atlas Profile aggregator — single source of truth for "who is this user".
 * Fetches UserProfile + active Cycle entries + recent journal + latest bloodwork
 * client-side and returns a typed AtlasContext used by every personalized feature.
 *
 * Any feature that asks the user a question should READ from here first (pre-fill)
 * and WRITE back via `updateAtlasProfile()` if the user makes a change worth
 * persisting as a preference.
 */

import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import type { Schema } from '@/lib/amplify-data';

type UserProfile = Schema['UserProfile']['type'];
type JournalEntry = Schema['JournalEntry']['type'];
type BloodworkPanel = Schema['BloodworkPanel']['type'];
type Cycle = Schema['Cycle']['type'];

export interface AtlasContext {
  userId: string | null;
  profile: {
    id: string | null;
    name: string | null;
    email: string | null;
    tier: 'FREE' | 'PRO' | 'PRO_PLUS';
    goals: string[];
    experienceLevel: string;
    healthConditions: string[];
    allergies: string[];
    weight: number | null;
    bodyFat: number | null;
    heightCm: number | null;
    age: number | null;
    sex: string | null;
    currentProtocolSummary: string;
    onboardingCompleted: boolean;
  };
  activeProtocol: {
    cycleName: string | null;
    durationWeeks: number | null;
    startDate: string | null;
    peptideNames: string[];
    entries: Array<{
      peptide: string;
      dose: string;
      unit: string;
      pattern: string;
      timeOfDay?: string;
    }>;
  } | null;
  recentJournal: {
    entryCount: number;
    dayRangeStart: string | null;
    dayRangeEnd: string | null;
    averages: {
      mood: number | null;
      energy: number | null;
      sleepHours: number | null;
      sleepQuality: number | null;
      weight: number | null;
    };
    recentSideEffects: string[];
    currentStreakDays: number;
  };
  latestBloodwork: {
    date: string;
    labName: string | null;
    flaggedMarkers: Array<{ name: string; value: number; unit: string; flag: string }>;
  } | null;
  metadata: {
    loadedAt: string;
    entriesScanned: number;
  };
}

export const EMPTY_ATLAS_CONTEXT: AtlasContext = {
  userId: null,
  profile: {
    id: null,
    name: null,
    email: null,
    tier: 'FREE',
    goals: [],
    experienceLevel: '',
    healthConditions: [],
    allergies: [],
    weight: null,
    bodyFat: null,
    heightCm: null,
    age: null,
    sex: null,
    currentProtocolSummary: '',
    onboardingCompleted: false,
  },
  activeProtocol: null,
  recentJournal: {
    entryCount: 0,
    dayRangeStart: null,
    dayRangeEnd: null,
    averages: {
      mood: null,
      energy: null,
      sleepHours: null,
      sleepQuality: null,
      weight: null,
    },
    recentSideEffects: [],
    currentStreakDays: 0,
  },
  latestBloodwork: null,
  metadata: { loadedAt: new Date().toISOString(), entriesScanned: 0 },
};

export interface AggregateOptions {
  journalDays?: number;
  maxFlaggedMarkers?: number;
}

export async function aggregateAtlasContext(
  options: AggregateOptions = {},
): Promise<AtlasContext> {
  const { journalDays = 14, maxFlaggedMarkers = 8 } = options;

  const [profiles, journal, bloodwork, cycles] = await Promise.all([
    dataClient.models.UserProfile.list(),
    dataClient.models.JournalEntry.list({ limit: 200 }),
    dataClient.models.BloodworkPanel.list({ limit: 10 }),
    dataClient.models.Cycle.list({ limit: 10 }),
  ]);

  const profile = profiles.data?.[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - journalDays);
  const cutoffISO = cutoff.toISOString().split('T')[0];

  const sortedEntries = [...(journal.data ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const recentEntries = sortedEntries.filter((e) => e.date >= cutoffISO);

  return {
    userId: profile?.id ?? null,
    profile: mapProfile(profile ?? null),
    activeProtocol: mapActiveProtocol(cycles.data ?? []),
    recentJournal: mapJournal(recentEntries, sortedEntries),
    latestBloodwork: mapBloodwork(bloodwork.data ?? [], maxFlaggedMarkers),
    metadata: {
      loadedAt: new Date().toISOString(),
      entriesScanned: journal.data?.length ?? 0,
    },
  };
}

function mapProfile(p: UserProfile | null): AtlasContext['profile'] {
  if (!p) return EMPTY_ATLAS_CONTEXT.profile;
  return {
    id: p.id,
    name: p.name ?? null,
    email: p.email ?? null,
    tier: (p.tier as 'FREE' | 'PRO' | 'PRO_PLUS' | null) ?? 'FREE',
    goals: ((p.goals ?? []).filter(Boolean) as string[]),
    experienceLevel: p.experienceLevel ?? '',
    healthConditions: ((p.healthConditions ?? []).filter(Boolean) as string[]),
    allergies: ((p.allergies ?? []).filter(Boolean) as string[]),
    weight: p.weight ?? null,
    bodyFat: null,
    heightCm: p.heightCm ?? null,
    age: p.age ?? null,
    sex: p.sex ?? null,
    currentProtocolSummary: p.currentProtocolSummary ?? '',
    onboardingCompleted: p.onboardingCompleted ?? false,
  };
}

function mapActiveProtocol(cycles: Cycle[]): AtlasContext['activeProtocol'] {
  const active = cycles.find((c) => c.active) ?? cycles[0];
  if (!active) return null;

  const entries = Array.isArray(active.entries)
    ? (active.entries as Array<{
        peptideId: string;
        dose: string;
        unit: string;
        pattern: string;
        timeOfDay?: string;
      }>)
    : [];

  return {
    cycleName: active.name,
    durationWeeks: active.durationWeeks,
    startDate: active.startDate,
    peptideNames: entries
      .map((e) => peptides.find((p) => p.id === e.peptideId)?.name ?? e.peptideId)
      .filter(Boolean),
    entries: entries.map((e) => ({
      peptide: peptides.find((p) => p.id === e.peptideId)?.name ?? e.peptideId,
      dose: e.dose,
      unit: e.unit,
      pattern: e.pattern,
      timeOfDay: e.timeOfDay,
    })),
  };
}

function average(vals: Array<number | null | undefined>): number | null {
  const nums = vals.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

function mapJournal(
  recent: JournalEntry[],
  allSorted: JournalEntry[],
): AtlasContext['recentJournal'] {
  const sideEffects: string[] = [];
  for (const e of recent) {
    const se = e.sideEffects as unknown;
    if (Array.isArray(se)) {
      for (const s of se) {
        if (typeof s === 'string') sideEffects.push(s);
        else if (typeof s === 'object' && s && 'name' in s && typeof (s as { name: unknown }).name === 'string') {
          sideEffects.push((s as { name: string }).name);
        }
      }
    }
  }

  return {
    entryCount: recent.length,
    dayRangeStart: recent[recent.length - 1]?.date ?? null,
    dayRangeEnd: recent[0]?.date ?? null,
    averages: {
      mood: average(recent.map((e) => e.mood)),
      energy: average(recent.map((e) => e.energy)),
      sleepHours: average(recent.map((e) => e.sleepHours)),
      sleepQuality: average(recent.map((e) => e.sleepQuality)),
      weight: average(recent.map((e) => e.weight)),
    },
    recentSideEffects: Array.from(new Set(sideEffects)).slice(0, 6),
    currentStreakDays: computeStreak(allSorted),
  };
}

function computeStreak(sorted: JournalEntry[]): number {
  if (sorted.length === 0) return 0;
  const today = new Date();
  let streak = 0;
  const dateSet = new Set(sorted.map((e) => e.date));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    if (dateSet.has(iso)) {
      streak++;
    } else if (i === 0) {
      // Grace day for today not yet logged
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function mapBloodwork(
  panels: BloodworkPanel[],
  maxFlagged: number,
): AtlasContext['latestBloodwork'] {
  const latest = [...panels].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!latest) return null;

  const markersRaw = latest.markers as unknown;
  let markers: Array<{ name?: string; value?: number; unit?: string; flag?: string }> = [];

  if (typeof markersRaw === 'string') {
    try {
      markers = JSON.parse(markersRaw);
    } catch {
      markers = [];
    }
  } else if (Array.isArray(markersRaw)) {
    markers = markersRaw as typeof markers;
  }

  const flagged = markers
    .filter((m) => m.flag === 'high' || m.flag === 'low')
    .slice(0, maxFlagged)
    .map((m) => ({
      name: m.name ?? 'unknown',
      value: typeof m.value === 'number' ? m.value : 0,
      unit: m.unit ?? '',
      flag: m.flag ?? 'normal',
    }));

  return {
    date: latest.date,
    labName: latest.labName ?? null,
    flaggedMarkers: flagged,
  };
}

export interface ProfilePatch {
  goals?: string[];
  experienceLevel?: string;
  healthConditions?: string[];
  allergies?: string[];
  weight?: number | null;
  heightCm?: number | null;
  age?: number | null;
  sex?: string | null;
  currentProtocolSummary?: string;
}

export async function updateAtlasProfile(patch: ProfilePatch): Promise<boolean> {
  try {
    const { data: profiles } = await dataClient.models.UserProfile.list();
    const p = profiles?.[0];
    if (!p) return false;
    await dataClient.models.UserProfile.update({ id: p.id, ...patch });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('atlas-profile-changed'));
    }
    return true;
  } catch (err) {
    console.warn('updateAtlasProfile failed:', err);
    return false;
  }
}
