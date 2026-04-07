'use client';

import { useState, useMemo } from 'react';
import { effects } from '@/data/effects';
import { peptides } from '@/data/peptides';
import { PeptideCard } from '@/components/peptides/peptide-card';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';

export default function EffectsPage() {
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);

  const toggleEffect = (effectId: string) => {
    setSelectedEffects((prev) =>
      prev.includes(effectId)
        ? prev.filter((e) => e !== effectId)
        : [...prev, effectId]
    );
  };

  const matchingPeptides = useMemo(() => {
    if (selectedEffects.length === 0) return [];

    const scored = peptides.map((peptide) => {
      const matchCount = selectedEffects.filter((effect) =>
        peptide.effects.includes(effect)
      ).length;
      return { peptide, matchCount };
    });

    return scored
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .map((s) => ({ ...s.peptide, matchCount: s.matchCount }));
  }, [selectedEffects]);

  const groupedEffects = useMemo(() => {
    const groups: Record<string, typeof effects> = {};
    for (const effect of effects) {
      const cat = effect.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(effect);
    }
    return groups;
  }, []);

  const categoryLabels: Record<string, string> = {
    'body-composition': 'Body Composition',
    healing: 'Healing & Recovery',
    cognitive: 'Cognitive',
    longevity: 'Longevity',
    sleep: 'Sleep & Recovery',
    sexual: 'Sexual Health',
    immune: 'Immune',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Effects Explorer</h1>
        <p className="text-text-secondary mt-1">
          Choose the effects you want and discover which peptides can help
        </p>
      </div>

      {/* Effect Selection */}
      <div className="mb-8 space-y-4">
        {Object.entries(groupedEffects).map(([category, categoryEffects]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">
              {categoryLabels[category] ?? category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {categoryEffects.map((effect) => (
                <Tag
                  key={effect.id}
                  size="md"
                  active={selectedEffects.includes(effect.id)}
                  onClick={() => toggleEffect(effect.id)}
                >
                  {effect.icon} {effect.label}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedEffects.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium">
            {matchingPeptides.length} peptide{matchingPeptides.length !== 1 ? 's' : ''} match
          </span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedEffects([])}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results */}
      {selectedEffects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-text-secondary">
            Select one or more effects above to see matching peptides
          </p>
        </div>
      ) : matchingPeptides.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No peptides match all selected effects</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingPeptides.map((peptide) => (
            <PeptideCard
              key={peptide.id}
              peptide={peptide}
              onClick={() => {
                window.location.href = `/peptides/${peptide.slug}`;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
