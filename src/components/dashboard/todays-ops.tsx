'use client';

/**
 * "Today's Ops" — console-style glanceable panel at the top of /atlas showing
 * the next dose with live countdown, today's journal status, expiring vials,
 * streak status, and active-protocol progress. Each item links to the feature
 * where the user can act on it. Everything is best-effort: missing data is
 * hidden silently, not rendered as empty states.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { reconstitutedShelfLifeRemainingDays } from '@/lib/stack-execution/math';
import { useAtlasContext } from '@/hooks/use-atlas-context';
import { nextFireAt, DAYS_OF_WEEK, type DayOfWeek } from '@/lib/reminders';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type Reminder = Schema['Reminder']['type'];
type Inventory = Schema['Inventory']['type'];

interface OpsState {
  nextDose: {
    title: string;
    body: string;
    firesAt: Date;
  } | null;
  expiringVials: Array<{
    id: string;
    peptideName: string;
    daysLeft: number;
  }>;
  sealedVials: number;
  communityActivity: {
    unreadComments: number;
    totalUpvotes: number;
  };
  loaded: boolean;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `in ${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `in ${days}d ${remHours}h` : `in ${days}d`;
}

function formatAbsolute(date: Date): string {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `today ${time}`;
  if (isTomorrow) return `tomorrow ${time}`;
  return date.toLocaleDateString('en-US', { weekday: 'short' }) + ` ${time}`;
}

export function TodaysOps() {
  const { context, loading: contextLoading } = useAtlasContext();
  const [state, setState] = useState<OpsState>({
    nextDose: null,
    expiringVials: [],
    sealedVials: 0,
    communityActivity: { unreadComments: 0, totalUpvotes: 0 },
    loaded: false,
  });
  const [tick, setTick] = useState(0);

  // Re-render every 60s so the countdown stays fresh.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [reminderRes, inventoryRes, ownProtocolsRes] = await Promise.all([
        dataClient.models.Reminder.list({ limit: 50 }).catch(() => ({ data: [] as Reminder[] })),
        dataClient.models.Inventory.list({ limit: 100 }).catch(() => ({ data: [] as Inventory[] })),
        dataClient.models.CommunityProtocol.list({ limit: 20 }).catch(() => ({ data: [] as Schema['CommunityProtocol']['type'][] })),
      ]);

      const nextDose = findNextReminder(reminderRes.data ?? []);
      const { expiringVials, sealedVials } = summarizeInventory(inventoryRes.data ?? []);

      const communityActivity = {
        unreadComments: 0,
        totalUpvotes: (ownProtocolsRes.data ?? []).reduce(
          (sum, p) => sum + (p.upvoteCount ?? 0),
          0,
        ),
      };

      setState({
        nextDose,
        expiringVials,
        sealedVials,
        communityActivity,
        loaded: true,
      });
    } catch (err) {
      console.warn('TodaysOps load failed:', err);
      setState((s) => ({ ...s, loaded: true }));
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const todayLoggedInContext =
    context.recentJournal.dayRangeEnd === today && context.recentJournal.entryCount > 0;

  const streakAtRisk =
    context.recentJournal.currentStreakDays > 0 &&
    !todayLoggedInContext &&
    new Date().getHours() >= 18;

  const activeProtocol = context.activeProtocol;
  const protocolWeek = useMemo(() => {
    if (!activeProtocol?.startDate) return null;
    const start = new Date(activeProtocol.startDate);
    const now = new Date();
    const weeks = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1);
    return { current: weeks, total: activeProtocol.durationWeeks ?? null };
  }, [activeProtocol]);

  // Hide until one paint so cards don't flash empty/loading.
  if (!state.loaded && contextLoading) {
    return <div className="h-28 glass-bright rounded-2xl animate-pulse" />;
  }

  const nextDoseCountdown = state.nextDose
    ? formatCountdown(state.nextDose.firesAt.getTime() - Date.now())
    : null;

  const anyOps =
    !!state.nextDose ||
    state.expiringVials.length > 0 ||
    streakAtRisk ||
    !!protocolWeek ||
    state.communityActivity.totalUpvotes > 0;

  if (!anyOps) return null; // Let the static dashboard show through.

  return (
    <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan" />
          </span>
          Today&apos;s Ops
        </h2>
        <span className="text-[10px] text-text-secondary font-mono" suppressHydrationWarning>
          {/* tick is the re-render trigger; its value is irrelevant */}
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          <span className="sr-only">{tick}</span>
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        {state.nextDose && (
          <Link
            href="/atlas/reminders"
            className="rounded-xl bg-white/[0.03] border border-neon-cyan/20 hover:bg-white/[0.06] p-3 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-neon-cyan uppercase tracking-wider">
                Next dose
              </div>
              <div className="text-[10px] text-neon-cyan font-mono">{nextDoseCountdown}</div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1 truncate">
              {state.nextDose.title}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {state.nextDose.body} · {formatAbsolute(state.nextDose.firesAt)}
            </div>
          </Link>
        )}

        {streakAtRisk && (
          <Link
            href={`/atlas/journal/${today}`}
            className="rounded-xl bg-white/[0.03] border border-amber-400/25 hover:bg-amber-400/[0.05] p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">
                Streak at risk
              </div>
              <div className="text-[10px] text-amber-400 font-mono">🔥 {context.recentJournal.currentStreakDays}d</div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1">
              Log today to keep your streak
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              One tap — doses, mood, sleep. Takes a minute.
            </div>
          </Link>
        )}

        {state.expiringVials.length > 0 && (
          <Link
            href="/atlas/inventory"
            className={cn(
              'rounded-xl p-3 transition-all border',
              state.expiringVials[0].daysLeft <= 3
                ? 'bg-red-400/[0.04] border-red-400/25 hover:bg-red-400/[0.07]'
                : 'bg-amber-400/[0.04] border-amber-400/25 hover:bg-amber-400/[0.07]',
            )}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'text-[10px] uppercase tracking-wider',
                  state.expiringVials[0].daysLeft <= 3 ? 'text-red-400' : 'text-amber-400',
                )}
              >
                Expiring vials
              </div>
              <div
                className={cn(
                  'text-[10px] font-mono',
                  state.expiringVials[0].daysLeft <= 3 ? 'text-red-400' : 'text-amber-400',
                )}
              >
                {state.expiringVials.length} vial{state.expiringVials.length > 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1 truncate">
              {state.expiringVials
                .slice(0, 2)
                .map((v) => `${v.peptideName} · ${v.daysLeft}d`)
                .join(' • ')}
              {state.expiringVials.length > 2 && ` +${state.expiringVials.length - 2}`}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Reconstituted shelf-life running low.
            </div>
          </Link>
        )}

        {protocolWeek && activeProtocol && (
          <Link
            href="/atlas/tools/cycle-planner"
            className="rounded-xl bg-white/[0.03] border border-neon-green/25 hover:bg-neon-green/[0.05] p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-neon-green uppercase tracking-wider">
                Active cycle
              </div>
              <div className="text-[10px] text-neon-green font-mono">
                W{protocolWeek.current}
                {protocolWeek.total ? `/${protocolWeek.total}` : ''}
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1 truncate">
              {activeProtocol.cycleName ?? 'Active protocol'}
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {activeProtocol.peptideNames.slice(0, 3).join(', ')}
              {activeProtocol.peptideNames.length > 3 &&
                ` +${activeProtocol.peptideNames.length - 3}`}
            </div>
          </Link>
        )}

        {state.communityActivity.totalUpvotes > 0 && (
          <Link
            href="/atlas/community"
            className="rounded-xl bg-white/[0.03] border border-purple-400/25 hover:bg-purple-400/[0.05] p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-purple-400 uppercase tracking-wider">
                Community
              </div>
              <div className="text-[10px] text-purple-400 font-mono">
                👍 {state.communityActivity.totalUpvotes}
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1">
              Your published protocols are getting traction
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Check replies and new upvotes.
            </div>
          </Link>
        )}

        {context.latestBloodwork && isBloodworkStale(context.latestBloodwork.date) && (
          <Link
            href="/atlas/journal/bloodwork"
            className="rounded-xl bg-white/[0.03] border border-white/[0.1] hover:bg-white/[0.06] p-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">
                Bloodwork
              </div>
              <div className="text-[10px] text-text-secondary font-mono">
                {monthsAgo(context.latestBloodwork.date)}mo ago
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground mt-1">
              Time for a new panel?
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Most protocols benefit from quarterly labs.
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function findNextReminder(reminders: Reminder[]): OpsState['nextDose'] {
  const now = new Date();
  const candidates: Array<{ reminder: Reminder; firesAt: Date }> = [];

  for (const r of reminders) {
    if (!r.enabled) continue;
    const at = nextFireAt(r, now);
    if (at) candidates.push({ reminder: r, firesAt: at });
  }

  candidates.sort((a, b) => a.firesAt.getTime() - b.firesAt.getTime());
  const next = candidates[0];
  if (!next) return null;

  const peptide = peptides.find((p) => p.id === next.reminder.peptideId);
  const peptideLabel = peptide?.name ?? next.reminder.title;
  const body =
    next.reminder.dose && next.reminder.unit
      ? `${next.reminder.dose} ${next.reminder.unit}`
      : next.reminder.body ?? 'scheduled dose';

  return {
    title: peptideLabel,
    body,
    firesAt: next.firesAt,
  };
}

function summarizeInventory(items: Inventory[]) {
  const expiring: OpsState['expiringVials'] = [];
  let sealed = 0;

  for (const item of items) {
    if (!item.reconstituted || !item.reconstitutedAt) {
      sealed += item.quantity ?? 1;
      continue;
    }
    const recon = getReconstitutionInfo(item.peptideId);
    const shelfDays = recon?.shelfLifeReconstitutedDays ?? 28;
    const remaining = reconstitutedShelfLifeRemainingDays(
      new Date(item.reconstitutedAt),
      shelfDays,
    );
    if (remaining <= 7) {
      expiring.push({
        id: item.id,
        peptideName: peptides.find((p) => p.id === item.peptideId)?.name ?? item.peptideId,
        daysLeft: Math.floor(remaining),
      });
    }
  }

  expiring.sort((a, b) => a.daysLeft - b.daysLeft);
  return { expiringVials: expiring, sealedVials: sealed };
}

function isBloodworkStale(dateStr: string): boolean {
  const lab = new Date(dateStr);
  const now = new Date();
  const months = (now.getTime() - lab.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return months >= 3;
}

function monthsAgo(dateStr: string): number {
  const lab = new Date(dateStr);
  const now = new Date();
  return Math.round((now.getTime() - lab.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
}

// Re-export DAY constants for potential external use; avoids unused-import warnings.
export { DAYS_OF_WEEK, type DayOfWeek };
