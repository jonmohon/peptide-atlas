'use client';

import { motion } from 'framer-motion';
import type { RegionId } from '@/types/body';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { COLORS } from '@/lib/constants';

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

  const getFill = () => {
    if (isSelected) return 'rgba(0, 102, 204, 0.35)';
    if (highlightIntensity > 0) {
      return COLORS.intensity[highlightIntensity as keyof typeof COLORS.intensity] ?? COLORS.intensity[3];
    }
    if (isHovered) return 'rgba(0, 102, 204, 0.12)';
    return 'rgba(0, 102, 204, 0.04)';
  };

  const getFilter = () => {
    if (isSelected) return 'url(#glow-blue-strong)';
    if (isHovered) return 'url(#glow-blue)';
    return 'none';
  };

  return (
    <motion.g
      id={`region-${regionId}`}
      data-region={regionId}
      role="button"
      tabIndex={0}
      aria-label={`${label}${highlightIntensity > 0 ? `, intensity ${highlightIntensity} of 5` : ''}`}
      className="body-region cursor-pointer outline-none"
      onMouseEnter={() => onHover(regionId)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(regionId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(regionId);
        }
      }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <motion.path
        d={path}
        fill={getFill()}
        stroke={isSelected ? '#0066cc' : isHovered ? '#0066cc' : 'rgba(0, 102, 204, 0.15)'}
        strokeWidth={isSelected ? 1.5 : isHovered ? 1 : 0.5}
        filter={getFilter()}
        animate={{
          fill: getFill(),
          stroke: isSelected ? '#0066cc' : isHovered ? '#0066cc' : 'rgba(0, 102, 204, 0.15)',
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      />
    </motion.g>
  );
}
