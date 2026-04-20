'use client';

/**
 * SVG syringe illustration that fills proportionally to the calculated draw volume.
 * Renders tick marks in units for U-30 (0.3 mL), U-50 (0.5 mL), or U-100 (1 mL)
 * insulin syringes. Optional drag handler lets the user scrub the plunger, which
 * emits the new volume in mL (and units are trivially derived).
 */

import { useCallback, useRef } from 'react';

export type SyringeType = 'u30' | 'u50' | 'u100';

interface SyringeVisualProps {
  volumeMl: number;
  syringeType: SyringeType;
  /** When provided, turns on drag-scrubbing of the plunger. */
  onVolumeChange?: (volumeMl: number) => void;
  /** Optional label suffix, e.g. peptide name. */
  label?: string;
}

const CAPACITY_ML: Record<SyringeType, number> = { u30: 0.3, u50: 0.5, u100: 1.0 };
const MAX_UNITS: Record<SyringeType, number> = { u30: 30, u50: 50, u100: 100 };
const SYRINGE_LABEL: Record<SyringeType, string> = {
  u30: 'U-30 (0.3 mL)',
  u50: 'U-50 (0.5 mL)',
  u100: 'U-100 (1 mL)',
};

export function SyringeVisual({
  volumeMl,
  syringeType,
  onVolumeChange,
  label,
}: SyringeVisualProps) {
  const maxMl = CAPACITY_ML[syringeType];
  const maxUnits = MAX_UNITS[syringeType];
  const fillPercent = Math.min(1, Math.max(0, volumeMl / maxMl));
  const units = volumeMl * 100;
  const draggable = typeof onVolumeChange === 'function';

  const width = 200;
  const height = 60;
  const barrelLeft = 40;
  const barrelRight = 180;
  const barrelTop = 15;
  const barrelBottom = 45;
  const barrelWidth = barrelRight - barrelLeft;
  const barrelHeight = barrelBottom - barrelTop;
  const fillWidth = barrelWidth * fillPercent;

  const tickCount = maxUnits === 30 ? 6 : maxUnits === 50 ? 10 : 10;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const x = barrelLeft + (barrelWidth * i) / tickCount;
    const label = Math.round((maxUnits * i) / tickCount);
    return { x, label, major: i % 2 === 0 };
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const handlePointer = useCallback(
    (clientX: number) => {
      if (!onVolumeChange || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((clientX - rect.left) / rect.width) * width;
      const clamped = Math.min(barrelRight, Math.max(barrelLeft, svgX));
      const pct = (clamped - barrelLeft) / barrelWidth;
      const nextMl = pct * maxMl;
      // Snap to whole insulin units by default (0.01mL resolution).
      const snapped = Math.round(nextMl * 100) / 100;
      onVolumeChange(snapped);
    },
    [onVolumeChange, maxMl],
  );

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggable) return;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    handlePointer(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!draggable || e.buttons !== 1) return;
    handlePointer(e.clientX);
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full max-w-xs ${draggable ? 'cursor-ew-resize touch-none' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
      >
        {/* Plunger shaft */}
        <rect
          x={2 + fillWidth}
          y={barrelTop + 5}
          width={38}
          height={barrelHeight - 10}
          rx={2}
          fill="#2a2f3e"
          stroke="#3a4050"
          strokeWidth={1}
          className="transition-all duration-200"
        />
        <line
          x1={5 + fillWidth}
          y1={barrelTop + barrelHeight / 2}
          x2={38 + fillWidth}
          y2={barrelTop + barrelHeight / 2}
          stroke="#4a5060"
          strokeWidth={1}
          className="transition-all duration-200"
        />

        {/* Barrel outline */}
        <rect
          x={barrelLeft}
          y={barrelTop}
          width={barrelWidth}
          height={barrelHeight}
          rx={3}
          fill="#111827"
          stroke="#3a4050"
          strokeWidth={1.5}
        />

        {/* Fill */}
        {fillWidth > 0 && (
          <rect
            x={barrelLeft + 1}
            y={barrelTop + 1}
            width={Math.max(0, fillWidth - 2)}
            height={barrelHeight - 2}
            rx={2}
            fill="url(#fill-gradient)"
            className="transition-all duration-200"
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
              <text
                x={x}
                y={barrelBottom + 16}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={7}
                fontFamily="monospace"
              >
                {label}
              </text>
            )}
          </g>
        ))}

        {/* Needle */}
        <line
          x1={barrelRight}
          y1={barrelTop + barrelHeight / 2}
          x2={barrelRight + 18}
          y2={barrelTop + barrelHeight / 2}
          stroke="#9ca3af"
          strokeWidth={1}
        />
        <polygon
          points={`${barrelRight + 18},${barrelTop + barrelHeight / 2 - 2} ${barrelRight + 18},${barrelTop + barrelHeight / 2 + 2} ${barrelRight + 24},${barrelTop + barrelHeight / 2}`}
          fill="#9ca3af"
        />

        <defs>
          <linearGradient id="fill-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0.7)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span>{SYRINGE_LABEL[syringeType]}</span>
        <span className="text-neon-cyan font-mono font-bold">
          {units.toFixed(1)} units · {volumeMl.toFixed(3)} mL
        </span>
        {label && <span className="text-text-secondary/70">{label}</span>}
      </div>
    </div>
  );
}
