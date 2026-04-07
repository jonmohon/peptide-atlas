import { create } from 'zustand';
import { MAX_STACK_SIZE } from '@/lib/constants';

interface StackStore {
  activePresetStackId: string | null;
  customStackPeptideIds: string[];

  selectPresetStack: (stackId: string | null) => void;
  addToCustomStack: (peptideId: string) => void;
  removeFromCustomStack: (peptideId: string) => void;
  clearCustomStack: () => void;
}

export const useStackStore = create<StackStore>((set) => ({
  activePresetStackId: null,
  customStackPeptideIds: [],

  selectPresetStack: (stackId) =>
    set({
      activePresetStackId: stackId,
      customStackPeptideIds: [],
    }),

  addToCustomStack: (peptideId) =>
    set((state) => {
      if (state.customStackPeptideIds.includes(peptideId)) return state;
      if (state.customStackPeptideIds.length >= MAX_STACK_SIZE) return state;
      return {
        customStackPeptideIds: [...state.customStackPeptideIds, peptideId],
        activePresetStackId: null,
      };
    }),

  removeFromCustomStack: (peptideId) =>
    set((state) => ({
      customStackPeptideIds: state.customStackPeptideIds.filter(
        (id) => id !== peptideId
      ),
    })),

  clearCustomStack: () =>
    set({ customStackPeptideIds: [], activePresetStackId: null }),
}));
