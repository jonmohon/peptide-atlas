'use client';

/**
 * Living Profile panel — shows the aggregated AtlasContext (active protocols,
 * journal stats, latest bloodwork, streak, flagged markers) so the user can see
 * exactly what the AI knows about them in real time. Expands on demand.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useAtlasContext } from '@/hooks/use-atlas-context';
import { cn } from '@/lib/utils';

export function LivingProfile() {
  const { context, loading } = useAtlasContext();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return <div className="glass rounded-2xl h-40 animate-pulse" />;
  }

  const p = context.profile;
  const j = context.recentJournal;
  const active = context.activeProtocol;
  const labs = context.latestBloodwork;

  const hasAnyData =
    p.goals.length > 0 ||
    !!active ||
    j.entryCount > 0 ||
    !!labs ||
    p.weight != null ||
    p.age != null;

  return (
    <div className="glass rounded-2xl p-6 border border-purple-400/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-foreground">What Atlas knows about you</h2>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[10px] text-text-secondary hover:text-purple-400"
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>
      <p className="text-xs text-text-secondary mb-4">
        This is the profile the AI sees on every request. Update any section above to change it.
      </p>

      {!hasAnyData ? (
        <p className="text-xs text-text-secondary italic">
          Nothing yet. Fill in goals/stats above, log a journal entry, or build an execution
          plan — the AI will use all of it to personalize responses.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <StatTile
            label="Tier"
            value={p.tier}
            sub={
              p.tier === 'FREE' ? (
                <Link href="/pricing" className="text-neon-cyan hover:underline">
                  Upgrade →
                </Link>
              ) : null
            }
          />
          <StatTile
            label="Journal streak"
            value={`${j.currentStreakDays}d`}
            sub={j.entryCount > 0 ? `${j.entryCount} entries / 14d` : 'no entries'}
          />
          <StatTile
            label="Active protocol"
            value={active ? active.peptideNames.length + ' peptides' : '—'}
            sub={
              active?.cycleName ? (
                <Link
                  href="/atlas/tools/cycle-planner"
                  className="text-neon-cyan hover:underline"
                >
                  {active.cycleName}
                </Link>
              ) : (
                'build one →'
              )
            }
          />
          <StatTile
            label="Latest bloodwork"
            value={labs ? new Date(labs.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            sub={
              labs
                ? `${labs.flaggedMarkers.length} flagged`
                : (
                    <Link
                      href="/atlas/journal/bloodwork"
                      className="text-neon-cyan hover:underline"
                    >
                      Upload →
                    </Link>
                  )
            }
          />
        </div>
      )}

      {expanded && hasAnyData && (
        <div className="pt-3 border-t border-white/[0.06] space-y-3">
          {active && (
            <Section label="Active protocol details">
              <div className="space-y-1 text-xs text-text-secondary">
                {active.entries.map((e, i) => (
                  <div key={i}>
                    <span className="text-foreground font-medium">{e.peptide}</span> —{' '}
                    {e.dose} {e.unit}
                    {e.timeOfDay && ` · ${e.timeOfDay}`}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {j.entryCount > 0 && (
            <Section label="Recent journal averages (14d)">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                {j.averages.mood != null && (
                  <span>
                    mood{' '}
                    <span className="text-foreground font-mono">{j.averages.mood}/10</span>
                  </span>
                )}
                {j.averages.energy != null && (
                  <span>
                    energy{' '}
                    <span className="text-foreground font-mono">{j.averages.energy}/10</span>
                  </span>
                )}
                {j.averages.sleepQuality != null && (
                  <span>
                    sleep{' '}
                    <span className="text-foreground font-mono">
                      {j.averages.sleepQuality}/10
                    </span>
                  </span>
                )}
                {j.averages.sleepHours != null && (
                  <span>
                    hours{' '}
                    <span className="text-foreground font-mono">
                      {j.averages.sleepHours}h
                    </span>
                  </span>
                )}
                {j.averages.weight != null && (
                  <span>
                    weight{' '}
                    <span className="text-foreground font-mono">
                      {j.averages.weight} lbs
                    </span>
                  </span>
                )}
              </div>
              {j.recentSideEffects.length > 0 && (
                <div className="mt-2">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                    Recent side effects
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {j.recentSideEffects.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {labs && labs.flaggedMarkers.length > 0 && (
            <Section label={`Flagged bloodwork markers (${labs.date})`}>
              <div className="flex flex-wrap gap-1">
                {labs.flaggedMarkers.map((m) => (
                  <span
                    key={m.name}
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded border',
                      m.flag === 'high'
                        ? 'bg-red-400/10 text-red-400 border-red-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                    )}
                  >
                    {m.name}: {m.value} {m.unit} [{m.flag}]
                  </span>
                ))}
              </div>
            </Section>
          )}

          <p className="text-[10px] text-text-secondary/70 pt-1">
            Auto-updates when you log journal entries, upload bloodwork, or activate a
            protocol. You can always edit your core profile fields above.
          </p>
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
      <div className="text-[9px] text-text-secondary uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-foreground mt-0.5">{value}</div>
      {sub != null && <div className="text-[10px] text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
