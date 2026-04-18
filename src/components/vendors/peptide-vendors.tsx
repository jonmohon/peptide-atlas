/**
 * "Where to get this" vendor list for a specific peptide. Server component —
 * renders the statically curated vendors from src/data/vendors.ts, each linking
 * through /api/vendors/click for tracking.
 */

import Link from 'next/link';
import { vendorsForPeptide } from '@/data/vendors';
import { cn } from '@/lib/utils';

const TIER_CLASSES = {
  preferred: 'bg-neon-green/15 text-neon-green border-neon-green/30',
  trusted: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30',
  listed: 'bg-white/[0.05] text-text-secondary border-white/[0.1]',
} as const;

interface Props {
  peptideSlug: string;
  peptideId: string;
}

export function PeptideVendors({ peptideSlug, peptideId }: Props) {
  const vendors = vendorsForPeptide(peptideSlug);
  if (vendors.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Where to get this</h2>
        <Link href="/atlas/vendors" className="text-xs text-neon-cyan hover:underline">
          Full directory →
        </Link>
      </div>
      <div className="space-y-2">
        {vendors.slice(0, 3).map((v) => (
          <div
            key={v.id}
            className="glass rounded-xl p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{v.name}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full border font-semibold shrink-0',
                    TIER_CLASSES[v.tier],
                  )}
                >
                  {v.tier}
                </span>
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5">
                ⭐ {v.rating}/10 · {v.shippingRegions.join(', ')}
              </div>
            </div>
            <a
              href={`/api/vendors/click?vendor=${v.id}&peptide=${peptideId}`}
              target="_blank"
              rel="noreferrer sponsored"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 shrink-0"
            >
              Visit
            </a>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-secondary/70 mt-2">
        Affiliate links may earn us a commission. Ratings are editorial.
      </p>
    </section>
  );
}
