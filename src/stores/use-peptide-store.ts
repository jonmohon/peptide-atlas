import { create } from 'zustand';
import type { PeptideCategory } from '@/types';

interface PeptideStore {
  selectedPeptideId: string | null;
  searchQuery: string;
  activeCategory: PeptideCategory | null;
  activeEffects: string[];

  selectPeptide: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: PeptideCategory | null) => void;
  toggleEffect: (effectId: string) => void;
  clearFilters: () => void;
}

export const usePeptideStore = create<PeptideStore>((set) => ({
  selectedPeptideId: null,
  searchQuery: '',
  activeCategory: null,
  activeEffects: [],

  selectPeptide: (id) => set({ selectedPeptideId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCategory: (category) => set({ activeCategory: category }),

  toggleEffect: (effectId) =>
    set((state) => ({
      activeEffects: state.activeEffects.includes(effectId)
        ? state.activeEffects.filter((e) => e !== effectId)
        : [...state.activeEffects, effectId],
    })),

  clearFilters: () =>
    set({
      searchQuery: '',
      activeCategory: null,
      activeEffects: [],
    }),
}));
