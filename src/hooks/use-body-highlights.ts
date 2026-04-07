'use client';

import { useMemo } from 'react';
import type { RegionId, RegionHighlight } from '@/types/body';
import type { Peptide } from '@/types/peptide';
import { COLORS } from '@/lib/constants';

export function useBodyHighlights(
  peptides: Peptide[],
  selectedPeptideId: string | null,
  selectedRegion: RegionId | null
): Map<RegionId, RegionHighlight> {
  return useMemo(() => {
    const highlights = new Map<RegionId, RegionHighlight>();

    if (selectedPeptideId) {
      const peptide = peptides.find((p) => p.id === selectedPeptideId);
      if (peptide) {
        for (const region of peptide.affectedRegions) {
          highlights.set(region.regionId, {
            regionId: region.regionId,
            intensity: region.intensity,
            color: COLORS.intensity[region.intensity as keyof typeof COLORS.intensity] ?? COLORS.intensity[3],
          });
        }
      }
    }

    if (selectedRegion && !highlights.has(selectedRegion)) {
      highlights.set(selectedRegion, {
        regionId: selectedRegion,
        intensity: 3,
        color: COLORS.intensity[3],
      });
    }

    return highlights;
  }, [peptides, selectedPeptideId, selectedRegion]);
}
