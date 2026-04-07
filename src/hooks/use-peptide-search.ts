'use client';

import { useMemo } from 'react';
import type { Peptide, PeptideCategory } from '@/types';

interface SearchFilters {
  query: string;
  category: PeptideCategory | null;
  effects: string[];
}

export function usePeptideSearch(
  peptides: Peptide[],
  filters: SearchFilters
): Peptide[] {
  return useMemo(() => {
    let results = peptides;

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q) ||
          p.abbreviation.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.effects.some((e) => e.includes(q))
      );
    }

    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }

    if (filters.effects.length > 0) {
      results = results.filter((p) =>
        filters.effects.some((effect) => p.effects.includes(effect))
      );
    }

    return results;
  }, [peptides, filters.query, filters.category, filters.effects]);
}
