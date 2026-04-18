'use client';

/**
 * Vendor directory list + filter controls.
 * Clicks open /api/vendors/click which redirects; we also log an AffiliateClick
 * fire-and-forget for analytics/revenue attribution.
 */

import { useMemo, useState } from 'react';
import { peptides } from '@/data/peptides';
import { vendors, type VendorTier, type TestingStatus } from '@/data/vendors';
import { dataClient } from '@/lib/amplify-data';
import { cn } from '@/lib/utils';

async function logClick(vendorId: string, peptideId?: string) {
  try {
    await dataClient.models.AffiliateClick.create({
      vendorId,
      peptideId: peptideId ?? null,
      clickedAt: new Date().toISOString(),
      referer: typeof window !== 'undefined' ? window.location.pathname : null,
    });
  } catch {
    // best-effort
  }
}

const TIER_ORDER: VendorTier[] = ['preferred', 'trusted', 'listed'];

const TIER_LABELS: Record<VendorTier, string> = {
  preferred: 'Preferred',
  trusted: 'Trusted',
  listed: 'Listed',
};

const TESTING_LABELS: Record<TestingStatus, string> = {
  independent: 'Independent testing',
  'in-house': 'In-house testing',
  none: 'No testing reported',
  unknown: 'Testing status unknown',
};

export function VendorDirectory() {
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<VendorTier | 'all'>('all');
  const [peptideFilter, setPeptideFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return vendors
      .filter((v) => (tierFilter === 'all' ? true : v.tier === tierFilter))
      .filter((v) => (peptideFilter === 'all' ? true : v.peptideSlugs.includes(peptideFilter)))
      .filter((v) =>
        !q
          ? true
          : v.name.toLowerCase().includes(q) ||
            v.tagline.toLowerCase().includes(q) ||
            v.specialties.some((s) => s.toLowerCase().includes(q)),
      )
      .sort(
        (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || b.rating - a.rating,
      );
  }, [query, tierFilter, peptideFilter]);

  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-3 grid md:grid-cols-3 gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors..."
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as VendorTier | 'all')}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
        >
          <option value="all" className="bg-[#111827]">
            All tiers
          </option>
          {TIER_ORDER.map((t) => (
            <option key={t} value={t} className="bg-[#111827]">
              {TIER_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={peptideFilter}
          onChange={(e) => setPeptideFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
        >
          <option value="all" className="bg-[#111827]">
            All peptides
          </option>
          {peptides.map((p) => (
            <option key={p.id} value={p.slug} className="bg-[#111827]">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-text-secondary">
          No vendors match your filter.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((v) => (
            <div key={v.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{v.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{v.tagline}</p>
                </div>
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                    v.tier === 'preferred' &&
                      'bg-neon-green/15 text-neon-green border-neon-green/30',
                    v.tier === 'trusted' &&
                      'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
                    v.tier === 'listed' &&
                      'bg-white/[0.05] text-text-secondary border-white/[0.1]',
                  )}
                >
                  {TIER_LABELS[v.tier]}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 text-[10px] text-text-secondary">
                <span>
                  ⭐ {v.rating}/10
                </span>
                <span>·</span>
                <span>{TESTING_LABELS[v.testingStatus]}</span>
                <span>·</span>
                <span>Ships to {v.shippingRegions.join(', ')}</span>
              </div>

              {v.peptideSlugs.length > 0 && (
                <div className="mt-3">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                    Stocks
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {v.peptideSlugs.slice(0, 8).map((slug) => {
                      const p = peptides.find((pp) => pp.slug === slug);
                      return (
                        <span
                          key={slug}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-secondary border border-white/[0.06]"
                        >
                          {p?.name ?? slug}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {v.notes && (
                <p className="text-[10px] text-amber-400 mt-3">Note: {v.notes}</p>
              )}

              <div className="mt-4">
                <a
                  href={`/api/vendors/click?vendor=${v.id}`}
                  target="_blank"
                  rel="noreferrer sponsored"
                  onClick={() => logClick(v.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
                >
                  Visit vendor
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-4 border border-amber-400/20">
        <div className="text-xs text-amber-400 font-semibold">Disclosure</div>
        <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
          PeptideAtlas may earn a commission if you purchase through affiliate links. This does
          not affect our editorial ratings. Vendors are listed for research-use peptides. Nothing
          here is a medical endorsement or prescription; always consult a licensed healthcare
          professional.
        </p>
      </div>
    </div>
  );
}
