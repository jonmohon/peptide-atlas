'use client';

import { useState, useMemo, useCallback } from 'react';
import { stacks } from '@/data/stacks';
import { peptides } from '@/data/peptides';
import { useStackStore } from '@/stores/use-stack-store';
import { PeptideCard } from '@/components/peptides/peptide-card';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StackAnalysisPanel } from '@/components/ai/stack-analysis-panel';
import { AILoadingSkeleton } from '@/components/ai/ai-loading-skeleton';
import type { StackAnalysis } from '@/lib/ai/schemas';

export default function StacksPage() {
  const {
    activePresetStackId,
    customStackPeptideIds,
    selectPresetStack,
    addToCustomStack,
    removeFromCustomStack,
    clearCustomStack,
  } = useStackStore();

  const activeStack = useMemo(() => {
    if (activePresetStackId) {
      return stacks.find((s) => s.id === activePresetStackId) ?? null;
    }
    return null;
  }, [activePresetStackId]);

  const customStackPeptides = useMemo(() => {
    return customStackPeptideIds
      .map((id) => peptides.find((p) => p.id === id))
      .filter(Boolean) as typeof peptides;
  }, [customStackPeptideIds]);

  const [analysis, setAnalysis] = useState<StackAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (peptideIds: string[]) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peptideIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const displayPeptides = activeStack
    ? activeStack.peptides
        .map((sp) => peptides.find((p) => p.id === sp.peptideId))
        .filter(Boolean) as typeof peptides
    : customStackPeptides;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Stack Builder</h1>
        <p className="text-text-secondary mt-1">
          Explore pre-built peptide stacks or create your own custom combination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stack Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-built Stacks */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Pre-Built Stacks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stacks.map((stack) => (
                <button
                  key={stack.id}
                  onClick={() => selectPresetStack(
                    activePresetStackId === stack.id ? null : stack.id
                  )}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all',
                    activePresetStackId === stack.id
                      ? 'border-medical-400 bg-medical-50 shadow-sm'
                      : 'border-border bg-white hover:border-medical-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{stack.icon}</span>
                    <h3 className="font-semibold text-sm">{stack.name}</h3>
                  </div>
                  <p className="text-xs text-text-secondary mb-2">{stack.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {stack.peptides.map((sp) => {
                      const p = peptides.find((pep) => pep.id === sp.peptideId);
                      return p ? (
                        <Tag key={sp.peptideId} size="sm" variant="medical">
                          {p.name}
                        </Tag>
                      ) : null;
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Stack Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Custom Stack</h2>
              {customStackPeptideIds.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearCustomStack}>
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-text-secondary mb-3">
              Click peptides below to add them to your custom stack (max 5)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {peptides.map((peptide) => (
                <button
                  key={peptide.id}
                  onClick={() => {
                    if (customStackPeptideIds.includes(peptide.id)) {
                      removeFromCustomStack(peptide.id);
                    } else {
                      addToCustomStack(peptide.id);
                    }
                  }}
                  className={cn(
                    'text-left p-2.5 rounded-lg border text-sm transition-all',
                    customStackPeptideIds.includes(peptide.id)
                      ? 'border-medical-400 bg-medical-50'
                      : 'border-border hover:border-medical-200'
                  )}
                >
                  <span className="font-medium">{peptide.name}</span>
                  <span className="text-xs text-text-secondary ml-1">
                    ({peptide.category.replace(/-/g, ' ')})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stack Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-3">
                {activeStack ? activeStack.name : 'Your Stack'}
              </h3>

              {displayPeptides.length === 0 ? (
                <p className="text-sm text-text-secondary italic">
                  Select a pre-built stack or add peptides to your custom stack
                </p>
              ) : (
                <div className="space-y-3">
                  {displayPeptides.map((peptide) => (
                    <PeptideCard
                      key={peptide.id}
                      peptide={peptide}
                      compact
                    />
                  ))}
                </div>
              )}

              {(activeStack || customStackPeptideIds.length > 0) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                    Combined Effects
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {activeStack
                      ? activeStack.combinedEffects.map((effect) => (
                          <Tag key={effect} size="sm" variant="accent">
                            {effect.replace(/-/g, ' ')}
                          </Tag>
                        ))
                      : [...new Set(displayPeptides.flatMap((p) => p.effects))].map(
                          (effect) => (
                            <Tag key={effect} size="sm" variant="accent">
                              {effect.replace(/-/g, ' ')}
                            </Tag>
                          )
                        )}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {displayPeptides.length >= 2 && !analysis && !isAnalyzing && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleAnalyze(displayPeptides.map((p) => p.id))}
                    className="w-full"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Analyze with AI
                  </Button>
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-4 pt-4 border-t border-border">
                  <AILoadingSkeleton variant="analysis" />
                </div>
              )}

              {analysisError && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-2">
                    {analysisError}
                  </div>
                </div>
              )}

              {analysis && (
                <div className="mt-4 pt-4 border-t border-border">
                  <StackAnalysisPanel analysis={analysis} isLoading={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
