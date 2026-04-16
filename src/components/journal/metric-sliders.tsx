'use client';

import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color: string;
  unit?: string;
  type?: 'slider' | 'number';
}

function MetricSlider({ label, value, onChange, min = 1, max = 10, step = 1, color, unit, type = 'slider' }: SliderProps) {
  if (type === 'number') {
    return (
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder="—"
            min={min}
            max={max}
            step={step}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          />
          {unit && <span className="text-xs text-text-secondary shrink-0">{unit}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-text-secondary">{label}</label>
        <span className="text-sm font-bold" style={{ color: value ? color : undefined }}>
          {value ?? '—'}
          {unit && value && <span className="text-xs font-normal text-text-secondary ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value ?? min}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: value
            ? `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.06) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.06) 100%)`
            : 'rgba(255,255,255,0.06)',
        }}
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-text-secondary">{min}</span>
        <span className="text-[9px] text-text-secondary">{max}</span>
      </div>
    </div>
  );
}

interface MetricSlidersProps {
  mood: number | null;
  energy: number | null;
  sleepQuality: number | null;
  sleepHours: number | null;
  weight: number | null;
  bodyFat: number | null;
  onUpdate: (field: string, value: number) => void;
}

export function MetricSliders({ mood, energy, sleepQuality, sleepHours, weight, bodyFat, onUpdate }: MetricSlidersProps) {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">How You Feel</h3>
      <div className="space-y-4">
        <MetricSlider label="Mood" value={mood} onChange={(v) => onUpdate('mood', v)} color="#00ff88" />
        <MetricSlider label="Energy" value={energy} onChange={(v) => onUpdate('energy', v)} color="#ff6b35" />
        <MetricSlider label="Sleep Quality" value={sleepQuality} onChange={(v) => onUpdate('sleepQuality', v)} color="#a855f7" />
      </div>

      <h3 className="text-sm font-semibold text-foreground mt-6">Body Metrics</h3>
      <div className="grid grid-cols-3 gap-3">
        <MetricSlider label="Sleep" value={sleepHours} onChange={(v) => onUpdate('sleepHours', v)} type="number" color="#a855f7" unit="hrs" min={0} max={16} step={0.5} />
        <MetricSlider label="Weight" value={weight} onChange={(v) => onUpdate('weight', v)} type="number" color="#00d4ff" unit="lbs" min={50} max={500} step={0.1} />
        <MetricSlider label="Body Fat" value={bodyFat} onChange={(v) => onUpdate('bodyFat', v)} type="number" color="#00d4ff" unit="%" min={1} max={60} step={0.1} />
      </div>
    </div>
  );
}
