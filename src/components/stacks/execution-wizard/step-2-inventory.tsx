'use client';

/**
 * Step 2 — Inventory. For each peptide in the stack, ask what vials the user has
 * or needs to buy. Seeds the Inventory model on activation. Shows a "Don't have it yet"
 * CTA linking to the vendor directory (tracked affiliate click).
 */

import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { vendorsForPeptide } from '@/data/vendors';
import { cn } from '@/lib/utils';
import type { WizardState } from './types';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

function estimateVialsNeeded(doseMcg: number, durationWeeks: number, vialSizeMg: number): number {
  const dailyMcg = doseMcg;
  const weeklyMcg = dailyMcg * 7;
  const totalMcg = weeklyMcg * durationWeeks;
  const mcgPerVial = vialSizeMg * 1000;
  if (mcgPerVial <= 0) return 1;
  return Math.max(1, Math.ceil(totalMcg / mcgPerVial));
}

export function Step2Inventory({ state, setState }: Props) {
  function update(id: string, patch: Partial<WizardState['inventory'][string]>) {
    setState((s) => ({
      ...s,
      inventory: { ...s.inventory, [id]: { ...s.inventory[id], ...patch } },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <h2 className="text-base font-bold text-foreground">What vials do you have?</h2>
        <p className="text-xs text-text-secondary mt-1">
          Declare what&apos;s on your shelf or about to be ordered. We&apos;ll suggest clean
          reconstitution math for each in the next step.
        </p>
      </div>

      {state.peptideIds.map((id) => {
        const peptide = peptides.find((p) => p.id === id);
        if (!peptide) return null;
        const recon = getReconstitutionInfo(id);
        const inv = state.inventory[id];
        const dose = state.doses[id];
        const vendors = vendorsForPeptide(peptide.slug).slice(0, 2);
        const suggestedQty = estimateVialsNeeded(
          dose?.doseMcg ?? recon?.typicalDoseMcg ?? 250,
          state.durationWeeks,
          inv?.vialSizeMg ?? 5,
        );

        return (
          <div key={id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{peptide.name}</h3>
                <p className="text-[10px] text-text-secondary">
                  {peptide.category.replace(/-/g, ' ')} · typical dose{' '}
                  {recon?.typicalDoseMcg ?? 250} mcg
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={inv?.alreadyOwned ?? false}
                  onChange={(e) => update(id, { alreadyOwned: e.target.checked })}
                  className="accent-neon-cyan"
                />
                I already have this
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Vial size
                </label>
                <div className="flex flex-wrap gap-1">
                  {(recon?.commonVialSizes ?? [5]).map((size) => (
                    <button
                      key={size}
                      onClick={() => update(id, { vialSizeMg: size })}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-semibold transition-all border',
                        inv?.vialSizeMg === size
                          ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                          : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
                      )}
                    >
                      {size} mg
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      update(id, { quantity: Math.max(1, (inv?.quantity ?? 1) - 1) })
                    }
                    className="w-7 h-7 rounded-lg bg-white/[0.05] text-foreground hover:bg-white/[0.08]"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={inv?.quantity ?? 1}
                    onChange={(e) =>
                      update(id, { quantity: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-12 text-center px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
                  />
                  <button
                    onClick={() =>
                      update(id, { quantity: (inv?.quantity ?? 1) + 1 })
                    }
                    className="w-7 h-7 rounded-lg bg-white/[0.05] text-foreground hover:bg-white/[0.08]"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-text-secondary mt-1">
                  Suggested: <span className="text-neon-cyan">{suggestedQty}</span> for{' '}
                  {state.durationWeeks}w
                </p>
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Cost (optional)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-text-secondary">$</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={inv?.costUsd ?? ''}
                    onChange={(e) =>
                      update(id, {
                        costUsd: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="per vial"
                    className="w-full px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
                  />
                </div>
              </div>
            </div>

            {!inv?.alreadyOwned && vendors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">
                  Don&apos;t have it yet? Trusted vendors for {peptide.name}
                </div>
                <div className="flex flex-wrap gap-2">
                  {vendors.map((v) => (
                    <a
                      key={v.id}
                      href={`/api/vendors/click?vendor=${v.id}&peptide=${peptide.id}`}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:text-neon-cyan hover:bg-white/[0.08]"
                    >
                      <span>{v.name}</span>
                      <span className="text-[10px] opacity-60">
                        ⭐ {v.rating}/10
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
