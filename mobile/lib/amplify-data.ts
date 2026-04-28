/**
 * Amplify Data client for the mobile app.
 *
 * Calls go through AppSync with the user's Cognito session (allow.owner() rules
 * enforce per-user data scoping). Strong schema typing requires importing the
 * Schema type from amplify/data/resource.ts which currently lives outside the
 * mobile project tree — for the prototype we use the loose-typed client and
 * a small TS helper for the rows we touch. We'll graduate to typed access once
 * the monorepo refactor lands and packages/shared exposes Schema.
 */

import { generateClient } from 'aws-amplify/data';

export type UserProfileRow = {
  id: string;
  email?: string | null;
  name?: string | null;
  tier?: 'FREE' | 'PRO' | 'PRO_PLUS' | null;
  goals?: string[] | null;
  experienceLevel?: string | null;
};

export type JournalEntryRow = {
  id: string;
  date: string;
  peptideDoses?: unknown;
  weight?: number | null;
  energy?: number | null;
  mood?: number | null;
  sleepHours?: number | null;
  subjectiveNotes?: string | null;
  tags?: string[] | null;
};

type LooseModel = {
  list: (args?: unknown) => Promise<{ data: unknown[] }>;
  create: (input: Record<string, unknown>) => Promise<{ data: unknown }>;
  update: (input: Record<string, unknown>) => Promise<{ data: unknown }>;
  delete: (input: { id: string }) => Promise<{ data: unknown }>;
};

type LooseClient = {
  models: Record<string, LooseModel>;
};

let cached: LooseClient | null = null;

function client(): LooseClient {
  if (!cached) cached = generateClient({ authMode: 'userPool' }) as unknown as LooseClient;
  return cached;
}

export async function fetchUserProfile(): Promise<UserProfileRow | null> {
  // allow.owner() restricts list() to this user's own row.
  const result = await client().models.UserProfile.list();
  const rows = result.data as UserProfileRow[];
  return rows[0] ?? null;
}

export async function fetchJournalEntries(): Promise<JournalEntryRow[]> {
  const result = await client().models.JournalEntry.list();
  const rows = result.data as JournalEntryRow[];
  // Sort newest first; AppSync doesn't promise order on a list().
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export type DoseInput = {
  peptideId: string;
  peptideName: string;
  amount: string;
  route: string;
  time?: string;
};

export async function createJournalEntry(input: {
  date: string;
  peptideDoses: DoseInput[];
  energy?: number;
  mood?: number;
  sleepHours?: number;
  subjectiveNotes?: string;
  tags?: string[];
}): Promise<JournalEntryRow> {
  const result = await client().models.JournalEntry.create({
    date: input.date,
    peptideDoses: input.peptideDoses,
    energy: input.energy ?? null,
    mood: input.mood ?? null,
    sleepHours: input.sleepHours ?? null,
    subjectiveNotes: input.subjectiveNotes ?? null,
    tags: input.tags ?? [],
  });
  return result.data as JournalEntryRow;
}
