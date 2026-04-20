'use client';

/**
 * Step 3 — Reconstitution plan. For each peptide: interactive BAC-water slider,
 * live concentration display, doses-per-vial, shelf life, "snap to clean math"
 * button, and auto-recommended syringe size.
 */

import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { pullForDose, snapToCleanMath, SYRINGE_CAPACITY_ML } from '@/lib/stack-execution/math';
import type { SyringeType } from '@/components/tools/syringe-visual';
import { cn } from '@/lib/utils';
import type { WizardState } from './types';

const SYRINGE_OPTIONS: { id: SyringeType; label: string }[] = [
  { id: 'u30', label: 'U-30 (0.3 mL)' },
  { id: 'u50', label: 'U-50 (0.5 mL)' },
  { id: 'u100', label: 'U-100 (1 mL)' },
];

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

export function Step3Reconstitution({ state, setState }: Props) {
  function update(id: string, patch: Partial<WizardState['recipes'][string]>) {
    setState((s) => ({
      ...s,
      recipes: { ...s.recipes, [id]: { ...s.recipes[id], ...patch } },
      // When vial size changes in recon, carry it back to inventory.
      inventory: patch.vialSizeMg
        ? { ...s.inventory, [id]: { ...s.inventory[id], vialSizeMg: patch.vialSizeMg } }
        : s.inventory,
    }));
  }

  function snap(id: string) {
    const recipe = state.recipes[id];
    const dose = state.doses[id];
    if (!recipe || !dose) return;
    const waterMl = snapToCleanMath(recipe.vialSizeMg, dose.doseMcg, {
      syringe: recipe.syringe,
      preferWholeMl: true,
    });
    update(id, { waterMl: Math.round(waterMl * 10) / 10 });
  }

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <h2 className="text-base font-bold text-foreground">Reconstitution lab</h2>
        <p className="text-xs text-text-secondary mt-1">
          Pick how much bacteriostatic water to add to each vial. Watch the math update live
          — the goal is a clean, whole-unit syringe pull for your target dose.
        </p>
      </div>

      {state.peptideIds.map((id) => {
        const peptide = peptides.find((p) => p.id === id);
        if (!peptide) return null;
        const recipe = state.recipes[id];
        const dose = state.doses[id];
        const recon = getReconstitutionInfo(id);
        if (!recipe || !dose) return null;

        const result = pullForDose(
          { vialSizeMg: recipe.vialSizeMg, waterMl: recipe.waterMl },
          dose.doseMcg,
        );

        const maxMl = SYRINGE_CAPACITY_ML[recipe.syringe];
        const overflow = result.volumeMl > maxMl;
        const subUnit = result.subUnitPrecision;

        return (
          <div key={id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{peptide.name}</h3>
                <p className="text-[10px] text-text-secondary">
                  {recipe.vialSizeMg} mg vial · target {dose.doseMcg} mcg
                </p>
              </div>
              <button
                onClick={() => snap(id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-purple-400/15 text-purple-400 border border-purple-400/30 hover:bg-purple-400/25"
              >
                Snap to clean math
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-text-secondary uppercase tracking-wider">
                    BAC water
                  </label>
                  <span className="text-sm font-bold text-neon-cyan font-mono">
                    {recipe.waterMl.toFixed(1)} mL
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={recipe.waterMl}
                  onChange={(e) => update(id, { waterMl: Number(e.target.value) })}
                  className="w-full accent-neon-cyan"
                />
                <div className="flex justify-between text-[9px] text-text-secondary font-mono mt-0.5">
                  <span>0.5</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5 mL</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <ReadOnlyStat
                  label="Concentration"
                  value={`${result.concentrationMcgPerMl.toFixed(0)} mcg/mL`}
                  sub={`${result.concentrationMcgPerUnit.toFixed(1)} mcg/unit`}
                />
                <ReadOnlyStat
                  label="Doses / vial"
                  value={Math.floor(result.dosesPerVial).toString()}
                  sub={`≈ ${Math.floor(result.dosesPerVial)} injections`}
                />
                <ReadOnlyStat
                  label="Shelf life"
                  value={`${recon?.shelfLifeReconstitutedDays ?? 28} d`}
                  sub={`at ${recon?.storageTempCelsius ?? 4}°C`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Syringe
                </label>
                <div className="flex flex-wrap gap-1">
                  {SYRINGE_OPTIONS.map((opt) => {
                    const fits = result.volumeMl <= SYRINGE_CAPACITY_ML[opt.id];
                    const recommended = opt.id === result.recommendedSyringe;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          update(id, { syringe: opt.id });
                          setState((s) => ({
                            ...s,
                            doses: {
                              ...s.doses,
                              [id]: { ...s.doses[id], syringe: opt.id },
                            },
                          }));
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded text-xs font-medium transition-all border relative',
                          recipe.syringe === opt.id
                            ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                            : fits
                              ? 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]'
                              : 'bg-white/[0.02] text-text-secondary/40 border-white/[0.04] line-through',
                        )}
                      >
                        {opt.label}
                        {recommended && (
                          <span className="ml-1 text-[9px] text-neon-green">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {overflow && (
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2">
                  This dose ({result.volumeMl.toFixed(2)} mL) won&apos;t fit in your selected
                  syringe ({maxMl} mL). Add more BAC water, split into two pulls, or pick a
                  larger syringe.
                </div>
              )}

              {subUnit && !overflow && (
                <div className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2">
                  Pull is under 2 units — precision margin is tight. Add more BAC water so
                  your target dose lands on a larger unit mark.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReadOnlyStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
      <div className="text-[9px] text-text-secondary uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-foreground font-mono">{value}</div>
      {sub && <div className="text-[10px] text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}
