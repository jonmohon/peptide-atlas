import { create } from 'zustand';
import type { RegionId, RegionHighlight } from '@/types/body';

interface BodyStore {
  hoveredRegion: RegionId | null;
  selectedRegion: RegionId | null;
  highlightedRegions: Map<RegionId, RegionHighlight>;
  showPathways: boolean;
  activePathwayPeptideId: string | null;

  setHoveredRegion: (region: RegionId | null) => void;
  selectRegion: (region: RegionId | null) => void;
  setHighlightedRegions: (regions: Map<RegionId, RegionHighlight>) => void;
  togglePathways: (peptideId: string | null) => void;
  clearAll: () => void;
}

export const useBodyStore = create<BodyStore>((set) => ({
  hoveredRegion: null,
  selectedRegion: null,
  highlightedRegions: new Map(),
  showPathways: false,
  activePathwayPeptideId: null,

  setHoveredRegion: (region) => set({ hoveredRegion: region }),

  selectRegion: (region) =>
    set((state) => ({
      selectedRegion: state.selectedRegion === region ? null : region,
    })),

  setHighlightedRegions: (regions) => set({ highlightedRegions: regions }),

  togglePathways: (peptideId) =>
    set((state) => ({
      showPathways: peptideId !== null && state.activePathwayPeptideId !== peptideId,
      activePathwayPeptideId:
        state.activePathwayPeptideId === peptideId ? null : peptideId,
    })),

  clearAll: () =>
    set({
      hoveredRegion: null,
      selectedRegion: null,
      highlightedRegions: new Map(),
      showPathways: false,
      activePathwayPeptideId: null,
    }),
}));
