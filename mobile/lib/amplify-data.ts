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

export type ProfilePatch = {
  name?: string | null;
  goals?: string[] | null;
  experienceLevel?: string | null;
  weight?: number | null;
  heightCm?: number | null;
  age?: number | null;
  sex?: string | null;
  healthConditions?: string[] | null;
  allergies?: string[] | null;
};

export async function upsertUserProfile(
  email: string,
  patch: ProfilePatch
): Promise<UserProfileRow> {
  const existing = await fetchUserProfile();
  if (existing) {
    const result = await client().models.UserProfile.update({
      id: existing.id,
      ...patch,
    } as Record<string, unknown>);
    return result.data as UserProfileRow;
  }
  const result = await client().models.UserProfile.create({
    email,
    tier: 'FREE',
    ...patch,
  } as Record<string, unknown>);
  return result.data as UserProfileRow;
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

export type NoteRow = {
  id: string;
  title?: string | null;
  content: string;
  attachedTo?: 'PEPTIDE' | 'STACK' | 'PROTOCOL' | 'GENERAL' | null;
  attachedId?: string | null;
  tags?: string[] | null;
  pinned?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchNotes(): Promise<NoteRow[]> {
  const result = await client().models.UserNote.list();
  const rows = result.data as NoteRow[];
  return rows.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (b.updatedAt ?? '') > (a.updatedAt ?? '') ? 1 : -1;
  });
}

export async function createNote(input: {
  title?: string;
  content: string;
  attachedTo?: NoteRow['attachedTo'];
  attachedId?: string;
  tags?: string[];
  pinned?: boolean;
}): Promise<NoteRow> {
  const result = await client().models.UserNote.create({
    title: input.title ?? null,
    content: input.content,
    attachedTo: input.attachedTo ?? 'GENERAL',
    attachedId: input.attachedId ?? null,
    tags: input.tags ?? [],
    pinned: input.pinned ?? false,
  });
  return result.data as NoteRow;
}

export async function deleteNote(id: string): Promise<void> {
  await client().models.UserNote.delete({ id });
}

export async function togglePinNote(id: string, pinned: boolean): Promise<NoteRow> {
  const result = await client().models.UserNote.update({ id, pinned });
  return result.data as NoteRow;
}

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
