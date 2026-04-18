'use client';

/**
 * Community-sourced benchmarks for a single peptide. Queries CommunityProtocol records,
 * filters to those containing this peptide, and surfaces aggregate signals:
 * usage count, top goals, common co-peptides, and popularity proxy (upvotes).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import type { Schema } from '@/lib/amplify-data';

type Protocol = Schema['CommunityProtocol']['type'];

interface Props {
  peptideId: string;
}

export function PeptideBenchmarks({ peptideId }: Props) {
  const [protocols, setProtocols] = useState<Protocol[] | null>(null);

  useEffect(() => {
    dataClient.models.CommunityProtocol.list({
      filter: { published: { eq: true } },
      limit: 500,
    })
      .then(({ data }) => {
        setProtocols(
          (data ?? []).filter((p) => (p.peptideIds ?? []).includes(peptideId)),
        );
      })
      .catch(() => setProtocols([]));
  }, [peptideId]);

  const stats = useMemo(() => {
    if (!protocols || protocols.length === 0) return null;

    const goalCounts = new Map<string, number>();
    const copeptideCounts = new Map<string, number>();
    let totalUpvotes = 0;
    const experienceCounts = new Map<string, number>();

    for (const p of protocols) {
      for (const g of (p.goals ?? []).filter(Boolean) as string[]) {
        goalCounts.set(g, (goalCounts.get(g) ?? 0) + 1);
      }
      for (const pid of (p.peptideIds ?? []).filter(Boolean) as string[]) {
        if (pid === peptideId) continue;
        copeptideCounts.set(pid, (copeptideCounts.get(pid) ?? 0) + 1);
      }
      totalUpvotes += p.upvoteCount ?? 0;
      if (p.experience) {
        experienceCounts.set(p.experience, (experienceCounts.get(p.experience) ?? 0) + 1);
      }
    }

    const topGoals = Array.from(goalCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    const topCoPeptides = Array.from(copeptideCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, n]) => ({
        id,
        n,
        name: peptides.find((p) => p.id === id)?.name ?? id,
      }));

    return {
      total: protocols.length,
      totalUpvotes,
      topGoals,
      topCoPeptides,
      topProtocol: [...protocols]
        .sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0))[0],
    };
  }, [protocols, peptideId]);

  if (protocols === null) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">What the community is doing</h2>
        <div className="glass rounded-xl h-24 animate-pulse" />
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">What the community is doing</h2>
        <div className="glass rounded-xl p-4 text-center text-sm text-text-secondary">
          No published community protocols yet for this peptide.
          <Link href="/atlas/community" className="block mt-2 text-neon-cyan text-xs">
            Browse the community →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">What the community is doing</h2>
      <div className="glass rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">
              Published protocols
            </div>
            <div className="text-xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">
              Total upvotes
            </div>
            <div className="text-xl font-bold text-neon-green">{stats.totalUpvotes}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">
              Top goal
            </div>
            <div className="text-sm font-semibold text-foreground capitalize">
              {stats.topGoals[0]?.[0]?.replace(/-/g, ' ') ?? '—'}
            </div>
          </div>
        </div>

        {stats.topCoPeptides.length > 0 && (
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">
              Often combined with
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stats.topCoPeptides.map((cp) => (
                <span
                  key={cp.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-text-secondary border border-white/[0.06]"
                >
                  {cp.name}{' '}
                  <span className="text-neon-cyan">×{cp.n}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {stats.topProtocol && (
          <Link
            href={`/atlas/community/${stats.topProtocol.slug}`}
            className="block rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] text-neon-cyan uppercase tracking-wider">
                  Top-rated protocol using this peptide
                </div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {stats.topProtocol.name}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-neon-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="text-xs font-semibold text-neon-green">
                  {stats.topProtocol.upvoteCount ?? 0}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
