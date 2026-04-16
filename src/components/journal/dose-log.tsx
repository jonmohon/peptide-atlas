'use client';

import { useState } from 'react';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import type { PeptideDose } from '@/types/journal';

interface DoseLogProps {
  doses: PeptideDose[];
  onAdd: (dose: PeptideDose) => void;
  onUpdate: (index: number, dose: PeptideDose) => void;
  onRemove: (index: number) => void;
}

const ROUTES: PeptideDose['route'][] = ['subcutaneous', 'intramuscular', 'oral', 'nasal', 'topical'];
const UNITS: PeptideDose['unit'][] = ['mcg', 'mg', 'iu'];
const SITES = ['abdomen', 'thigh-left', 'thigh-right', 'deltoid-left', 'deltoid-right', 'glute-left', 'glute-right'];

const injectablePeptides = peptides.filter((p) => p.dosing.route !== 'oral');

export function DoseLog({ doses, onAdd, onUpdate, onRemove }: DoseLogProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDose, setNewDose] = useState<PeptideDose>({
    peptideId: injectablePeptides[0]?.id ?? '',
    dose: 0,
    unit: 'mcg',
    route: 'subcutaneous',
    site: 'abdomen',
    time: new Date().toTimeString().slice(0, 5),
  });

  const handleAdd = () => {
    if (newDose.dose <= 0) return;
    onAdd({ ...newDose });
    setNewDose((prev) => ({ ...prev, dose: 0 }));
    setShowAdd(false);
  };

  const getPeptideName = (id: string) => peptides.find((p) => p.id === id)?.name ?? id;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Peptide Doses</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          + Add Dose
        </button>
      </div>

      {/* Existing doses */}
      {doses.length > 0 && (
        <div className="space-y-2 mb-3">
          {doses.map((dose, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {getPeptideName(dose.peptideId)}
                </div>
                <div className="text-xs text-text-secondary">
                  {dose.dose} {dose.unit} · {dose.route} · {dose.site} · {dose.time}
                </div>
              </div>
              <button
                onClick={() => onRemove(i)}
                className="shrink-0 p-1.5 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {doses.length === 0 && !showAdd && (
        <p className="text-xs text-text-secondary py-3">No doses logged. Tap &quot;+ Add Dose&quot; to start.</p>
      )}

      {/* Add dose form */}
      {showAdd && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-neon-cyan/20 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-text-secondary mb-1">Peptide</label>
              <select
                value={newDose.peptideId}
                onChange={(e) => setNewDose((prev) => ({ ...prev, peptideId: e.target.value }))}
                className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
              >
                {peptides.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111827]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-text-secondary mb-1">Dose</label>
                <input
                  type="number"
                  value={newDose.dose || ''}
                  onChange={(e) => setNewDose((prev) => ({ ...prev, dose: Number(e.target.value) }))}
                  className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
                  placeholder="250"
                  min={0}
                />
              </div>
              <div className="w-16">
                <label className="block text-[10px] text-text-secondary mb-1">Unit</label>
                <select
                  value={newDose.unit}
                  onChange={(e) => setNewDose((prev) => ({ ...prev, unit: e.target.value as PeptideDose['unit'] }))}
                  className="w-full px-2 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u} className="bg-[#111827]">{u}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-text-secondary mb-1">Route</label>
              <select
                value={newDose.route}
                onChange={(e) => setNewDose((prev) => ({ ...prev, route: e.target.value as PeptideDose['route'] }))}
                className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
              >
                {ROUTES.map((r) => (
                  <option key={r} value={r} className="bg-[#111827]">{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-text-secondary mb-1">Injection Site</label>
              <select
                value={newDose.site}
                onChange={(e) => setNewDose((prev) => ({ ...prev, site: e.target.value }))}
                className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
              >
                {SITES.map((s) => (
                  <option key={s} value={s} className="bg-[#111827]">{s.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-text-secondary mb-1">Time</label>
              <input
                type="time"
                value={newDose.time}
                onChange={(e) => setNewDose((prev) => ({ ...prev, time: e.target.value }))}
                className="w-full px-2.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground focus:outline-none focus:border-neon-cyan/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={newDose.dose <= 0}
              className="px-4 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs font-medium border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
