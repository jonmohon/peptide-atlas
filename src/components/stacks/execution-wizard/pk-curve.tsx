'use client';

/**
 * Tiny SVG plasma-concentration curve for one peptide over one week.
 * Uses first-order decay (C = C0 * (1/2)^(t/halfLife)) with repeated doses.
 * Purely decorative — visualizes why timing matters without being medically precise.
 */

interface PkCurveProps {
  halfLifeHours: number;
  doseSlots: { dayIndex: number; hour: number }[]; // 0..6 Sun..Sat
  label?: string;
}

const HOURS = 24 * 7; // 168 hours in a week
const WIDTH = 336;
const HEIGHT = 48;

export function PkCurve({ halfLifeHours, doseSlots, label }: PkCurveProps) {
  if (!halfLifeHours || halfLifeHours <= 0 || doseSlots.length === 0) return null;

  const samples = new Array(HOURS).fill(0);
  for (let t = 0; t < HOURS; t++) {
    let c = 0;
    for (const slot of doseSlots) {
      const doseTime = slot.dayIndex * 24 + slot.hour;
      if (t >= doseTime) {
        const elapsed = t - doseTime;
        c += Math.pow(0.5, elapsed / halfLifeHours);
      }
    }
    samples[t] = c;
  }

  const max = Math.max(1, ...samples);
  const points = samples
    .map((v, i) => {
      const x = (i / (HOURS - 1)) * WIDTH;
      const y = HEIGHT - (v / max) * HEIGHT * 0.9 - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div>
      {label && (
        <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
          {label} — plasma curve (t½ = {halfLifeHours}h)
        </div>
      )}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        {/* Day boundaries */}
        {Array.from({ length: 8 }, (_, i) => i).map((d) => (
          <line
            key={d}
            x1={(d / 7) * WIDTH}
            x2={(d / 7) * WIDTH}
            y1={0}
            y2={HEIGHT}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.5}
          />
        ))}
        <polyline
          fill="url(#pk-fill)"
          stroke="rgba(0,212,255,0.7)"
          strokeWidth={1.2}
          points={`0,${HEIGHT} ${points} ${WIDTH},${HEIGHT}`}
        />
        {/* Dose markers */}
        {doseSlots.map((s, i) => {
          const t = s.dayIndex * 24 + s.hour;
          const x = (t / HOURS) * WIDTH;
          return (
            <line
              key={i}
              x1={x}
              x2={x}
              y1={HEIGHT - 4}
              y2={HEIGHT}
              stroke="#00d4ff"
              strokeWidth={1.5}
            />
          );
        })}
        <defs>
          <linearGradient id="pk-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,212,255,0.25)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
