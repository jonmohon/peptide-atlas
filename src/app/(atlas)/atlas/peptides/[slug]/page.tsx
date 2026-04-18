import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { peptides } from '@/data/peptides';
import { CategoryIcon } from '@/components/shared/category-icon';
import { EvidenceBadge } from '@/components/shared/evidence-badge';
import { IntensityIndicator } from '@/components/shared/intensity-indicator';
import { Tag } from '@/components/ui/tag';
import { bodyRegions } from '@/data/body-regions';
import { formatCategoryLabel } from '@/lib/utils';
import { MechanismExplainer } from '@/components/ai/mechanism-explainer';
import { WhatToExpect } from '@/components/ai/what-to-expect';
import { PeptideBenchmarks } from '@/components/community/peptide-benchmarks';
import { PeptideVendors } from '@/components/vendors/peptide-vendors';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return peptides.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const peptide = peptides.find((p) => p.slug === slug);
  if (!peptide) return { title: 'Not Found' };

  return {
    title: `${peptide.name} - ${peptide.fullName}`,
    description: peptide.description,
    openGraph: {
      title: `${peptide.name} | PeptideAtlas`,
      description: peptide.description,
    },
  };
}

export default async function PeptideDetailPage({ params }: Props) {
  const { slug } = await params;
  const peptide = peptides.find((p) => p.slug === slug);

  if (!peptide) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-6">
        <a href="/atlas/peptides" className="hover:text-medical-500 transition-colors">
          Peptides
        </a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{peptide.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <CategoryIcon category={peptide.category} size="lg" />
        <div>
          <h1 className="text-3xl font-bold">{peptide.name}</h1>
          <p className="text-text-secondary">{peptide.fullName}</p>
          <div className="flex items-center gap-3 mt-2">
            <EvidenceBadge level={peptide.evidenceLevel} />
            <Tag variant="medical" size="md">
              {formatCategoryLabel(peptide.category)}
            </Tag>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mb-8">
        <p className="text-base text-text-secondary leading-relaxed">
          {peptide.description}
        </p>
      </section>

      {/* Effects */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Effects</h2>
        <div className="flex flex-wrap gap-2">
          {peptide.effects.map((effect) => (
            <Tag key={effect} size="md" variant="medical">
              {effect.replace(/-/g, ' ')}
            </Tag>
          ))}
        </div>
      </section>

      {/* Mechanism Explainer */}
      <MechanismExplainer peptideId={peptide.id} peptideName={peptide.name} />

      {/* Affected Body Regions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Affected Body Regions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {peptide.affectedRegions.map((region) => {
            const regionInfo = bodyRegions.find((r) => r.id === region.regionId);
            return (
              <div
                key={region.regionId}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-dim border border-border"
              >
                <IntensityIndicator intensity={region.intensity} className="mt-1" />
                <div>
                  <div className="text-sm font-medium">
                    {regionInfo?.label ?? region.regionId}
                  </div>
                  <div className="text-xs text-text-secondary">{region.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dosing Protocol */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Dosing Protocol</h2>
        <div className="bg-surface-dim rounded-xl border border-border p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-1">Route</div>
              <div className="text-sm font-medium capitalize">{peptide.dosing.route}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-1">Typical Dose</div>
              <div className="text-sm font-medium">{peptide.dosing.typicalDose}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-1">Frequency</div>
              <div className="text-sm font-medium">{peptide.dosing.frequency}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-secondary mb-1">Cycle Length</div>
              <div className="text-sm font-medium">{peptide.dosing.cycleLength}</div>
            </div>
          </div>
          {peptide.dosing.notes && (
            <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-border">
              {peptide.dosing.notes}
            </p>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Expected Timeline</h2>
        <div className="space-y-0">
          {peptide.timeline.map((phase, i) => (
            <div key={i} className="flex gap-4 relative">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-medical-500 z-10" />
                {i < peptide.timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-medical-200 min-h-[40px]" />
                )}
              </div>
              <div className="pb-6">
                <div className="text-xs font-medium text-medical-600 mb-0.5">
                  Week {phase.weekStart}–{phase.weekEnd}
                </div>
                <div className="text-sm font-semibold">{phase.label}</div>
                <div className="text-sm text-text-secondary">{phase.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What to Expect */}
      <WhatToExpect peptideIds={[peptide.id]} />

      {/* Community benchmarks */}
      <PeptideBenchmarks peptideId={peptide.id} />

      {/* Vendor listings */}
      <PeptideVendors peptideSlug={peptide.slug} peptideId={peptide.id} />

      {/* Ratings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Ratings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(peptide.ratings).map(([key, value]) => (
            <div key={key} className="bg-surface-dim rounded-lg p-3 border border-border">
              <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                {key === 'easeOfUse' ? 'Ease of Use' : key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-medical-600">{value}</div>
                <div className="text-xs text-text-secondary">/ 10</div>
              </div>
              <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-medical-500 rounded-full"
                  style={{ width: `${value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Side Effects & Contraindications */}
      {(peptide.sideEffects?.length || peptide.contraindications?.length) && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Safety Information</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            {peptide.sideEffects && peptide.sideEffects.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-red-800 mb-1">Possible Side Effects</div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-0.5">
                  {peptide.sideEffects.map((se, i) => (
                    <li key={i}>{se}</li>
                  ))}
                </ul>
              </div>
            )}
            {peptide.contraindications && peptide.contraindications.length > 0 && (
              <div>
                <div className="text-sm font-medium text-red-800 mb-1">Contraindications</div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-0.5">
                  {peptide.contraindications.map((ci, i) => (
                    <li key={i}>{ci}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <strong>Disclaimer:</strong> This information is for educational purposes only. The dosing information provided is based on commonly reported protocols and does not constitute medical advice. Always consult a qualified healthcare provider before using any peptides.
      </div>
    </div>
  );
}
