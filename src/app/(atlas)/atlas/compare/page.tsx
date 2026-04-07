'use client';

import { useMemo } from 'react';
import { peptides } from '@/data/peptides';
import { useCompareStore } from '@/stores/use-compare-store';
import { EvidenceBadge } from '@/components/shared/evidence-badge';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ComparisonInsights } from '@/components/ai/comparison-insights';

const axisLabels: Record<string, string> = {
  efficacy: 'Efficacy',
  evidence: 'Evidence',
  easeOfUse: 'Ease of Use',
  cost: 'Cost',
  safety: 'Safety',
  popularity: 'Popularity',
};

export default function ComparePage() {
  const {
    selectedPeptideIds,
    addPeptide,
    removePeptide,
    clearComparison,
  } = useCompareStore();

  const selectedPeptides = useMemo(() => {
    return selectedPeptideIds
      .map((id) => peptides.find((p) => p.id === id))
      .filter(Boolean) as typeof peptides;
  }, [selectedPeptideIds]);

  const availablePeptides = useMemo(() => {
    return peptides.filter((p) => !selectedPeptideIds.includes(p.id));
  }, [selectedPeptideIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compare Peptides</h1>
        <p className="text-text-secondary mt-1">
          Select up to 4 peptides to compare side by side
        </p>
      </div>

      {/* Peptide Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold">Select Peptides ({selectedPeptideIds.length}/4)</h2>
          {selectedPeptideIds.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearComparison}>
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedPeptides.map((p) => (
            <Tag key={p.id} size="md" active onClick={() => removePeptide(p.id)}>
              {p.name} &times;
            </Tag>
          ))}
          {selectedPeptideIds.length < 4 && (
            <select
              className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white text-text-secondary"
              value=""
              onChange={(e) => {
                if (e.target.value) addPeptide(e.target.value);
              }}
            >
              <option value="">+ Add peptide</option>
              {availablePeptides.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedPeptides.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold p-3 border-b border-border w-40">
                  Attribute
                </th>
                {selectedPeptides.map((p) => (
                  <th key={p.id} className="text-left text-sm font-semibold p-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      {p.name}
                      <EvidenceBadge level={p.evidenceLevel} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">Category</td>
                {selectedPeptides.map((p) => (
                  <td key={p.id} className="p-3 border-b border-border text-sm capitalize">
                    {p.category.replace(/-/g, ' ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">Route</td>
                {selectedPeptides.map((p) => (
                  <td key={p.id} className="p-3 border-b border-border text-sm capitalize">
                    {p.dosing.route}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">Typical Dose</td>
                {selectedPeptides.map((p) => (
                  <td key={p.id} className="p-3 border-b border-border text-sm">
                    {p.dosing.typicalDose}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">Cycle Length</td>
                {selectedPeptides.map((p) => (
                  <td key={p.id} className="p-3 border-b border-border text-sm">
                    {p.dosing.cycleLength}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">Effects</td>
                {selectedPeptides.map((p) => (
                  <td key={p.id} className="p-3 border-b border-border">
                    <div className="flex flex-wrap gap-1">
                      {p.effects.slice(0, 5).map((e) => (
                        <Tag key={e} size="sm">{e.replace(/-/g, ' ')}</Tag>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Ratings */}
              {Object.entries(axisLabels).map(([key, label]) => (
                <tr key={key}>
                  <td className="p-3 border-b border-border text-sm font-medium text-text-secondary">
                    {label}
                  </td>
                  {selectedPeptides.map((p) => {
                    const value = p.ratings[key as keyof typeof p.ratings];
                    return (
                      <td key={p.id} className="p-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-border rounded-full w-20 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                value >= 7 ? 'bg-green-500' : value >= 4 ? 'bg-amber-500' : 'bg-red-400'
                              )}
                              style={{ width: `${value * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{value}/10</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-lg">Select at least 2 peptides to compare</p>
        </div>
      )}

      {/* AI Comparison Insights */}
      {selectedPeptides.length >= 2 && (
        <ComparisonInsights peptideIds={selectedPeptideIds} />
      )}
    </div>
  );
}
