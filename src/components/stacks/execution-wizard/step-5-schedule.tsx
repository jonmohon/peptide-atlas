'use client';

/**
 * Step 5 — Schedule designer. Each peptide gets a time slot + days-of-week + time +
 * injection site. Defaults are seeded by schedule-defaults.ts. Shows a plasma-concentration
 * curve overlay for peptides with halfLifeHours populated, and flags timing conflicts
 * between peptides scheduled at the same slot.
 */

import { useMemo, useState } from 'react';
import { peptides } from '@/data/peptides';
import {
  TIME_SLOT_LABELS,
  TIME_SLOT_HHMM,
  defaultTimeSlot,
  timingConflict,
  type TimeSlot,
} from '@/lib/stack-execution/schedule-defaults';
import { cn } from '@/lib/utils';
import { PkCurve } from './pk-curve';
import type { WizardState } from './types';

const SLOT_ORDER: TimeSlot[] = [
  'morning',
  'preworkout',
  'evening',
  'bedtime',
  'weekly',
  'flexible',
];

const DAYS: Array<{ id: string; label: string }> = [
  { id: 'SUN', label: 'S' },
  { id: 'MON', label: 'M' },
  { id: 'TUE', label: 'T' },
  { id: 'WED', label: 'W' },
  { id: 'THU', label: 'T' },
  { id: 'FRI', label: 'F' },
  { id: 'SAT', label: 'S' },
];

const DAY_INDEX: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const INJECTION_SITES = [
  'abdomen-L',
  'abdomen-R',
  'thigh-L',
  'thigh-R',
  'deltoid-L',
  'deltoid-R',
  'glute-L',
  'glute-R',
];

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export function Step5Schedule({ state, setState }: Props) {
  const [showPkOverlay, setShowPkOverlay] = useState(false);

  function update(id: string, patch: Partial<WizardState['schedule'][string]>) {
    setState((s) => ({
      ...s,
      schedule: { ...s.schedule, [id]: { ...s.schedule[id], ...patch } },
    }));
  }

  function setSlot(id: string, slot: TimeSlot) {
    update(id, {
      slot,
      time: TIME_SLOT_HHMM[slot],
      daysOfWeek: slot === 'weekly' ? ['MON'] : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    });
  }

  function toggleDay(id: string, day: string) {
    const current = state.schedule[id]?.daysOfWeek ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    update(id, { daysOfWeek: next });
  }

  // Detect conflicts: peptides at same slot with incompatibilities.
  const conflicts = useMemo(() => {
    const bySlot = new Map<TimeSlot, string[]>();
    for (const id of state.peptideIds) {
      const sched = state.schedule[id];
      if (!sched) continue;
      const list = bySlot.get(sched.slot) ?? [];
      list.push(id);
      bySlot.set(sched.slot, list);
    }
    const found: { a: string; b: string; slot: TimeSlot; msg: string }[] = [];
    for (const [slot, ids] of bySlot.entries()) {
      if (ids.length < 2) continue;
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const a = peptides.find((p) => p.id === ids[i]);
          const b = peptides.find((p) => p.id === ids[j]);
          if (!a || !b) continue;
          const msg = timingConflict(a, b, slot);
          if (msg) found.push({ a: ids[i], b: ids[j], slot, msg });
        }
      }
    }
    return found;
  }, [state.peptideIds, state.schedule]);

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">When and where</h2>
            <p className="text-xs text-text-secondary mt-1">
              Pick a time-of-day slot, days of the week, and rotating injection site for each
              peptide. We&apos;ve pre-filled reasonable defaults based on peptide class.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-text-secondary shrink-0">
            <input
              type="checkbox"
              checked={showPkOverlay}
              onChange={(e) => setShowPkOverlay(e.target.checked)}
              className="accent-neon-cyan"
            />
            PK curve
          </label>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-amber-400/20">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            Timing notes
          </div>
          <ul className="space-y-1 text-xs text-text-secondary">
            {conflicts.map((c, i) => (
              <li key={i}>{c.msg}</li>
            ))}
          </ul>
        </div>
      )}

      {state.peptideIds.map((id) => {
        const peptide = peptides.find((p) => p.id === id);
        if (!peptide) return null;
        const sched = state.schedule[id];
        if (!sched) return null;

        const doseSlots =
          sched.daysOfWeek.map((d) => ({
            dayIndex: DAY_INDEX[d] ?? 1,
            hour: Number(sched.time.split(':')[0]) || 8,
          })) ?? [];

        return (
          <div key={id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{peptide.name}</h3>
                <p className="text-[10px] text-text-secondary capitalize">
                  {peptide.category.replace(/-/g, ' ')} · default:{' '}
                  {TIME_SLOT_LABELS[defaultTimeSlot(peptide)]}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Time slot
                </label>
                <div className="flex flex-wrap gap-1">
                  {SLOT_ORDER.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSlot(id, slot)}
                      className={cn(
                        'px-2.5 py-1 rounded text-[11px] font-medium transition-all border',
                        sched.slot === slot
                          ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                          : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
                      )}
                    >
                      {TIME_SLOT_LABELS[slot].split(' ')[0]}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  {TIME_SLOT_LABELS[sched.slot]}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={sched.time}
                    onChange={(e) => update(id, { time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                    Injection site
                  </label>
                  <select
                    value={sched.injectionSite ?? 'abdomen-L'}
                    onChange={(e) => update(id, { injectionSite: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
                  >
                    {INJECTION_SITES.map((site) => (
                      <option key={site} value={site} className="bg-[#111827]">
                        {site}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Days
                </label>
                <div className="flex gap-1">
                  {DAYS.map((d) => {
                    const active = sched.daysOfWeek.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        onClick={() => toggleDay(id, d.id)}
                        className={cn(
                          'w-8 h-8 rounded-full text-[11px] font-semibold transition-all border',
                          active
                            ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                            : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
                        )}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showPkOverlay && peptide.halfLifeHours ? (
                <div className="mt-2">
                  <PkCurve
                    halfLifeHours={peptide.halfLifeHours}
                    doseSlots={doseSlots}
                    label={peptide.name}
                  />
                </div>
              ) : showPkOverlay ? (
                <div className="text-[10px] text-text-secondary/60 italic">
                  Half-life not in our database yet — PK curve skipped.
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
