'use client';

/**
 * Inventory listing grouped by peptide with reconstitution + expiry indicators.
 * Lets the user mark a vial as reconstituted (starts expiry clock), delete it,
 * or reorder via the vendor directory.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { vendorsForPeptide } from '@/data/vendors';
import { reconstitutedShelfLifeRemainingDays } from '@/lib/stack-execution/math';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type InventoryItem = Schema['Inventory']['type'];

export function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const { data } = await dataClient.models.Inventory.list({ limit: 200 });
      setItems(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markReconstituted(item: InventoryItem, waterMl: number) {
    const now = new Date();
    const recon = getReconstitutionInfo(item.peptideId);
    const shelfDays = recon?.shelfLifeReconstitutedDays ?? 28;
    const expires = new Date(now.getTime() + shelfDays * 24 * 60 * 60 * 1000);
    try {
      await dataClient.models.Inventory.update({
        id: item.id,
        reconstituted: true,
        reconstitutedWaterMl: waterMl,
        reconstitutedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function removeItem(id: string) {
    if (!confirm('Remove this vial from inventory?')) return;
    try {
      await dataClient.models.Inventory.delete({ id });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    for (const it of items) {
      const list = map.get(it.peptideId) ?? [];
      list.push(it);
      map.set(it.peptideId, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  if (loading) {
    return <div className="h-48 glass rounded-2xl animate-pulse" />;
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <div className="text-3xl mb-2">📦</div>
        <p className="text-sm text-text-secondary">
          No vials tracked yet. Run the Stack Execution Wizard to declare your on-hand
          inventory, or add vials here later.
        </p>
        <Link
          href="/atlas/stacks"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm font-semibold"
        >
          Build a stack
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([peptideId, vials]) => {
        const peptide = peptides.find((p) => p.id === peptideId);
        if (!peptide) return null;
        const totalMg = vials.reduce((sum, v) => sum + v.vialSizeMg * (v.quantity ?? 1), 0);
        const topVendor = vendorsForPeptide(peptide.slug)[0];

        return (
          <div key={peptideId} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{peptide.name}</h3>
                <p className="text-[10px] text-text-secondary">
                  {vials.length} entr{vials.length === 1 ? 'y' : 'ies'} · {totalMg} mg total
                </p>
              </div>
              {topVendor && (
                <a
                  href={`/api/vendors/click?vendor=${topVendor.id}&peptide=${peptide.id}`}
                  target="_blank"
                  rel="noreferrer sponsored"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:text-neon-cyan hover:bg-white/[0.08]"
                >
                  Reorder at {topVendor.name}
                </a>
              )}
            </div>

            <div className="space-y-2">
              {vials.map((vial) => (
                <VialRow
                  key={vial.id}
                  vial={vial}
                  onReconstitute={(waterMl) => markReconstituted(vial, waterMl)}
                  onRemove={() => removeItem(vial.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VialRow({
  vial,
  onReconstitute,
  onRemove,
}: {
  vial: InventoryItem;
  onReconstitute: (waterMl: number) => void;
  onRemove: () => void;
}) {
  const [waterMl, setWaterMl] = useState('2.0');

  const remaining = vial.reconstituted && vial.reconstitutedAt
    ? reconstitutedShelfLifeRemainingDays(
        new Date(vial.reconstitutedAt),
        getReconstitutionInfo(vial.peptideId)?.shelfLifeReconstitutedDays ?? 28,
      )
    : null;

  return (
    <div className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">
          {vial.vialSizeMg} mg × {vial.quantity ?? 1}
        </div>
        <div className="text-[10px] text-text-secondary">
          {vial.reconstituted ? (
            <>
              Reconstituted {vial.reconstitutedAt && new Date(vial.reconstitutedAt).toLocaleDateString()}{' '}
              · {vial.reconstitutedWaterMl?.toFixed(1) ?? '?'} mL BAC
              {remaining !== null && (
                <>
                  {' '}
                  ·{' '}
                  <span
                    className={cn(
                      remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-amber-400' : 'text-neon-green',
                    )}
                  >
                    {remaining.toFixed(0)} d left
                  </span>
                </>
              )}
            </>
          ) : (
            <>Unopened · sealed vial</>
          )}
          {vial.costUsd && <> · ${vial.costUsd.toFixed(2)}/vial</>}
        </div>
      </div>

      {!vial.reconstituted && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0.5"
            max="5"
            step="0.1"
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            className="w-16 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.1] text-xs text-foreground"
          />
          <span className="text-[10px] text-text-secondary">mL</span>
          <button
            onClick={() => onReconstitute(Number(waterMl))}
            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
          >
            Reconstitute
          </button>
        </div>
      )}

      <button
        onClick={onRemove}
        className="text-xs text-text-secondary hover:text-red-400 px-2"
      >
        Remove
      </button>
    </div>
  );
}
