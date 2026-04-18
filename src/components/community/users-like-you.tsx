'use client';

/**
 * "Users like you" card for the dashboard. Fetches CommunityProtocols that overlap
 * with the current user's goals, ranks by upvotes, and shows the top 3.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import type { Schema } from '@/lib/amplify-data';

type Protocol = Schema['CommunityProtocol']['type'];

export function UsersLikeYou() {
  const [items, setItems] = useState<Protocol[] | null>(null);
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: profiles }, { data: protos }] = await Promise.all([
          dataClient.models.UserProfile.list(),
          dataClient.models.CommunityProtocol.list({
            filter: { published: { eq: true } },
            limit: 200,
          }),
        ]);
        const profile = profiles?.[0];
        const userGoals = ((profile?.goals ?? []).filter(Boolean) as string[]).map((g) =>
          g.toLowerCase(),
        );
        setGoals(userGoals);

        const matched = (protos ?? [])
          .filter((p) => {
            const pg = ((p.goals ?? []).filter(Boolean) as string[]).map((g) => g.toLowerCase());
            return userGoals.length === 0 || pg.some((g) => userGoals.includes(g));
          })
          .sort((a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0))
          .slice(0, 3);
        setItems(matched);
      } catch {
        setItems([]);
      }
    })();
  }, []);

  if (items === null) return null;
  if (items.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Users like you</h3>
          <p className="text-[10px] text-text-secondary">
            {goals.length > 0
              ? `Based on your goals: ${goals.slice(0, 2).join(', ')}`
              : 'Top protocols across the community'}
          </p>
        </div>
        <Link
          href="/atlas/community"
          className="text-xs text-neon-cyan hover:text-neon-cyan/80"
        >
          Browse all →
        </Link>
      </div>

      <div className="space-y-2">
        {items.map((p) => {
          const peptideNames = (p.peptideIds ?? [])
            .filter(Boolean)
            .slice(0, 4)
            .map((id) => peptides.find((pep) => pep.id === id)?.name ?? id)
            .join(' + ');
          return (
            <Link
              key={p.id}
              href={`/atlas/community/${p.slug}`}
              className="block rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{p.name}</div>
                  <div className="text-[10px] text-text-secondary truncate">{peptideNames}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-3 h-3 text-neon-green" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  <span className="text-[10px] font-semibold text-neon-green">
                    {p.upvoteCount ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
