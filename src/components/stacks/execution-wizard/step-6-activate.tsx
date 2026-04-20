'use client';

/**
 * Step 6 — Activate. Single "Activate this protocol" button that creates linked
 * Cycle + Reminder + Inventory + ExecutionPlan records in one transaction-ish
 * pass, fires the FIRST_EXECUTION_PLAN achievement, and renders a celebratory
 * summary with a printable protocol card.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { dataClient } from '@/lib/amplify-data';
import { pullForDose } from '@/lib/stack-execution/math';
import { maybeUnlock } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import type { WizardState } from './types';

interface Props {
  state: WizardState;
  setState: React.Dispatch<React.SetStateAction<WizardState>>;
}

type ActivationStatus = 'idle' | 'activating' | 'activated' | 'error';

export function Step6Activate({ state }: Props) {
  const [status, setStatus] = useState<ActivationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activatedIds, setActivatedIds] = useState<{
    cycleId?: string;
    reminderIds: string[];
    inventoryIds: string[];
    executionPlanId?: string;
  } | null>(null);

  const summary = useMemo(() => {
    return state.peptideIds.map((id) => {
      const peptide = peptides.find((p) => p.id === id);
      const recipe = state.recipes[id];
      const dose = state.doses[id];
      const schedule = state.schedule[id];
      const recon = getReconstitutionInfo(id);
      const pull =
        recipe && dose
          ? pullForDose(
              { vialSizeMg: recipe.vialSizeMg, waterMl: recipe.waterMl },
              dose.doseMcg,
            )
          : null;
      return { id, peptide, recipe, dose, schedule, recon, pull };
    });
  }, [state]);

  async function activate() {
    setStatus('activating');
    setError(null);
    try {
      const inventoryIds: string[] = [];
      const reminderIds: string[] = [];

      const { data: cycle } = await dataClient.models.Cycle.create({
        name: state.name,
        startDate: new Date().toISOString().split('T')[0],
        durationWeeks: state.durationWeeks,
        entries: state.peptideIds.map((id) => {
          const recipe = state.recipes[id];
          const dose = state.doses[id];
          const schedule = state.schedule[id];
          return {
            id: crypto.randomUUID(),
            peptideId: id,
            startWeek: 1,
            durationWeeks: state.durationWeeks,
            pattern: schedule?.slot === 'weekly' ? 'continuous' : 'continuous',
            dose: String(dose?.doseMcg ?? 0),
            unit: 'mcg',
            timeOfDay: schedule?.slot,
            injectionSite: schedule?.injectionSite,
            recipeVialSizeMg: recipe?.vialSizeMg,
            recipeWaterMl: recipe?.waterMl,
            recipeSyringe: recipe?.syringe,
          };
        }),
        notes: `Activated from execution wizard.`,
        active: true,
      });

      if (!cycle) throw new Error('Failed to create Cycle');

      for (const id of state.peptideIds) {
        const inv = state.inventory[id];
        const peptide = peptides.find((p) => p.id === id);
        if (!inv || !peptide) continue;

        const { data: invRow } = await dataClient.models.Inventory.create({
          peptideId: id,
          vialSizeMg: inv.vialSizeMg,
          quantity: inv.quantity,
          reconstituted: false,
          costUsd: inv.costUsd ?? null,
          vendorId: inv.vendorId ?? null,
          executionPlanId: null,
        });
        if (invRow) inventoryIds.push(invRow.id);

        const sched = state.schedule[id];
        const dose = state.doses[id];
        if (!sched || !dose) continue;

        const { data: rem } = await dataClient.models.Reminder.create({
          title: `${peptide.name} dose`,
          body: `${dose.doseMcg} mcg · ${sched.injectionSite ?? 'rotate site'}`,
          time: sched.time,
          daysOfWeek: sched.daysOfWeek,
          peptideId: id,
          dose: String(dose.doseMcg),
          unit: 'mcg',
          enabled: true,
        });
        if (rem) reminderIds.push(rem.id);
      }

      const { data: plan } = await dataClient.models.ExecutionPlan.create({
        name: state.name,
        stackSlug: state.stackSlug ?? null,
        peptideIds: state.peptideIds,
        wizardState: state as unknown as Record<string, unknown>,
        cycleId: cycle.id,
        reminderIds,
        inventoryIds,
        status: 'ACTIVE',
        activatedAt: new Date().toISOString(),
      });

      await maybeUnlock('FIRST_EXECUTION_PLAN');

      setActivatedIds({
        cycleId: cycle.id,
        reminderIds,
        inventoryIds,
        executionPlanId: plan?.id,
      });
      setStatus('activated');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('atlas-reminders-changed'));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Activation failed');
      setStatus('error');
    }
  }

  if (status === 'activated' && activatedIds) {
    return (
      <ActivatedSummary state={state} summary={summary} activatedIds={activatedIds} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-5 border border-neon-cyan/20">
        <h2 className="text-base font-bold text-foreground">Review & activate</h2>
        <p className="text-xs text-text-secondary mt-1">
          One click creates your cycle, reminders, and vial inventory in one go.
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
          Protocol summary
        </h3>
        <div className="text-sm text-foreground mb-3">
          <span className="font-semibold">{state.name}</span> ·{' '}
          <span className="text-text-secondary">
            {state.durationWeeks} weeks · {state.peptideIds.length} peptides
          </span>
        </div>
        <div className="space-y-3">
          {summary.map(({ id, peptide, recipe, dose, schedule, pull }) => (
            <div
              key={id}
              className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{peptide?.name}</span>
                <span className="text-[10px] text-text-secondary font-mono">
                  {recipe?.vialSizeMg}mg / {recipe?.waterMl.toFixed(1)}mL
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-text-secondary">
                <div>
                  Dose:{' '}
                  <span className="text-neon-cyan font-mono">
                    {dose?.doseMcg} mcg = {pull?.units.toFixed(1)} u
                  </span>
                </div>
                <div>
                  When:{' '}
                  <span className="text-foreground">
                    {schedule?.time} · {schedule?.daysOfWeek.length}d/wk
                  </span>
                </div>
                <div>
                  Site: <span className="text-foreground">{schedule?.injectionSite}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={activate}
        disabled={status === 'activating'}
        className={cn(
          'w-full py-3 rounded-2xl text-sm font-bold transition-all',
          status === 'activating'
            ? 'bg-white/[0.04] text-text-secondary'
            : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]',
        )}
      >
        {status === 'activating' ? 'Activating...' : '🚀 Activate this protocol'}
      </button>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}. Your data wasn&apos;t fully saved — try again or come back later.
        </div>
      )}
    </div>
  );
}

function ActivatedSummary({
  state,
  summary,
  activatedIds,
}: {
  state: WizardState;
  summary: ReturnType<typeof useMemo>;
  activatedIds: {
    cycleId?: string;
    reminderIds: string[];
    inventoryIds: string[];
    executionPlanId?: string;
  };
}) {
  const summaryArr = summary as unknown as Array<{
    id: string;
    peptide?: { name: string; slug: string };
    recipe?: { vialSizeMg: number; waterMl: number };
    dose?: { doseMcg: number };
    schedule?: { time: string; daysOfWeek: string[]; injectionSite?: string };
    pull?: { units: number; volumeMl: number };
  }>;

  const nextDose = summaryArr
    .filter((s) => s.schedule)
    .map((s) => ({
      name: s.peptide?.name,
      time: s.schedule?.time ?? '08:00',
      dose: s.dose?.doseMcg ?? 0,
      units: s.pull?.units ?? 0,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  return (
    <div className="space-y-4">
      <div className="glass-bright rounded-2xl p-6 border border-neon-green/30 shadow-[0_0_30px_rgba(0,255,159,0.15)] text-center">
        <div className="text-4xl mb-2">🚀</div>
        <h2 className="text-xl font-bold text-foreground">Your protocol is live.</h2>
        <p className="text-sm text-text-secondary mt-1">
          Cycle, reminders, and inventory created in one pass.
        </p>
        {nextDose && (
          <p className="text-sm text-neon-cyan mt-4 font-mono">
            Next: {nextDose.name} {nextDose.dose}mcg ≈ {nextDose.units.toFixed(1)}u at{' '}
            {nextDose.time}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {activatedIds.cycleId && (
          <Link
            href="/atlas/tools/cycle-planner"
            className="glass rounded-xl p-3 text-center hover:bg-white/[0.04] transition-all"
          >
            <div className="text-lg">📅</div>
            <div className="text-xs font-semibold text-foreground mt-1">Open Cycle</div>
            <div className="text-[10px] text-text-secondary">1 created</div>
          </Link>
        )}
        <Link
          href="/atlas/reminders"
          className="glass rounded-xl p-3 text-center hover:bg-white/[0.04] transition-all"
        >
          <div className="text-lg">⏰</div>
          <div className="text-xs font-semibold text-foreground mt-1">Reminders</div>
          <div className="text-[10px] text-text-secondary">
            {activatedIds.reminderIds.length} created
          </div>
        </Link>
        <Link
          href="/atlas/inventory"
          className="glass rounded-xl p-3 text-center hover:bg-white/[0.04] transition-all"
        >
          <div className="text-lg">📦</div>
          <div className="text-xs font-semibold text-foreground mt-1">Inventory</div>
          <div className="text-[10px] text-text-secondary">
            {activatedIds.inventoryIds.length} vials
          </div>
        </Link>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') window.print();
          }}
          className="glass rounded-xl p-3 text-center hover:bg-white/[0.04] transition-all"
        >
          <div className="text-lg">🖨️</div>
          <div className="text-xs font-semibold text-foreground mt-1">Print card</div>
          <div className="text-[10px] text-text-secondary">One-page summary</div>
        </button>
      </div>

      {/* Printable area */}
      <div
        id="printable-protocol"
        className="glass rounded-2xl p-6 print:bg-white print:text-black print:shadow-none"
      >
        <div className="flex items-center justify-between mb-3 print:border-b print:border-gray-300 print:pb-2">
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider print:text-gray-500">
              PeptideAtlas protocol card
            </div>
            <h3 className="text-base font-bold text-foreground print:text-black">
              {state.name}
            </h3>
          </div>
          <div className="text-[10px] text-text-secondary print:text-gray-500">
            {state.durationWeeks} weeks · {state.peptideIds.length} peptides
          </div>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] print:border-gray-300">
              <th className="text-left py-2 text-text-secondary font-semibold print:text-gray-700">
                Peptide
              </th>
              <th className="text-left py-2 text-text-secondary font-semibold print:text-gray-700">
                Vial / BAC
              </th>
              <th className="text-left py-2 text-text-secondary font-semibold print:text-gray-700">
                Dose
              </th>
              <th className="text-left py-2 text-text-secondary font-semibold print:text-gray-700">
                When
              </th>
              <th className="text-left py-2 text-text-secondary font-semibold print:text-gray-700">
                Site
              </th>
            </tr>
          </thead>
          <tbody>
            {summaryArr.map((s) => (
              <tr
                key={s.id}
                className="border-b border-white/[0.04] print:border-gray-200"
              >
                <td className="py-2 font-semibold text-foreground print:text-black">
                  {s.peptide?.name}
                </td>
                <td className="py-2 text-text-secondary print:text-gray-700 font-mono">
                  {s.recipe?.vialSizeMg}mg / {s.recipe?.waterMl.toFixed(1)}mL
                </td>
                <td className="py-2 text-text-secondary print:text-gray-700 font-mono">
                  {s.dose?.doseMcg}mcg · {s.pull?.units.toFixed(1)}u
                </td>
                <td className="py-2 text-text-secondary print:text-gray-700">
                  {s.schedule?.time} · {s.schedule?.daysOfWeek.join(',')}
                </td>
                <td className="py-2 text-text-secondary print:text-gray-700">
                  {s.schedule?.injectionSite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[10px] text-text-secondary mt-4 print:text-gray-500">
          Educational only. Not medical advice. Keep vials refrigerated; typical shelf life 28
          days reconstituted at 4°C. Rotate injection sites. Consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
