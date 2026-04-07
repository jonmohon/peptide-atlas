'use client';

import { motion } from 'framer-motion';
import type { RegionId } from '@/types/body';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { bodyRegions } from '@/data/body-regions';

interface BodyRegionProps {
  regionId: RegionId;
  path: string;
  label: string;
  isHovered: boolean;
  isSelected: boolean;
  highlightIntensity: number;
  onHover: (regionId: RegionId | null) => void;
  onClick: (regionId: RegionId) => void;
}

function getMarkerColor(isSelected: boolean, isHovered: boolean, intensity: number): string {
  if (isSelected) return '#00ff88';
  if (isHovered) return '#ffffff';
  if (intensity >= 3) return '#ff6b35';
  if (intensity >= 1) return '#00d4ff';
  return '#00d4ff';
}

// Uniform size for all markers
const MARKER_R = 1.2;

export function BodyRegion({
  regionId,
  path,
  label,
  isHovered,
  isSelected,
  highlightIntensity,
  onHover,
  onClick,
}: BodyRegionProps) {
  const prefersReducedMotion = useReducedMotion();

  const region = bodyRegions.find((r) => r.id === regionId);
  const position = region?.position ?? { x: 50, y: 100 };

  const color = getMarkerColor(isSelected, isHovered, highlightIntensity);
  const isActive = isSelected || isHovered || highlightIntensity > 0;

  return (
    <motion.g
      id={`region-${regionId}`}
      data-region={regionId}
      role="button"
      tabIndex={0}
      aria-label={`${label}${highlightIntensity > 0 ? `, intensity ${highlightIntensity} of 5` : ''}`}
      className="cursor-pointer outline-none"
      onMouseEnter={() => onHover(regionId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(regionId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(regionId);
        }
      }}
    >
      {/* Invisible hit area */}
      <circle
        cx={position.x}
        cy={position.y}
        r={3}
        fill="transparent"
      />

      {/* Outer glow - just a larger semi-transparent circle, NO svg filter */}
      <circle
        cx={position.x}
        cy={position.y}
        r={MARKER_R + (isActive ? 0.4 : 0.2)}
        fill={color}
        opacity={isHovered ? 0.3 : isActive ? 0.2 : 0.12}
        style={{ transition: 'opacity 200ms ease, r 200ms ease' }}
      />

      {/* Pulse ring when active */}
      {isActive && !prefersReducedMotion && (
        <circle
          cx={position.x}
          cy={position.y}
          r={MARKER_R + 0.5}
          fill="none"
          stroke={color}
          strokeWidth={0.15}
          opacity={0.4}
          className="marker-ring"
        />
      )}

      {/* Main dot */}
      <motion.circle
        cx={position.x}
        cy={position.y}
        r={MARKER_R}
        fill={color}
        opacity={isActive ? 1 : 0.75}
        className={!prefersReducedMotion && !isActive ? 'marker-dot' : ''}
        whileHover={prefersReducedMotion ? {} : { scale: 1.3 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
        transition={{ duration: 0.15 }}
        style={{
          transition: 'fill 200ms ease, opacity 200ms ease',
          transformOrigin: `${position.x}px ${position.y}px`,
        }}
      />

      {/* Bright core */}
      <circle
        cx={position.x}
        cy={position.y}
        r={MARKER_R * 0.35}
        fill="#ffffff"
        opacity={isHovered ? 0.9 : isSelected ? 0.7 : 0.4}
        style={{ transition: 'opacity 200ms ease' }}
      />

      {/* Hover label */}
      {isHovered && (
        <g pointerEvents="none">
          <rect
            x={position.x - 16}
            y={position.y - 8}
            width={32}
            height={5}
            rx={2.5}
            fill="rgba(10, 14, 23, 0.9)"
            stroke="rgba(0, 212, 255, 0.3)"
            strokeWidth={0.2}
          />
          <text
            x={position.x}
            y={position.y - 4.5}
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="2.8"
            fontWeight="500"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {label}
          </text>
        </g>
      )}
    </motion.g>
  );
}
