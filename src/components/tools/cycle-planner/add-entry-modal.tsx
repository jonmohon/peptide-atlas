'use client';

/**
 * Modal for adding a peptide entry to a cycle plan.
 * Pre-fills dose/unit from the peptide's default dosing protocol.
 */

import { useState, useMemo } from 'react';
import { peptides } from '@/data/peptides';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import type { CycleEntry, CyclePattern } from './types';
import { CYCLE_PATTERNS } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: CycleEntry) => void;
  maxWeeks: number;
  existingEntries: CycleEntry[];
}

function parseTypicalDose(typical: string): { dose: string; unit: 'mcg' | 'mg' | 'iu' } {
  const match = typical.match(/([\d.\-–]+)\s*(mcg|mg|iu)/i);
  if (match) {
    return { dose: match[1].replace('–', '-'), unit: match[2].toLowerCase() as 'mcg' | 'mg' | 'iu' };
  }
  return { dose: '', unit: 'mcg' };
}

export function AddEntryModal({ isOpen, onClose, onAdd, maxWeeks, existingEntries }: Props) {
  const [search, setSearch] = useState('');
  const [peptideId, setPeptideId] = useState<string | null>(null);
  const [startWeek, setStartWeek] = useState(1);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [pattern, setPattern] = useState<CyclePattern>('continuous');
  const [dose, setDose] = useState('');
  const [unit, setUnit] = useState<'mcg' | 'mg' | 'iu'>('mcg');

  const filtered = useMemo(() => {
    const used = new Set(existingEntries.map((e) => e.peptideId));
    const s = search.toLowerCase();
    return peptides
      .filter((p) => !used.has(p.id))
      .filter((p) => !s || p.name.toLowerCase().includes(s) || p.abbreviation.toLowerCase().includes(s));
  }, [search, existingEntries]);

  const selected = peptideId ? peptides.find((p) => p.id === peptideId) : null;

  function handlePick(id: string) {
    setPeptideId(id);
    const p = peptides.find((pp) => pp.id === id);
    if (p?.dosing.typicalDose) {
      const { dose: d, unit: u } = parseTypicalDose(p.dosing.typicalDose);
      if (d) setDose(d);
      setUnit(u);
    }
  }

  function handleAdd() {
    if (!peptideId || !dose) return;
    onAdd({
      id: crypto.randomUUID(),
      peptideId,
      startWeek,
      durationWeeks,
      pattern,
      dose,
      unit,
    });
    setPeptideId(null);
    setSearch('');
    setDose('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add peptide to cycle">
      {!selected ? (
        <div>
          <input
            type="text"
            placeholder="Search peptides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm mb-3 focus:outline-none focus:border-gray-400"
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePick(p.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    {p.abbreviation} · {p.dosing.typicalDose} · {p.dosing.frequency}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 uppercase">{p.category}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No peptides found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
              <div className="text-xs text-gray-500">
                Suggested: {selected.dosing.typicalDose}, {selected.dosing.frequency}
              </div>
            </div>
            <button
              onClick={() => setPeptideId(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start week</label>
              <input
                type="number"
                min={1}
                max={maxWeeks}
                value={startWeek}
                onChange={(e) => setStartWeek(Math.max(1, Math.min(maxWeeks, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input
                type="number"
                min={1}
                max={maxWeeks}
                value={durationWeeks}
                onChange={(e) =>
                  setDurationWeeks(Math.max(1, Math.min(maxWeeks, Number(e.target.value))))
                }
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pattern</label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as CyclePattern)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
            >
              {Object.entries(CYCLE_PATTERNS).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label} — {v.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Dose</label>
              <input
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g., 250 or 200-400"
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'mcg' | 'mg' | 'iu')}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
              >
                <option value="mcg">mcg</option>
                <option value="mg">mg</option>
                <option value="iu">iu</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!dose}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-semibold',
                dose
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              Add to cycle
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
