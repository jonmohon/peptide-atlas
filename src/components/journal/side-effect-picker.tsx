'use client';

/**
 * Side effect tag selector for the daily journal entry form.
 * Provides a preset list of common effects plus a custom input; each selected effect
 * has a 1-5 severity rating.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { SideEffect } from '@/types/journal';

const COMMON_SIDE_EFFECTS = [
  'Nausea', 'Headache', 'Fatigue', 'Injection site redness', 'Injection site pain',
  'Dizziness', 'Flushing', 'Increased appetite', 'Decreased appetite', 'Water retention',
  'Joint pain', 'Numbness/tingling', 'Insomnia', 'Vivid dreams', 'Irritability',
  'Bloating', 'Hunger', 'Lethargy', 'Anxiety',
];

interface SideEffectPickerProps {
  effects: SideEffect[];
  onChange: (effects: SideEffect[]) => void;
}

export function SideEffectPicker({ effects, onChange }: SideEffectPickerProps) {
  const [customName, setCustomName] = useState('');

  const toggleEffect = (name: string) => {
    const existing = effects.find((e) => e.name === name);
    if (existing) {
      onChange(effects.filter((e) => e.name !== name));
    } else {
      onChange([...effects, { name, severity: 2 }]);
    }
  };

  const updateSeverity = (name: string, severity: SideEffect['severity']) => {
    onChange(effects.map((e) => (e.name === name ? { ...e, severity } : e)));
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    if (effects.find((e) => e.name === customName.trim())) return;
    onChange([...effects, { name: customName.trim(), severity: 2 }]);
    setCustomName('');
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Side Effects</h3>

      {/* Common effects grid */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {COMMON_SIDE_EFFECTS.map((name) => {
          const selected = effects.find((e) => e.name === name);
          return (
            <button
              key={name}
              onClick={() => toggleEffect(name)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                selected
                  ? 'bg-neon-orange/20 text-neon-orange border-neon-orange/30'
                  : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]'
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Custom effect input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add custom side effect..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-foreground placeholder:text-text-secondary focus:outline-none focus:border-neon-cyan/50"
        />
        <button
          onClick={addCustom}
          disabled={!customName.trim()}
          className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-xs text-text-secondary hover:text-foreground transition-colors disabled:opacity-30"
        >
          Add
        </button>
      </div>

      {/* Selected effects with severity */}
      {effects.length > 0 && (
        <div className="space-y-2">
          {effects.map((effect) => (
            <div key={effect.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03]">
              <span className="text-xs text-foreground flex-1">{effect.name}</span>
              <div className="flex gap-0.5">
                {([1, 2, 3, 4, 5] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSeverity(effect.name, s)}
                    className={cn(
                      'w-5 h-5 rounded text-[9px] font-bold transition-all',
                      effect.severity >= s
                        ? s <= 2 ? 'bg-neon-green/30 text-neon-green' : s <= 3 ? 'bg-amber-500/30 text-amber-400' : 'bg-red-500/30 text-red-400'
                        : 'bg-white/[0.04] text-white/20'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => toggleEffect(effect.name)}
                className="p-1 text-text-secondary hover:text-red-400 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
