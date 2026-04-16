'use client';

/**
 * SVG syringe illustration that fills proportionally to the calculated draw volume.
 * Renders tick marks in units for U-100 (1 mL) or U-50 (0.5 mL) insulin syringes.
 */

interface SyringeVisualProps {
  /** Volume to draw in mL */
  volumeMl: number;
  /** Syringe capacity: 'u100' (1mL) or 'u50' (0.5mL) */
  syringeType: 'u100' | 'u50';
}

export function SyringeVisual({ volumeMl, syringeType }: SyringeVisualProps) {
  const maxMl = syringeType === 'u100' ? 1.0 : 0.5;
  const maxUnits = syringeType === 'u100' ? 100 : 50;
  const fillPercent = Math.min(1, volumeMl / maxMl);
  const units = volumeMl * (syringeType === 'u100' ? 100 : 100);

  // SVG dimensions
  const width = 200;
  const height = 60;
  const barrelLeft = 40;
  const barrelRight = 180;
  const barrelTop = 15;
  const barrelBottom = 45;
  const barrelWidth = barrelRight - barrelLeft;
  const barrelHeight = barrelBottom - barrelTop;
  const fillWidth = barrelWidth * fillPercent;

  // Generate tick marks
  const tickCount = syringeType === 'u100' ? 10 : 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const x = barrelLeft + (barrelWidth * i) / tickCount;
    const label = Math.round((maxUnits * i) / tickCount);
    return { x, label, major: i % 2 === 0 };
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs">
        {/* Plunger */}
        <rect x={2} y={barrelTop + 5} width={38} height={barrelHeight - 10} rx={2} fill="#2a2f3e" stroke="#3a4050" strokeWidth={1} />
        <line x1={5} y1={barrelTop + barrelHeight / 2} x2={38} y2={barrelTop + barrelHeight / 2} stroke="#4a5060" strokeWidth={1} />

        {/* Barrel outline */}
        <rect x={barrelLeft} y={barrelTop} width={barrelWidth} height={barrelHeight} rx={3} fill="#111827" stroke="#3a4050" strokeWidth={1.5} />

        {/* Fill */}
        {fillWidth > 0 && (
          <rect
            x={barrelLeft + 1}
            y={barrelTop + 1}
            width={Math.max(0, fillWidth - 2)}
            height={barrelHeight - 2}
            rx={2}
            fill="url(#fill-gradient)"
            className="transition-all duration-500"
          />
        )}

        {/* Tick marks */}
        {ticks.map(({ x, label, major }) => (
          <g key={label}>
            <line
              x1={x}
              y1={barrelBottom}
              x2={x}
              y2={barrelBottom + (major ? 8 : 5)}
              stroke="#6b7280"
              strokeWidth={major ? 1 : 0.5}
            />
            {major && (
              <text x={x} y={barrelBottom + 16} textAnchor="middle" fill="#9ca3af" fontSize={7} fontFamily="monospace">
                {label}
              </text>
            )}
          </g>
        ))}

        {/* Needle */}
        <line x1={barrelRight} y1={barrelTop + barrelHeight / 2} x2={barrelRight + 18} y2={barrelTop + barrelHeight / 2} stroke="#9ca3af" strokeWidth={1} />
        <polygon points={`${barrelRight + 18},${barrelTop + barrelHeight / 2 - 2} ${barrelRight + 18},${barrelTop + barrelHeight / 2 + 2} ${barrelRight + 24},${barrelTop + barrelHeight / 2}`} fill="#9ca3af" />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="fill-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0.7)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span>{syringeType === 'u100' ? 'U-100 (1mL)' : 'U-50 (0.5mL)'} syringe</span>
        <span className="text-neon-cyan font-mono font-bold">
          {units.toFixed(1)} units = {volumeMl.toFixed(3)} mL
        </span>
      </div>
    </div>
  );
}
