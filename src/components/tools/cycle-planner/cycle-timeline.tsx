'use client';

/**
 * Horizontal timeline visualization for a cycle plan.
 * Rows = peptides, columns = weeks. Shaded bars show ON weeks; gaps show OFF periods.
 */

import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import type { CycleEntry } from './types';
import { cycleEntryIsActiveInWeek } from './types';

interface Props {
  durationWeeks: number;
  entries: CycleEntry[];
  onRemove?: (entryId: string) => void;
}

const ROW_COLORS = [
  'bg-neon-cyan/50 border-neon-cyan/50',
  'bg-neon-green/50 border-neon-green/50',
  'bg-neon-orange/50 border-neon-orange/50',
  'bg-purple-400/50 border-purple-400/50',
  'bg-pink-400/50 border-pink-400/50',
  'bg-yellow-400/50 border-yellow-400/50',
];

function getPeptideLabel(peptideId: string): string {
  const p = peptides.find((pep) => pep.id === peptideId);
  return p?.name ?? peptideId;
}

export function CycleTimeline({ durationWeeks, entries, onRemove }: Props) {
  const weeks = Array.from({ length: durationWeeks }, (_, i) => i + 1);

  return (
    <div className="glass rounded-2xl p-4 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Week header */}
        <div className="flex gap-0.5 pl-32 mb-2">
          {weeks.map((w) => (
            <div
              key={w}
              className={cn(
                'flex-1 text-center text-[10px] font-mono',
                w % 4 === 0 || w === 1 ? 'text-text-secondary' : 'text-white/20',
              )}
            >
              {w === 1 || w % 4 === 0 ? `W${w}` : ''}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {entries.length === 0 && (
            <div className="py-10 text-center text-xs text-text-secondary">
              Add a peptide to start planning your cycle.
            </div>
          )}
          {entries.map((entry, idx) => {
            const color = ROW_COLORS[idx % ROW_COLORS.length];
            return (
              <div key={entry.id} className="flex items-center gap-0.5 group">
                <div className="w-32 pr-2 flex items-center justify-between shrink-0">
                  <div className="truncate">
                    <div className="text-xs font-semibold text-foreground truncate">
                      {getPeptideLabel(entry.peptideId)}
                    </div>
                    <div className="text-[10px] text-text-secondary truncate">
                      {entry.dose} {entry.unit}
                    </div>
                  </div>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(entry.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all text-xs ml-1"
                      aria-label="Remove"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="flex-1 flex gap-0.5 h-6">
                  {weeks.map((w) => {
                    const active = cycleEntryIsActiveInWeek(entry, w);
                    const isRestWeek =
                      active &&
                      entry.pattern === '4w2w' &&
                      (w - entry.startWeek) % 6 >= 4;
                    const isRestWeek8 =
                      active &&
                      entry.pattern === '8w4w' &&
                      (w - entry.startWeek) % 12 >= 8;
                    const isRestWeek12 =
                      active &&
                      entry.pattern === '12w4w' &&
                      (w - entry.startWeek) % 16 >= 12;
                    const resting = isRestWeek || isRestWeek8 || isRestWeek12;

                    return (
                      <div
                        key={w}
                        className={cn(
                          'flex-1 rounded-sm border transition-all',
                          active
                            ? resting
                              ? 'bg-white/[0.04] border-white/[0.08]'
                              : color
                            : 'bg-white/[0.02] border-white/[0.04]',
                        )}
                        title={`Week ${w}${active ? (resting ? ' (rest)' : ' (on)') : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
