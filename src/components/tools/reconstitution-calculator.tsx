'use client';

/**
 * Reconstitution calculator — computes draw volume, units, doses-per-vial, concentration,
 * and optional cost-per-dose from user inputs (peptide, vial size, water added, desired dose, syringe type).
 */

import { useState, useMemo } from 'react';
import { peptides } from '@/data/peptides';
import { getReconstitutionInfo } from '@/data/reconstitution';
import { SyringeVisual } from './syringe-visual';
import { cn } from '@/lib/utils';

type SyringeType = 'u100' | 'u50';

export function ReconstitutionCalculator() {
  const [selectedPeptideId, setSelectedPeptideId] = useState('bpc-157');
  const [vialSizeMg, setVialSizeMg] = useState(5);
  const [waterMl, setWaterMl] = useState(2);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(250);
  const [syringeType, setSyringeType] = useState<SyringeType>('u100');
  const [costPerVial, setCostPerVial] = useState<number | null>(null);

  // Get reconstitution info for selected peptide
  const reconInfo = useMemo(() => getReconstitutionInfo(selectedPeptideId), [selectedPeptideId]);

  // Injectable peptides only
  const injectablePeptides = useMemo(
    () => peptides.filter((p) => getReconstitutionInfo(p.id)),
    []
  );

  // Update defaults when peptide changes
  const handlePeptideChange = (id: string) => {
    setSelectedPeptideId(id);
    const info = getReconstitutionInfo(id);
    if (info) {
      setDesiredDoseMcg(info.typicalDoseMcg);
      if (info.commonVialSizes.length > 0) {
        setVialSizeMg(info.commonVialSizes[0]);
      }
    }
  };

  // Calculate results
  const results = useMemo(() => {
    if (!vialSizeMg || !waterMl || !desiredDoseMcg) return null;

    const vialMcg = vialSizeMg * 1000; // convert mg to mcg
    const concentrationMcgPerMl = vialMcg / waterMl;
    const volumeMl = desiredDoseMcg / concentrationMcgPerMl;
    const unitsPerSyringe = syringeType === 'u100' ? 100 : 100; // both are U-100 scale
    const units = volumeMl * unitsPerSyringe;
    const dosesPerVial = Math.floor(vialMcg / desiredDoseMcg);
    const costPerDose = costPerVial ? costPerVial / dosesPerVial : null;

    return {
      volumeMl,
      units,
      dosesPerVial,
      concentrationMcgPerMl,
      costPerDose,
    };
  }, [vialSizeMg, waterMl, desiredDoseMcg, syringeType, costPerVial]);

  const selectedPeptide = peptides.find((p) => p.id === selectedPeptideId);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-foreground">Input</h2>

        {/* Peptide Select */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Peptide</label>
          <select
            value={selectedPeptideId}
            onChange={(e) => handlePeptideChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          >
            {injectablePeptides.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111827]">
                {p.name} ({p.abbreviation})
              </option>
            ))}
          </select>
        </div>

        {/* Vial Size */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Vial Size (mg)
          </label>
          <div className="flex gap-2">
            {(reconInfo?.commonVialSizes || [2, 5, 10]).map((size) => (
              <button
                key={size}
                onClick={() => setVialSizeMg(size)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all border',
                  vialSizeMg === size
                    ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/[0.05] text-text-secondary border-white/[0.06] hover:bg-white/[0.08]'
                )}
              >
                {size}mg
              </button>
            ))}
            <input
              type="number"
              value={vialSizeMg}
              onChange={(e) => setVialSizeMg(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground text-center focus:outline-none focus:border-neon-cyan/50"
              min={0.1}
              step={0.1}
            />
          </div>
        </div>

        {/* Water Added */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            {reconInfo?.diluentType === 'sterile-water' ? 'Sterile Water' : 'BAC Water'} Added (mL)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((ml) => (
              <button
                key={ml}
                onClick={() => setWaterMl(ml)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all border',
                  waterMl === ml
                    ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/[0.05] text-text-secondary border-white/[0.06] hover:bg-white/[0.08]'
                )}
              >
                {ml}mL
              </button>
            ))}
            <input
              type="number"
              value={waterMl}
              onChange={(e) => setWaterMl(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground text-center focus:outline-none focus:border-neon-cyan/50"
              min={0.1}
              step={0.1}
            />
          </div>
        </div>

        {/* Desired Dose */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Desired Dose (mcg)
          </label>
          <input
            type="number"
            value={desiredDoseMcg}
            onChange={(e) => setDesiredDoseMcg(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
            min={1}
          />
          {selectedPeptide && (
            <p className="text-xs text-text-secondary mt-1">
              Typical dose: {selectedPeptide.dosing.typicalDose}
            </p>
          )}
        </div>

        {/* Syringe Type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Syringe Type</label>
          <div className="flex gap-2">
            {([['u100', 'U-100 (1mL)'], ['u50', 'U-50 (0.5mL)']] as const).map(([type, label]) => (
              <button
                key={type}
                onClick={() => setSyringeType(type)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-all border',
                  syringeType === type
                    ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30'
                    : 'bg-white/[0.05] text-text-secondary border-white/[0.06] hover:bg-white/[0.08]'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional: Cost per vial */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Cost per Vial (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">$</span>
            <input
              type="number"
              value={costPerVial ?? ''}
              onChange={(e) => setCostPerVial(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 35"
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:border-neon-cyan/50"
              min={0}
              step={0.01}
            />
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {results && (
          <>
            {/* Syringe Visual */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Draw Volume</h2>
              <SyringeVisual volumeMl={results.volumeMl} syringeType={syringeType} />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="Volume to Draw"
                value={`${results.volumeMl.toFixed(3)} mL`}
                subValue={`${results.units.toFixed(1)} units`}
                color="cyan"
              />
              <ResultCard
                label="Doses per Vial"
                value={results.dosesPerVial.toString()}
                subValue={`at ${desiredDoseMcg} mcg each`}
                color="green"
              />
              <ResultCard
                label="Concentration"
                value={`${results.concentrationMcgPerMl.toFixed(0)} mcg/mL`}
                subValue={`${vialSizeMg}mg in ${waterMl}mL`}
                color="purple"
              />
              {results.costPerDose !== null && (
                <ResultCard
                  label="Cost per Dose"
                  value={`$${results.costPerDose.toFixed(2)}`}
                  subValue={`$${costPerVial} / ${results.dosesPerVial} doses`}
                  color="orange"
                />
              )}
            </div>

            {/* Storage Info */}
            {reconInfo && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Storage</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-secondary">Temperature</span>
                    <p className="text-foreground font-medium mt-0.5">
                      {reconInfo.storageTempCelsius}°C ({Math.round(reconInfo.storageTempCelsius * 9/5 + 32)}°F) — Refrigerate
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Shelf Life (Reconstituted)</span>
                    <p className="text-foreground font-medium mt-0.5">
                      {reconInfo.shelfLifeReconstitutedDays} days
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Diluent</span>
                    <p className="text-foreground font-medium mt-0.5 capitalize">
                      {reconInfo.diluentType.replace(/-/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-secondary">Administration</span>
                    <p className="text-foreground font-medium mt-0.5 capitalize">
                      {selectedPeptide?.dosing.route}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-amber-400/80">
                This calculator is for educational purposes only. Always verify dosing with a healthcare professional. Double-check your math before administering any injection.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string;
  subValue: string;
  color: 'cyan' | 'green' | 'purple' | 'orange';
}) {
  const colorMap = {
    cyan: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5',
    green: 'text-neon-green border-neon-green/20 bg-neon-green/5',
    purple: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    orange: 'text-neon-orange border-neon-orange/20 bg-neon-orange/5',
  };

  return (
    <div className={cn('rounded-xl border p-4', colorMap[color])}>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{subValue}</p>
    </div>
  );
}
