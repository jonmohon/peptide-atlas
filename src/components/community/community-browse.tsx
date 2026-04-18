'use client';

/**
 * Community protocols browser. Lists all published CommunityProtocol records
 * with simple goal filter, sort by upvotes or recency, and card previews linking
 * to the detail page.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type CommunityProtocol = Schema['CommunityProtocol']['type'];
type SortKey = 'top' | 'new';

const GOAL_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'healing', label: 'Healing' },
  { id: 'muscle-growth', label: 'Muscle' },
  { id: 'fat-loss', label: 'Fat loss' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'anti-aging', label: 'Anti-aging' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'sexual', label: 'Sexual' },
  { id: 'immune', label: 'Immune' },
];

export function CommunityBrowse() {
  const [protocols, setProtocols] = useState<CommunityProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('top');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await dataClient.models.CommunityProtocol.list({
        filter: { published: { eq: true } },
        limit: 100,
      });
      setProtocols(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const f =
      goalFilter === 'all'
        ? protocols
        : protocols.filter((p) =>
            (p.goals ?? []).some((g) => g && g.toString() === goalFilter),
          );

    return [...f].sort((a, b) => {
      if (sort === 'top') return (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0);
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    });
  }, [protocols, goalFilter, sort]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass h-40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {GOAL_FILTERS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoalFilter(g.id)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                goalFilter === g.id
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                  : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
          {([['top', 'Top'], ['new', 'New']] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-all',
                sort === k
                  ? 'bg-neon-cyan/20 text-neon-cyan'
                  : 'text-text-secondary hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-text-secondary">
            No protocols yet for this filter. Be the first to publish one from your Saved Protocols.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProtocolCard key={p.id} protocol={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProtocolCard({ protocol }: { protocol: CommunityProtocol }) {
  const peptideLabels = (protocol.peptideIds ?? [])
    .filter(Boolean)
    .slice(0, 6)
    .map((id) => peptides.find((p) => p.id === id)?.name ?? id);

  return (
    <Link
      href={`/atlas/community/${protocol.slug}`}
      className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{protocol.name}</h3>
          <p className="text-[10px] text-text-secondary mt-0.5">
            by {protocol.authorName ?? 'Atlas user'} · {protocol.experience}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <svg className="w-3.5 h-3.5 text-neon-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-xs font-semibold text-neon-green">{protocol.upvoteCount ?? 0}</span>
        </div>
      </div>

      {protocol.description && (
        <p className="text-xs text-text-secondary mt-2 line-clamp-2">{protocol.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mt-3">
        {peptideLabels.map((label) => (
          <span
            key={label}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-secondary"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-text-secondary">
        {(protocol.goals ?? []).filter(Boolean).slice(0, 3).map((g) => (
          <span key={g as string} className="text-neon-cyan">#{g}</span>
        ))}
        {typeof protocol.durationWeeks === 'number' && (
          <span>· {protocol.durationWeeks} weeks</span>
        )}
      </div>
    </Link>
  );
}
