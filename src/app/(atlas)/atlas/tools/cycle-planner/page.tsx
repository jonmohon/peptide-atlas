import type { Metadata } from 'next';
import { CyclePlannerClient } from '@/components/tools/cycle-planner/cycle-planner-client';

export const metadata: Metadata = {
  title: 'Cycle Planner',
  description:
    'Plan multi-peptide on/off cycles on an interactive timeline. Detect overlaps and get AI sequencing analysis.',
};

export default function CyclePlannerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cycle Planner</h1>
        <p className="text-sm text-text-secondary mt-1">
          Map each peptide across weeks. Spot overlaps, plan washout periods, and get AI
          sequencing analysis.
        </p>
      </div>

      <CyclePlannerClient />
    </div>
  );
}
