'use client';

/**
 * Daily journal entry form for a specific date ([date] route param).
 * Manages collapsible sections for doses, metrics, diet, side effects, and notes,
 * with copy-from-yesterday and prev/next day navigation.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DoseLog } from '@/components/journal/dose-log';
import { MetricSliders } from '@/components/journal/metric-sliders';
import { SideEffectPicker } from '@/components/journal/side-effect-picker';
import { useJournalStore } from '@/stores/use-journal-store';
import { dataClient } from '@/lib/amplify-data';
import { maybeUnlock } from '@/lib/achievements';
import { cn } from '@/lib/utils';

type Section = 'doses' | 'metrics' | 'diet' | 'effects' | 'notes';

export default function JournalEntryPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  const { draft, isDirty, saving, loading, loadEntry, saveEntry, loadPreviousEntry, updateDraft, addDose, updateDose, removeDose, copyDosesFromEntry, currentStreak } = useJournalStore();
  const [openSections, setOpenSections] = useState<Set<Section>>(new Set(['doses', 'metrics']));
  const [microInsight, setMicroInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    loadEntry(date);
  }, [date, loadEntry]);

  const toggleSection = (section: Section) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleSave = async () => {
    const ok = await saveEntry();
    if (!ok) return;

    try {
      await maybeUnlock('FIRST_JOURNAL');
      const streakAfter = useJournalStore.getState().currentStreak;
      if (streakAfter >= 7) await maybeUnlock('WEEK_STREAK');
      if (streakAfter >= 30) await maybeUnlock('MONTH_STREAK');
    } catch {
      // Achievement unlock is best-effort.
    }

    setLoadingInsight(true);
    setMicroInsight(null);
    try {
      const { data: all } = await dataClient.models.JournalEntry.list({ limit: 30 });
      const recent = (all ?? [])
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14)
        .map((e) => ({
          date: e.date,
          peptideDoses: e.peptideDoses,
          mood: e.mood,
          energy: e.energy,
          sleepHours: e.sleepHours,
          sleepQuality: e.sleepQuality,
          weight: e.weight,
          sideEffects: e.sideEffects,
        }));

      const res = await fetch('/api/ai/micro-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: recent }),
      });
      if (res.ok) {
        const data = await res.json();
        setMicroInsight(data.insight ?? null);
      }
    } catch {
      // Insight is best-effort.
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleCopyYesterday = async () => {
    const prev = await loadPreviousEntry(date);
    if (prev && prev.peptideDoses.length > 0) {
      copyDosesFromEntry(prev);
    }
  };

  const navigateDay = (offset: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (newDate <= today) {
      router.push(`/atlas/journal/${newDate}`);
    }
  };

  const dateObj = new Date(date + 'T12:00:00');
  const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const isToday = date === new Date().toISOString().split('T')[0];

  if (!draft) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/atlas/journal')}
            className="text-xs text-text-secondary hover:text-neon-cyan transition-colors"
          >
            &larr; Journal
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={cn(
            'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
            isDirty
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
              : 'bg-white/[0.05] text-text-secondary border border-white/[0.06] cursor-default'
          )}
        >
          {saving ? 'Saving...' : isDirty ? 'Save Entry' : 'Saved'}
        </button>
      </div>

      {/* Date nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateDay(-1)} className="p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground">{dateLabel}</h1>
          {isToday && <span className="text-xs text-neon-cyan">Today</span>}
        </div>
        <button
          onClick={() => navigateDay(1)}
          disabled={isToday}
          className={cn(
            'p-2 rounded-lg text-text-secondary',
            isToday ? 'opacity-20' : 'hover:bg-white/[0.05]'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Copy from yesterday */}
      {draft.peptideDoses.length === 0 && (
        <button
          onClick={handleCopyYesterday}
          className="w-full mb-4 p-3 rounded-xl border border-dashed border-white/[0.1] text-xs text-text-secondary hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-center"
        >
          Copy doses from yesterday
        </button>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {/* Doses */}
        <CollapsibleSection
          title="Peptide Doses"
          count={draft.peptideDoses.length}
          open={openSections.has('doses')}
          onToggle={() => toggleSection('doses')}
        >
          <DoseLog
            doses={draft.peptideDoses}
            onAdd={addDose}
            onUpdate={updateDose}
            onRemove={removeDose}
          />
        </CollapsibleSection>

        {/* Metrics */}
        <CollapsibleSection
          title="How You Feel & Body Metrics"
          badge={draft.mood ? `${draft.mood}/10` : undefined}
          open={openSections.has('metrics')}
          onToggle={() => toggleSection('metrics')}
        >
          <MetricSliders
            mood={draft.mood}
            energy={draft.energy}
            sleepQuality={draft.sleepQuality}
            sleepHours={draft.sleepHours}
            weight={draft.weight}
            bodyFat={draft.bodyFat}
            onUpdate={(field, value) => updateDraft({ [field]: value })}
          />
        </CollapsibleSection>

        {/* Diet */}
        <CollapsibleSection
          title="Diet Notes"
          badge={draft.dietNotes ? 'Logged' : undefined}
          open={openSections.has('diet')}
          onToggle={() => toggleSection('diet')}
        >
          <textarea
            value={draft.dietNotes}
            onChange={(e) => updateDraft({ dietNotes: e.target.value })}
            placeholder="What did you eat today? Any changes to your diet?"
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 resize-none"
          />
        </CollapsibleSection>

        {/* Side Effects */}
        <CollapsibleSection
          title="Side Effects"
          count={draft.sideEffects.length}
          open={openSections.has('effects')}
          onToggle={() => toggleSection('effects')}
        >
          <SideEffectPicker
            effects={draft.sideEffects}
            onChange={(effects) => updateDraft({ sideEffects: effects })}
          />
        </CollapsibleSection>

        {/* Notes */}
        <CollapsibleSection
          title="Notes"
          badge={draft.subjectiveNotes ? 'Logged' : undefined}
          open={openSections.has('notes')}
          onToggle={() => toggleSection('notes')}
        >
          <textarea
            value={draft.subjectiveNotes}
            onChange={(e) => updateDraft({ subjectiveNotes: e.target.value })}
            placeholder="How are you feeling overall? Anything notable today?"
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50 resize-none"
          />
        </CollapsibleSection>
      </div>

      {/* Bottom save */}
      {isDirty && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all text-sm font-semibold"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      )}

      {/* Post-save micro-insight */}
      {(loadingInsight || microInsight) && (
        <div className="mt-6 glass rounded-xl p-4 border border-purple-400/20 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-400/15 flex items-center justify-center shrink-0">
            {loadingInsight ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
              Atlas observation
            </div>
            <div className="text-sm text-foreground mt-0.5 leading-relaxed">
              {loadingInsight ? 'Looking for patterns...' : microInsight}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  count?: number;
  badge?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-neon-cyan/20 text-neon-cyan text-[10px] font-medium">
              {count}
            </span>
          )}
          {badge && (
            <span className="px-1.5 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-[10px] font-medium">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={cn('w-4 h-4 text-text-secondary transition-transform', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
