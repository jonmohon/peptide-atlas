'use client';

import { useState } from 'react';
import { peptides } from '@/data/peptides';
import { categories } from '@/data/categories';
import { PeptideCard } from '@/components/peptides/peptide-card';
import { SearchInput } from '@/components/ui/search-input';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { usePeptideSearch } from '@/hooks/use-peptide-search';
import type { PeptideCategory } from '@/types';

export default function PeptidesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PeptideCategory | null>(null);

  const filteredPeptides = usePeptideSearch(peptides, {
    query,
    category,
    effects: [],
  });

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.label,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Peptide Database</h1>
        <p className="text-text-secondary mt-1">
          Browse and search our comprehensive database of {peptides.length} peptides
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search peptides..."
          className="w-full sm:w-72"
        />
        <FilterDropdown
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={(val) => setCategory(val as PeptideCategory | null)}
        />
        <span className="text-sm text-text-secondary">
          {filteredPeptides.length} result{filteredPeptides.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeptides.map((peptide) => (
          <PeptideCard
            key={peptide.id}
            peptide={peptide}
            onClick={() => {
              window.location.href = `/peptides/${peptide.slug}`;
            }}
          />
        ))}
      </div>

      {filteredPeptides.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No peptides match your search.</p>
          <button
            onClick={() => {
              setQuery('');
              setCategory(null);
            }}
            className="mt-2 text-sm text-medical-500 hover:text-medical-600 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
