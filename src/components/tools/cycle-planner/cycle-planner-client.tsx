'use client';

/**
 * Main Cycle Planner UI — name/start/duration header, add/remove peptide entries,
 * timeline visualization, overlap warnings, AI analysis button, and save to DynamoDB.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { PremiumGate } from '@/components/auth/premium-gate';
import { cn } from '@/lib/utils';
import { CycleTimeline } from './cycle-timeline';
import { AddEntryModal } from './add-entry-modal';
import { detectOverlaps } from './types';
import type { CycleEntry, CyclePlan } from './types';

const DEFAULT_PLAN: CyclePlan = {
  name: 'My Cycle',
  startDate: new Date().toISOString().split('T')[0],
  durationWeeks: 12,
  entries: [],
  aiAnalysis: null,
};

function peptideName(id: string): string {
  return peptides.find((p) => p.id === id)?.name ?? id;
}

export function CyclePlannerClient() {
  const [plan, setPlan] = useState<CyclePlan>(DEFAULT_PLAN);
  const [savedCycles, setSavedCycles] = useState<CyclePlan[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    loadCycles();
  }, []);

  async function loadCycles() {
    try {
      const { data } = await dataClient.models.Cycle.list();
      if (!data) return;
      const cycles: CyclePlan[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        startDate: c.startDate,
        durationWeeks: c.durationWeeks,
        entries: Array.isArray(c.entries) ? (c.entries as CycleEntry[]) : [],
        notes: c.notes ?? undefined,
        active: c.active ?? undefined,
        aiAnalysis: (c.aiAnalysis as CyclePlan['aiAnalysis']) ?? null,
      }));
      setSavedCycles(cycles);
      const active = cycles.find((c) => c.active) ?? cycles[0];
      if (active) setPlan(active);
    } catch (err) {
      console.error('Failed to load cycles:', err);
    }
  }

  async function savePlan() {
    setSaving(true);
    try {
      if (plan.id) {
        await dataClient.models.Cycle.update({
          id: plan.id,
          name: plan.name,
          startDate: plan.startDate,
          durationWeeks: plan.durationWeeks,
          entries: plan.entries,
          notes: plan.notes ?? null,
          active: plan.active ?? true,
          aiAnalysis: plan.aiAnalysis ?? null,
        });
      } else {
        const { data } = await dataClient.models.Cycle.create({
          name: plan.name,
          startDate: plan.startDate,
          durationWeeks: plan.durationWeeks,
          entries: plan.entries,
          notes: plan.notes ?? null,
          active: true,
          aiAnalysis: plan.aiAnalysis ?? null,
        });
        if (data) setPlan((prev) => ({ ...prev, id: data.id }));
      }
      setSavedAt(Date.now());
      loadCycles();
    } catch (err) {
      console.error('Failed to save cycle:', err);
    } finally {
      setSaving(false);
    }
  }

  async function analyzeCycle() {
    if (plan.entries.length < 2) {
      setAnalysisError('Add at least 2 peptides to analyze synergy.');
      return;
    }
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peptideIds: plan.entries.map((e) => e.peptideId),
          cycleContext: {
            durationWeeks: plan.durationWeeks,
            entries: plan.entries.map((e) => ({
              peptide: peptideName(e.peptideId),
              startWeek: e.startWeek,
              durationWeeks: e.durationWeeks,
              pattern: e.pattern,
              dose: `${e.dose} ${e.unit}`,
            })),
          },
        }),
      });
      if (!res.ok) throw new Error(`Analyze failed (${res.status})`);
      const data = await res.json();
      setPlan((p) => ({ ...p, aiAnalysis: data }));
    } catch (err) {
      console.error(err);
      setAnalysisError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function addEntry(entry: CycleEntry) {
    setPlan((p) => ({ ...p, entries: [...p.entries, entry], aiAnalysis: null }));
  }

  function removeEntry(id: string) {
    setPlan((p) => ({ ...p, entries: p.entries.filter((e) => e.id !== id), aiAnalysis: null }));
  }

  function newPlan() {
    setPlan({ ...DEFAULT_PLAN, startDate: new Date().toISOString().split('T')[0] });
  }

  const overlaps = detectOverlaps(plan.entries);

  return (
    <div className="space-y-6">
      {/* Saved cycles picker */}
      {savedCycles.length > 0 && (
        <div className="glass rounded-xl p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-text-secondary">Saved plans:</span>
          {savedCycles.map((c) => (
            <button
              key={c.id}
              onClick={() => setPlan(c)}
              className={cn(
                'px-3 py-1 rounded-full text-xs transition-all',
                plan.id === c.id
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:bg-white/[0.08]',
              )}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={newPlan}
            className="px-3 py-1 rounded-full text-xs text-text-secondary border border-dashed border-white/[0.1] hover:text-foreground hover:border-white/[0.2]"
          >
            + New plan
          </button>
        </div>
      )}

      {/* Header: plan name, start date, duration */}
      <div className="glass rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Plan name</label>
          <input
            type="text"
            value={plan.name}
            onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Start date</label>
          <input
            type="date"
            value={plan.startDate}
            onChange={(e) => setPlan((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Duration (weeks)</label>
          <input
            type="number"
            min={4}
            max={52}
            value={plan.durationWeeks}
            onChange={(e) =>
              setPlan((p) => ({ ...p, durationWeeks: Math.max(4, Math.min(52, Number(e.target.value))) }))
            }
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Timeline</h2>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all"
          >
            + Add peptide
          </button>
        </div>
        <CycleTimeline
          durationWeeks={plan.durationWeeks}
          entries={plan.entries}
          onRemove={removeEntry}
        />
      </div>

      {/* Entries detail */}
      {plan.entries.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Entries</h2>
          <div className="space-y-2">
            {plan.entries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04]"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{peptideName(e.peptideId)}</div>
                  <div className="text-xs text-text-secondary">
                    Week {e.startWeek}–{e.startWeek + e.durationWeeks - 1} · {e.pattern} · {e.dose}{' '}
                    {e.unit}
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-text-secondary hover:text-red-400 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlap warnings */}
      {overlaps.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-amber-400/20">
          <h2 className="text-sm font-semibold text-amber-400 mb-2">Overlaps detected</h2>
          <ul className="space-y-1 text-xs text-text-secondary">
            {overlaps.map((o, i) => (
              <li key={i}>
                <span className="font-semibold text-foreground">
                  {peptideName(o.a.peptideId)} + {peptideName(o.b.peptideId)}
                </span>{' '}
                overlap weeks {o.weeks[0]}
                {o.weeks.length > 1 ? `–${o.weeks[o.weeks.length - 1]}` : ''} (
                {o.weeks.length} week{o.weeks.length > 1 ? 's' : ''})
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-text-secondary/70 mt-2">
            Overlaps can be intentional (synergistic stacks) or conflicting. Run AI analysis for
            specific recommendations.
          </p>
        </div>
      )}

      {/* AI Analysis (Pro gated) */}
      <PremiumGate
        feature="comparison_insights"
        fallback={
          <div className="glass rounded-2xl p-5 text-center border border-neon-cyan/20">
            <h3 className="text-sm font-semibold text-foreground">AI Cycle Analysis</h3>
            <p className="text-xs text-text-secondary mt-1 mb-3">
              Upgrade to PRO to get AI-driven synergy scoring, timing suggestions, and issue
              detection for your cycle.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
            >
              See plans
            </Link>
          </div>
        }
      >
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">AI Cycle Analysis</h2>
            <button
              onClick={analyzeCycle}
              disabled={analyzing || plan.entries.length < 2}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                analyzing || plan.entries.length < 2
                  ? 'bg-white/[0.04] text-text-secondary cursor-not-allowed'
                  : 'bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30',
              )}
            >
              {analyzing ? 'Analyzing...' : 'Analyze cycle'}
            </button>
          </div>
          {analysisError && <p className="text-xs text-red-400 mb-2">{analysisError}</p>}
          {plan.aiAnalysis ? (
            <div className="space-y-3">
              {plan.aiAnalysis.summary && (
                <p className="text-sm text-foreground">{plan.aiAnalysis.summary}</p>
              )}
              {typeof plan.aiAnalysis.overallScore === 'number' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Overall score:</span>
                  <span className="text-sm font-bold text-neon-green">
                    {plan.aiAnalysis.overallScore}/10
                  </span>
                </div>
              )}
              {plan.aiAnalysis.synergies?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neon-green mb-1">Synergies</div>
                  <ul className="text-xs text-text-secondary space-y-0.5 list-disc pl-4">
                    {plan.aiAnalysis.synergies.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.aiAnalysis.issues?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber-400 mb-1">Issues</div>
                  <ul className="text-xs text-text-secondary space-y-0.5 list-disc pl-4">
                    {plan.aiAnalysis.issues.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.aiAnalysis.suggestions?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-neon-cyan mb-1">Suggestions</div>
                  <ul className="text-xs text-text-secondary space-y-0.5 list-disc pl-4">
                    {plan.aiAnalysis.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-secondary">
              Add 2+ peptides and click Analyze for AI synergy scoring, timing suggestions, and
              issue detection.
            </p>
          )}
        </div>
      </PremiumGate>

      {/* Save bar */}
      <PremiumGate
        feature="cycle_planner"
        fallback={
          <div className="glass rounded-xl p-4 text-center border border-neon-cyan/20">
            <p className="text-xs text-text-secondary mb-2">
              Saving cycles requires a Pro subscription.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
            >
              Upgrade
            </Link>
          </div>
        }
      >
        <div className="flex justify-end">
          <button
            onClick={savePlan}
            disabled={saving || plan.entries.length === 0}
            className={cn(
              'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
              savedAt && Date.now() - savedAt < 2000
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30',
            )}
          >
            {saving
              ? 'Saving...'
              : savedAt && Date.now() - savedAt < 2000
                ? 'Saved ✓'
                : plan.id
                  ? 'Update plan'
                  : 'Save plan'}
          </button>
        </div>
      </PremiumGate>

      <AddEntryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={addEntry}
        maxWeeks={plan.durationWeeks}
        existingEntries={plan.entries}
      />
    </div>
  );
}
