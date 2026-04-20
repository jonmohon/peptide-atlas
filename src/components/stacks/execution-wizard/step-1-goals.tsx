'use client';

/**
 * Step 1 — Goal confirmation. Pulls the user's saved goals from UserProfile and
 * compares against the stack's primary goal or the AI-inferred goal for a custom stack.
 * Fast to skip for experienced users who know what they're doing.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { stacks } from '@/data/stacks';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import type { WizardState } from './types';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export function Step1Goals({ state, setState }: Props) {
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dataClient.models.UserProfile.list()
      .then(({ data }) => {
        const goals = ((data?.[0]?.goals ?? []).filter(Boolean) as string[]).map((g) =>
          g.toLowerCase(),
        );
        setUserGoals(goals);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const stack = state.stackSlug
    ? stacks.find((s) => s.slug === state.stackSlug || s.id === state.stackSlug) ?? null
    : null;

  const primaryGoal = stack?.goal ?? inferGoalFromPeptides(state.peptideIds);
  const overlap =
    userGoals.length === 0
      ? null
      : userGoals.some((g) => primaryGoal.toLowerCase().includes(g) || g.includes(primaryGoal.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-cyan/15 flex items-center justify-center text-neon-cyan font-bold shrink-0">
            1
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">Confirm your goal</h2>
            <p className="text-xs text-text-secondary mt-1">
              This stack targets{' '}
              <span className="text-neon-cyan font-semibold capitalize">
                {primaryGoal.replace(/-/g, ' ')}
              </span>
              . The rest of the wizard will tailor doses, schedule, and expected results to
              this goal.
            </p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <label className="block text-xs text-text-secondary mb-1">Protocol name</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Plan duration (weeks)</label>
            <input
              type="number"
              min={2}
              max={52}
              value={state.durationWeeks}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  durationWeeks: Math.max(2, Math.min(52, Number(e.target.value))),
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Peptides</label>
            <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-foreground">
              {state.peptideIds.length} in stack
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Your profile goals
          </h3>
          <Link
            href="/atlas/profile"
            className="text-[10px] text-text-secondary hover:text-neon-cyan"
          >
            Edit profile →
          </Link>
        </div>

        {!loaded ? (
          <div className="h-8 rounded-lg bg-white/[0.03] animate-pulse" />
        ) : userGoals.length === 0 ? (
          <p className="text-xs text-text-secondary">
            You haven&apos;t set any goals yet.{' '}
            <Link href="/atlas/profile" className="text-neon-cyan hover:underline">
              Add some
            </Link>{' '}
            so the AI can tailor recommendations. You can still proceed.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1 mb-2">
              {userGoals.map((g) => (
                <span
                  key={g}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-text-secondary border border-white/[0.06] capitalize"
                >
                  {g.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
            {overlap === true && (
              <p className="text-xs text-neon-green">
                ✓ This stack aligns with your goals.
              </p>
            )}
            {overlap === false && (
              <p className="text-xs text-amber-400">
                Heads up — this stack targets &ldquo;{primaryGoal.replace(/-/g, ' ')}&rdquo;,
                which isn&apos;t in your stated goals. That&apos;s fine if it&apos;s a new
                experiment; just making sure.
              </p>
            )}
          </>
        )}
      </div>

      <label className="glass rounded-2xl p-4 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={state.goalsConfirmed}
          onChange={(e) => setState((s) => ({ ...s, goalsConfirmed: e.target.checked }))}
          className="mt-0.5 accent-neon-cyan"
        />
        <div>
          <div className="text-sm font-semibold text-foreground">I know what I&apos;m doing</div>
          <div className="text-xs text-text-secondary">
            I understand this is educational, not medical advice. I&apos;ve consulted or will
            consult a healthcare professional before injecting.
          </div>
        </div>
      </label>
    </div>
  );
}

function inferGoalFromPeptides(peptideIds: string[]): string {
  const categories = peptideIds
    .map((id) => peptides.find((p) => p.id === id)?.category)
    .filter(Boolean) as string[];
  if (categories.length === 0) return 'general wellness';
  // Most common category wins
  const counts = new Map<string, number>();
  for (const c of categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  const top = [...counts.entries()].sort(([, a], [, b]) => b - a)[0];
  return top?.[0].replace(/-/g, ' ') ?? 'general wellness';
}
