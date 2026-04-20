/**
 * Shared types for the Stack Execution Wizard.
 * Wizard state is a single large object that's threaded through all 6 steps
 * and persisted to ExecutionPlan.wizardState for resume.
 */

import type { SyringeType } from '@/components/tools/syringe-visual';
import type { TimeSlot } from '@/lib/stack-execution/schedule-defaults';

export interface InventoryPick {
  vialSizeMg: number;
  quantity: number;
  costUsd?: number;
  vendorId?: string;
  alreadyOwned: boolean;
}

export interface RecipePick {
  vialSizeMg: number;
  waterMl: number;
  syringe: SyringeType;
}

export interface DosePick {
  doseMcg: number;
  syringe: SyringeType;
}

export interface SchedulePick {
  slot: TimeSlot;
  time: string;
  daysOfWeek: string[];
  injectionSite?: string;
  frequencyNote?: string;
}

export interface WizardState {
  name: string;
  peptideIds: string[];
  stackSlug?: string;
  durationWeeks: number;
  goalsConfirmed: boolean;
  inventory: Record<string, InventoryPick>;
  recipes: Record<string, RecipePick>;
  doses: Record<string, DosePick>;
  schedule: Record<string, SchedulePick>;
}

export const WIZARD_STEPS = [
  { id: 1, label: 'Goals' },
  { id: 2, label: 'Inventory' },
  { id: 3, label: 'Reconstitute' },
  { id: 4, label: 'Syringe' },
  { id: 5, label: 'Schedule' },
  { id: 6, label: 'Activate' },
] as const;
