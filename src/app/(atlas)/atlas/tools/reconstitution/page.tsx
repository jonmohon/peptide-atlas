import type { Metadata } from 'next';
import { ReconstitutionCalculator } from '@/components/tools/reconstitution-calculator';

export const metadata: Metadata = {
  title: 'Reconstitution Calculator',
  description: 'Calculate exact injection volumes for reconstituted peptides. Supports all common vial sizes and syringe types.',
};

export default function ReconstitutionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Reconstitution Calculator
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Calculate how much to draw for your desired dose after reconstituting a peptide vial.
        </p>
      </div>

      <ReconstitutionCalculator />
    </div>
  );
}
