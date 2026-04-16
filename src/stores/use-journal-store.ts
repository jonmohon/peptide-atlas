import { create } from 'zustand';
import type { JournalEntryData, CalendarDay, PeptideDose } from '@/types/journal';
import { createEmptyEntry } from '@/types/journal';
import { dataClient } from '@/lib/amplify-data';

interface JournalStore {
  draft: JournalEntryData | null;
  isDirty: boolean;
  calendarDays: CalendarDay[];
  currentMonth: string;
  currentStreak: number;
  bestStreak: number;
  loading: boolean;
  saving: boolean;

  // CRUD
  loadEntry: (date: string) => Promise<void>;
  saveEntry: () => Promise<boolean>;
  loadCalendarMonth: (month: string) => Promise<void>;
  loadPreviousEntry: (beforeDate: string) => Promise<JournalEntryData | null>;

  // Draft management
  initDraft: (date: string) => void;
  updateDraft: (updates: Partial<JournalEntryData>) => void;
  addDose: (dose: PeptideDose) => void;
  updateDose: (index: number, dose: PeptideDose) => void;
  removeDose: (index: number) => void;
  copyDosesFromEntry: (entry: JournalEntryData) => void;
  resetDraft: () => void;

  // UI state
  setCalendarDays: (days: CalendarDay[]) => void;
  setCurrentMonth: (month: string) => void;
  setStreak: (current: number, best: number) => void;
  setLoading: (loading: boolean) => void;
}

function calculateStreak(days: CalendarDay[]): { current: number; best: number } {
  const today = new Date().toISOString().split('T')[0];
  const loggedDates = new Set(days.filter((d) => d.status === 'logged').map((d) => d.date));

  let current = 0;
  let best = 0;
  let streak = 0;
  const d = new Date(today);

  // Count current streak backwards from today
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0];
    if (loggedDates.has(dateStr)) {
      streak++;
      if (i === current) current = streak; // Only count if contiguous from today
    } else if (i === 0) {
      // Today not logged yet — check yesterday
      current = 0;
    } else {
      if (streak > best) best = streak;
      streak = 0;
    }
    d.setDate(d.getDate() - 1);
  }
  if (streak > best) best = streak;
  if (current === 0) {
    // Check if yesterday was logged (streak is still alive)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (loggedDates.has(yesterday.toISOString().split('T')[0])) {
      // Recount from yesterday
      current = 0;
      const d2 = new Date(yesterday);
      for (let i = 0; i < 365; i++) {
        if (loggedDates.has(d2.toISOString().split('T')[0])) {
          current++;
        } else break;
        d2.setDate(d2.getDate() - 1);
      }
    }
  }

  return { current, best: Math.max(best, current) };
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  draft: null,
  isDirty: false,
  calendarDays: [],
  currentMonth: new Date().toISOString().slice(0, 7),
  currentStreak: 0,
  bestStreak: 0,
  loading: false,
  saving: false,

  loadEntry: async (date) => {
    set({ loading: true });
    try {
      const { data: entries } = await dataClient.models.JournalEntry.listJournalEntryByDate({ date });
      const entry = entries?.[0];
      if (entry) {
        set({
          draft: {
            id: entry.id,
            date: entry.date,
            peptideDoses: (entry.peptideDoses as PeptideDose[]) ?? [],
            weight: entry.weight ?? null,
            bodyFat: entry.bodyFat ?? null,
            measurements: entry.measurements as JournalEntryData['measurements'],
            dietNotes: entry.dietNotes ?? '',
            sideEffects: (entry.sideEffects as JournalEntryData['sideEffects']) ?? [],
            mood: entry.mood ?? null,
            energy: entry.energy ?? null,
            sleepHours: entry.sleepHours ?? null,
            sleepQuality: entry.sleepQuality ?? null,
            subjectiveNotes: entry.subjectiveNotes ?? '',
            tags: (entry.tags ?? []).filter((t): t is string => t !== null),
          },
          isDirty: false,
          loading: false,
        });
      } else {
        set({ draft: createEmptyEntry(date), isDirty: false, loading: false });
      }
    } catch {
      set({ draft: createEmptyEntry(date), isDirty: false, loading: false });
    }
  },

  saveEntry: async () => {
    const { draft } = get();
    if (!draft) return false;
    set({ saving: true });
    try {
      const payload = {
        date: draft.date,
        peptideDoses: JSON.stringify(draft.peptideDoses),
        weight: draft.weight,
        bodyFat: draft.bodyFat,
        measurements: draft.measurements ? JSON.stringify(draft.measurements) : null,
        dietNotes: draft.dietNotes || null,
        sideEffects: JSON.stringify(draft.sideEffects),
        mood: draft.mood,
        energy: draft.energy,
        sleepHours: draft.sleepHours,
        sleepQuality: draft.sleepQuality,
        subjectiveNotes: draft.subjectiveNotes || null,
        tags: draft.tags,
      };

      if (draft.id) {
        await dataClient.models.JournalEntry.update({ id: draft.id, ...payload });
      } else {
        const { data: created } = await dataClient.models.JournalEntry.create(payload);
        if (created) {
          set((state) => ({
            draft: state.draft ? { ...state.draft, id: created.id } : null,
          }));
        }
      }
      set({ isDirty: false, saving: false });
      return true;
    } catch (err) {
      console.error('Failed to save journal entry:', err);
      set({ saving: false });
      return false;
    }
  },

  loadCalendarMonth: async (month) => {
    try {
      const [year, m] = month.split('-').map(Number);
      const monthPrefix = `${year}-${String(m).padStart(2, '0')}`;

      // Fetch all entries for the owner, filter by month prefix client-side
      const { data: allEntries } = await dataClient.models.JournalEntry.list();
      const entries = (allEntries ?? []).filter((e) => e.date.startsWith(monthPrefix));

      const days: CalendarDay[] = entries.map((e) => ({
        date: e.date,
        status: (e.peptideDoses || e.mood || e.weight) ? 'logged' as const : 'partial' as const,
      }));

      set({ calendarDays: days, currentMonth: month });
      const streaks = calculateStreak(days);
      set({ currentStreak: streaks.current, bestStreak: streaks.best });
    } catch {
      set({ calendarDays: [], currentMonth: month });
    }
  },

  loadPreviousEntry: async (beforeDate) => {
    try {
      // Look back up to 7 days
      const d = new Date(beforeDate);
      for (let i = 1; i <= 7; i++) {
        d.setDate(d.getDate() - 1);
        const dateStr = d.toISOString().split('T')[0];
        const { data: entries } = await dataClient.models.JournalEntry.listJournalEntryByDate({ date: dateStr });
        const entry = entries?.[0];
        if (entry?.peptideDoses) {
          return {
            id: entry.id,
            date: entry.date,
            peptideDoses: (entry.peptideDoses as PeptideDose[]) ?? [],
            weight: entry.weight ?? null,
            bodyFat: entry.bodyFat ?? null,
            measurements: entry.measurements as JournalEntryData['measurements'],
            dietNotes: entry.dietNotes ?? '',
            sideEffects: (entry.sideEffects as JournalEntryData['sideEffects']) ?? [],
            mood: entry.mood ?? null,
            energy: entry.energy ?? null,
            sleepHours: entry.sleepHours ?? null,
            sleepQuality: entry.sleepQuality ?? null,
            subjectiveNotes: entry.subjectiveNotes ?? '',
            tags: (entry.tags ?? []).filter((t): t is string => t !== null),
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  initDraft: (date) => set({ draft: createEmptyEntry(date), isDirty: false }),

  updateDraft: (updates) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...updates } : null,
      isDirty: true,
    })),

  addDose: (dose) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, peptideDoses: [...state.draft.peptideDoses, dose] },
        isDirty: true,
      };
    }),

  updateDose: (index, dose) =>
    set((state) => {
      if (!state.draft) return state;
      const doses = [...state.draft.peptideDoses];
      doses[index] = dose;
      return { draft: { ...state.draft, peptideDoses: doses }, isDirty: true };
    }),

  removeDose: (index) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, peptideDoses: state.draft.peptideDoses.filter((_, i) => i !== index) },
        isDirty: true,
      };
    }),

  copyDosesFromEntry: (entry) =>
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: { ...state.draft, peptideDoses: entry.peptideDoses.map((d) => ({ ...d })) },
        isDirty: true,
      };
    }),

  resetDraft: () => set({ draft: null, isDirty: false }),
  setCalendarDays: (days) => set({ calendarDays: days }),
  setCurrentMonth: (month) => set({ currentMonth: month }),
  setStreak: (current, best) => set({ currentStreak: current, bestStreak: best }),
  setLoading: (loading) => set({ loading }),
}));
