/**
 * Core journal type definitions — PeptideDose, SideEffect, BodyMeasurements, JournalEntryData,
 * CalendarDay — plus the createEmptyEntry factory used to initialise new draft entries.
 */

export interface PeptideDose {
  peptideId: string;
  dose: number;
  unit: 'mcg' | 'mg' | 'iu';
  route: 'subcutaneous' | 'intramuscular' | 'oral' | 'nasal' | 'topical';
  site: string;
  time: string; // HH:MM
}

export interface SideEffect {
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface BodyMeasurements {
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  hips?: number;
  neck?: number;
}

export interface JournalEntryData {
  id?: string;
  date: string; // YYYY-MM-DD
  peptideDoses: PeptideDose[];
  weight: number | null;
  bodyFat: number | null;
  measurements: BodyMeasurements | null;
  dietNotes: string;
  sideEffects: SideEffect[];
  mood: number | null; // 1-10
  energy: number | null; // 1-10
  sleepHours: number | null;
  sleepQuality: number | null; // 1-10
  subjectiveNotes: string;
  tags: string[];
}

export function createEmptyEntry(date: string): JournalEntryData {
  return {
    date,
    peptideDoses: [],
    weight: null,
    bodyFat: null,
    measurements: null,
    dietNotes: '',
    sideEffects: [],
    mood: null,
    energy: null,
    sleepHours: null,
    sleepQuality: null,
    subjectiveNotes: '',
    tags: [],
  };
}

export type CalendarDay = {
  date: string;
  status: 'logged' | 'partial' | 'empty';
};
