'use client';

/**
 * Stateful orchestrator for the 6-step Stack Execution Wizard.
 * Parses ?stackId or ?peptides from the URL, seeds the wizard state with
 * peptide defaults (typical doses, default vial sizes, schedule slots),
 * and routes through the six step components.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { peptides } from '@/data/peptides';
import { stacks } from '@/data/stacks';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { defaultTimeSlot, TIME_SLOT_HHMM } from '@/lib/stack-execution/schedule-defaults';
import { PremiumGate } from '@/components/auth/premium-gate';
import { cn } from '@/lib/utils';
import { WIZARD_STEPS } from './types';
import type {
  WizardState,
  InventoryPick,
  RecipePick,
  DosePick,
  SchedulePick,
} from './types';
import { Step1Goals } from './step-1-goals';
import { Step2Inventory } from './step-2-inventory';
import { Step3Reconstitution } from './step-3-reconstitution';
import { Step4Syringe } from './step-4-syringe';
import { Step5Schedule } from './step-5-schedule';
import { Step6Activate } from './step-6-activate';

function buildInitialState(peptideIds: string[], stackSlug: string | null): WizardState {
  const stack = stackSlug ? stacks.find((s) => s.slug === stackSlug || s.id === stackSlug) : null;
  const inventory: Record<string, InventoryPick> = {};
  const recipes: Record<string, RecipePick> = {};
  const doses: Record<string, DosePick> = {};
  const schedule: Record<string, SchedulePick> = {};

  for (const id of peptideIds) {
    const peptide = peptides.find((p) => p.id === id);
    if (!peptide) continue;
    const recon = getReconstitutionInfo(id);
    const vialSize = recon?.commonVialSizes[Math.floor((recon?.commonVialSizes.length ?? 1) / 2)] ?? 5;
    const typicalDose = recon?.typicalDoseMcg ?? 250;

    inventory[id] = {
      vialSizeMg: vialSize,
      quantity: 1,
      alreadyOwned: false,
    };
    recipes[id] = {
      vialSizeMg: vialSize,
      waterMl: 2,
      syringe: 'u50',
    };
    doses[id] = {
      doseMcg: typicalDose,
      syringe: 'u50',
    };
    const slot = defaultTimeSlot(peptide);
    schedule[id] = {
      slot,
      time: TIME_SLOT_HHMM[slot],
      daysOfWeek:
        slot === 'weekly'
          ? ['MON']
          : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      injectionSite: 'abdomen-L',
    };
  }

  return {
    name: stack ? `${stack.name} protocol` : 'My custom protocol',
    peptideIds,
    stackSlug: stack?.slug,
    durationWeeks: 8,
    goalsConfirmed: false,
    inventory,
    recipes,
    doses,
    schedule,
  };
}

interface Props {
  initialStackSlug: string | null;
  initialPeptideIds: string[];
}

export function ExecutionWizardClient({ initialStackSlug, initialPeptideIds }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState>(() =>
    buildInitialState(initialPeptideIds, initialStackSlug),
  );
  const [step, setStep] = useState(1);

  const currentStepParam = searchParams.get('step');
  useEffect(() => {
    if (currentStepParam) {
      const n = Number(currentStepParam);
      if (!Number.isNaN(n) && n >= 1 && n <= 6) setStep(n);
    }
  }, [currentStepParam]);

  function goTo(n: number) {
    const next = Math.min(6, Math.max(1, n));
    setStep(next);
    const p = new URLSearchParams(searchParams.toString());
    p.set('step', String(next));
    router.replace(`?${p.toString()}`, { scroll: true });
  }

  const peptideCount = state.peptideIds.length;

  const canAdvance = useMemo(() => {
    if (peptideCount === 0) return false;
    if (step === 1) return state.goalsConfirmed;
    if (step === 2)
      return state.peptideIds.every(
        (id) => state.inventory[id] && state.inventory[id].quantity > 0,
      );
    if (step === 3)
      return state.peptideIds.every((id) => {
        const r = state.recipes[id];
        return r && r.vialSizeMg > 0 && r.waterMl > 0;
      });
    if (step === 4)
      return state.peptideIds.every((id) => state.doses[id]?.doseMcg > 0);
    if (step === 5)
      return state.peptideIds.every((id) => (state.schedule[id]?.daysOfWeek ?? []).length > 0);
    return true;
  }, [state, step, peptideCount]);

  if (peptideCount === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-foreground">Nothing to execute yet</h2>
        <p className="text-sm text-text-secondary mt-2">
          Build or pick a stack first, then click &ldquo;Execute this stack&rdquo;.
        </p>
        <Link
          href="/atlas/stacks"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm font-semibold"
        >
          Go to Stack Builder
        </Link>
      </div>
    );
  }

  return (
    <PremiumGate
      feature="cycle_planner"
      fallback={
        <div className="glass rounded-2xl p-8 text-center max-w-xl mx-auto border border-neon-cyan/20">
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-lg font-bold text-foreground">Execution Wizard is Pro</h2>
          <p className="text-sm text-text-secondary mt-2 mb-4 max-w-md mx-auto">
            Turn any stack into an active protocol — reconstitution card, syringe-pull math
            for every dose, schedule, reminders, and vial inventory — in one guided flow.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm font-semibold"
          >
            See plans
          </Link>
        </div>
      }
    >
      <WizardInner
        state={state}
        setState={setState}
        step={step}
        goTo={goTo}
        canAdvance={canAdvance}
      />
    </PremiumGate>
  );
}

function WizardInner({
  state,
  setState,
  step,
  goTo,
  canAdvance,
}: {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
  step: number;
  goTo: (n: number) => void;
  canAdvance: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Steps bar */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-1.5">
          {WIZARD_STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                disabled={s.id > step && !canAdvance}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg transition-all',
                  active
                    ? 'bg-neon-cyan/15 text-neon-cyan'
                    : done
                      ? 'text-neon-green hover:bg-white/[0.03]'
                      : 'text-text-secondary hover:bg-white/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border',
                    active
                      ? 'bg-neon-cyan/20 border-neon-cyan/40'
                      : done
                        ? 'bg-neon-green/20 border-neon-green/40'
                        : 'bg-white/[0.04] border-white/[0.08]',
                  )}
                >
                  {done ? '✓' : s.id}
                </span>
                <span className="text-[10px] font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div>
        {step === 1 && <Step1Goals state={state} setState={setState} />}
        {step === 2 && <Step2Inventory state={state} setState={setState} />}
        {step === 3 && <Step3Reconstitution state={state} setState={setState} />}
        {step === 4 && <Step4Syringe state={state} setState={setState} />}
        {step === 5 && <Step5Schedule state={state} setState={setState} />}
        {step === 6 && <Step6Activate state={state} setState={setState} />}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => goTo(step - 1)}
          disabled={step === 1}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            step === 1
              ? 'opacity-30 cursor-not-allowed text-text-secondary'
              : 'text-text-secondary hover:text-foreground hover:bg-white/[0.04]',
          )}
        >
          ← Back
        </button>
        {step < 6 ? (
          <button
            onClick={() => goTo(step + 1)}
            disabled={!canAdvance}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
              canAdvance
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30'
                : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] cursor-not-allowed',
            )}
          >
            Continue →
          </button>
        ) : (
          <span className="text-xs text-text-secondary">Final step — activate below.</span>
        )}
      </div>
    </div>
  );
}
