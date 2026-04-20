'use client';

import { useState, useMemo, useCallback } from 'react';
import { stacks } from '@/data/stacks';
import { peptides } from '@/data/peptides';
import { useStackStore } from '@/stores/use-stack-store';
import Link from 'next/link';
import { PeptideCard } from '@/components/peptides/peptide-card';
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
        <h1 className="text-3xl font-bold text-foreground">Stack Builder</h1>
        <p className="text-text-secondary mt-1">
          Explore pre-built peptide stacks or create your own custom combination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stack Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pre-built Stacks */}
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
              Pre-Built Stacks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stacks.map((stack) => {
                const selected = activePresetStackId === stack.id;
                return (
                  <button
                    key={stack.id}
                    onClick={() =>
                      selectPresetStack(activePresetStackId === stack.id ? null : stack.id)
                    }
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      selected
                        ? 'glass-bright border-neon-cyan/40 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                        : 'glass border-white/[0.06] hover:border-neon-cyan/20 hover:bg-white/[0.04]',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{stack.icon}</span>
                      <h3
                        className={cn(
                          'font-semibold text-sm',
                          selected ? 'text-neon-cyan' : 'text-foreground',
                        )}
                      >
                        {stack.name}
                      </h3>
                    </div>
                    <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                      {stack.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stack.peptides.map((sp) => {
                        const p = peptides.find((pep) => pep.id === sp.peptideId);
                        return p ? (
                          <span
                            key={sp.peptideId}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-text-secondary border border-white/[0.06]"
                          >
                            {p.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Stack Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Custom Stack
              </h2>
              {customStackPeptideIds.length > 0 && (
                <button
                  onClick={clearCustomStack}
                  className="text-xs text-text-secondary hover:text-neon-cyan transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Click peptides to add them to your custom stack (max 5).{' '}
              <span className="text-neon-cyan">{customStackPeptideIds.length}/5 selected</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {peptides.map((peptide) => {
                const selected = customStackPeptideIds.includes(peptide.id);
                const atLimit = customStackPeptideIds.length >= 5 && !selected;
                return (
                  <button
                    key={peptide.id}
                    disabled={atLimit}
                    onClick={() => {
                      if (selected) {
                        removeFromCustomStack(peptide.id);
                      } else {
                        addToCustomStack(peptide.id);
                      }
                    }}
                    className={cn(
                      'text-left p-2.5 rounded-lg border text-sm transition-all',
                      selected
                        ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                        : atLimit
                          ? 'bg-white/[0.02] border-white/[0.04] text-text-secondary/40 cursor-not-allowed'
                          : 'bg-white/[0.03] border-white/[0.06] text-foreground hover:border-neon-cyan/20 hover:bg-white/[0.06]',
                    )}
                  >
                    <span className="font-medium">{peptide.name}</span>
                    <span className="text-[10px] text-text-secondary ml-1 capitalize">
                      {peptide.category.replace(/-/g, ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Stack Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="glass-bright rounded-2xl border border-white/[0.08] p-5">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                {activeStack ? activeStack.name : 'Your Stack'}
              </h3>

              {displayPeptides.length === 0 ? (
                <p className="text-xs text-text-secondary italic">
                  Select a pre-built stack or add peptides to your custom stack.
                </p>
              ) : (
                <div className="space-y-2">
                  {displayPeptides.map((peptide) => (
                    <PeptideCard key={peptide.id} peptide={peptide} compact />
                  ))}
                </div>
              )}

              {/* Execute this stack CTA */}
              {displayPeptides.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <Link
                    href={
                      activeStack
                        ? `/atlas/stacks/execute?stackId=${activeStack.id}`
                        : `/atlas/stacks/execute?peptides=${displayPeptides.map((p) => p.id).join(',')}`
                    }
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-bold shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                  >
                    🚀 Execute this stack
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <p className="text-[10px] text-text-secondary text-center mt-1.5">
                    Reconstitution, syringe pulls, schedule, reminders — in one flow.
                  </p>
                </div>
              )}

              {(activeStack || customStackPeptideIds.length > 0) && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-2">
                    Combined Effects
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {(activeStack
                      ? activeStack.combinedEffects
                      : [...new Set(displayPeptides.flatMap((p) => p.effects))]
                    ).map((effect) => (
                      <span
                        key={effect}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 capitalize"
                      >
                        {effect.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {displayPeptides.length >= 2 && !analysis && !isAnalyzing && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => handleAnalyze(displayPeptides.map((p) => p.id))}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30 transition-all"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                    Analyze with AI
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <AILoadingSkeleton variant="analysis" />
                </div>
              )}

              {analysisError && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    {analysisError}
                  </div>
                </div>
              )}

              {analysis && (
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
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
