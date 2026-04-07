import { create } from 'zustand';
import { MAX_COMPARE_SIZE } from '@/lib/constants';
import type { ComparisonAxis } from '@/types';

interface CompareStore {
  selectedPeptideIds: string[];
  activeAxes: ComparisonAxis[];

  addPeptide: (id: string) => void;
  removePeptide: (id: string) => void;
  toggleAxis: (axis: ComparisonAxis) => void;
  clearComparison: () => void;
}

const defaultAxes: ComparisonAxis[] = [
  'efficacy',
  'evidence',
  'safety',
  'easeOfUse',
  'cost',
  'popularity',
];

export const useCompareStore = create<CompareStore>((set) => ({
  selectedPeptideIds: [],
  activeAxes: defaultAxes,

  addPeptide: (id) =>
    set((state) => {
      if (state.selectedPeptideIds.includes(id)) return state;
      if (state.selectedPeptideIds.length >= MAX_COMPARE_SIZE) return state;
      return { selectedPeptideIds: [...state.selectedPeptideIds, id] };
    }),

  removePeptide: (id) =>
    set((state) => ({
      selectedPeptideIds: state.selectedPeptideIds.filter((pid) => pid !== id),
    })),

  toggleAxis: (axis) =>
    set((state) => ({
      activeAxes: state.activeAxes.includes(axis)
        ? state.activeAxes.filter((a) => a !== axis)
        : [...state.activeAxes, axis],
    })),

  clearComparison: () =>
    set({ selectedPeptideIds: [], activeAxes: defaultAxes }),
}));
