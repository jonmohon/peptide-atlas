'use client';

/**
 * Step 4 — Interactive syringe pull. One tile per peptide. Drag the plunger to
 * scrub the dose or type the dose and watch the plunger snap. This is the
 * "magic moment" where users see exactly where their 250mcg lands on an insulin
 * syringe, which is what they've been squinting at bathroom counters to figure out.
 */

import { peptides } from '@/data/peptides';
import { pullForDose, SYRINGE_CAPACITY_ML, mlToUnits } from '@/lib/stack-execution/math';
import { SyringeVisual } from '@/components/tools/syringe-visual';
import type { SyringeType } from '@/components/tools/syringe-visual';
import { cn } from '@/lib/utils';
import type { WizardState } from './types';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

const SYRINGE_OPTIONS: { id: SyringeType; label: string }[] = [
  { id: 'u30', label: 'U-30' },
  { id: 'u50', label: 'U-50' },
  { id: 'u100', label: 'U-100' },
];

export function Step4Syringe({ state, setState }: Props) {
  function setDose(id: string, doseMcg: number) {
    setState((s) => ({
      ...s,
      doses: { ...s.doses, [id]: { ...s.doses[id], doseMcg: Math.max(0, doseMcg) } },
    }));
  }

  function setSyringe(id: string, syringe: SyringeType) {
    setState((s) => ({
      ...s,
      doses: { ...s.doses, [id]: { ...s.doses[id], syringe } },
      recipes: { ...s.recipes, [id]: { ...s.recipes[id], syringe } },
    }));
  }

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <h2 className="text-base font-bold text-foreground">Syringe pull</h2>
        <p className="text-xs text-text-secondary mt-1">
          For each peptide, set the target dose — the plunger will show you exactly where
          to draw. Drag the plunger to scrub, or type the dose directly.
        </p>
      </div>

      {state.peptideIds.map((id) => {
        const peptide = peptides.find((p) => p.id === id);
        if (!peptide) return null;
        const dose = state.doses[id];
        const recipe = state.recipes[id];
        if (!dose || !recipe) return null;

        const syringe = dose.syringe;
        const maxMl = SYRINGE_CAPACITY_ML[syringe];
        const pull = pullForDose(
          { vialSizeMg: recipe.vialSizeMg, waterMl: recipe.waterMl },
          dose.doseMcg,
        );
        const overflow = pull.volumeMl > maxMl;
        const mcgPerUnit = pull.concentrationMcgPerUnit;

        return (
          <div key={id} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">{peptide.name}</h3>
                <p className="text-[10px] text-text-secondary">
                  {recipe.vialSizeMg} mg / {recipe.waterMl.toFixed(1)} mL BAC ·{' '}
                  {pull.concentrationMcgPerMl.toFixed(0)} mcg/mL
                </p>
              </div>
              <div className="flex gap-1">
                {SYRINGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSyringe(id, opt.id)}
                    className={cn(
                      'px-2.5 py-1 rounded text-[11px] font-semibold transition-all border',
                      syringe === opt.id
                        ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                        : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dose input */}
            <div className="grid grid-cols-2 gap-4 items-center mb-4">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Target dose
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={dose.doseMcg}
                    onChange={(e) => setDose(id, Number(e.target.value))}
                    className="w-28 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm font-mono text-foreground focus:outline-none focus:border-neon-cyan/50"
                  />
                  <span className="text-xs text-text-secondary">mcg</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                  Tolerance per unit
                </label>
                <div className="text-sm font-mono text-foreground">
                  ±{mcgPerUnit.toFixed(1)} mcg
                </div>
                <div className="text-[10px] text-text-secondary">
                  = ±{((mcgPerUnit / Math.max(1, dose.doseMcg)) * 100).toFixed(1)}% of dose
                </div>
              </div>
            </div>

            {/* Syringe visual with drag */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <SyringeVisual
                volumeMl={pull.volumeMl}
                syringeType={syringe}
                label={peptide.name}
                onVolumeChange={(nextMl) => {
                  const nextDose = Math.max(
                    0,
                    Math.round(nextMl * pull.concentrationMcgPerMl),
                  );
                  setDose(id, nextDose);
                }}
              />
              <p className="text-[10px] text-text-secondary text-center mt-2">
                Tip: drag the plunger to scrub the dose.{' '}
                <span className="text-neon-cyan font-mono">
                  {mlToUnits(pull.volumeMl).toFixed(1)} units
                </span>{' '}
                for {dose.doseMcg} mcg
              </p>
            </div>

            {overflow && (
              <div className="mt-3 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2">
                This dose requires {pull.volumeMl.toFixed(2)} mL — bigger than your{' '}
                {maxMl} mL syringe. Either go back and add more BAC water, split into two
                pulls, or switch to a larger syringe.
              </div>
            )}

            {pull.subUnitPrecision && (
              <div className="mt-3 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2">
                Sub-unit precision ({pull.units.toFixed(1)} units). Go back and dilute more
                for easier, more accurate draws.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
