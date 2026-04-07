'use client';

import { useCallback } from 'react';
import type { RegionId, RegionHighlight } from '@/types/body';
import type { Pathway } from '@/data/pathways';
import { regionPaths, bodyOutlinePath } from '@/lib/svg-paths';
import { BODY_SVG } from '@/lib/constants';
import { BodyGlowFilter } from './body-glow-filter';
import { BodyRegion } from './body-region';
import { PathwayOverlay } from './pathway-overlay';

interface BodySvgProps {
  hoveredRegion: RegionId | null;
  selectedRegion: RegionId | null;
  highlightedRegions: Map<RegionId, RegionHighlight>;
  activePathways?: Pathway[];
  showPathways?: boolean;
  onRegionHover: (regionId: RegionId | null) => void;
  onRegionClick: (regionId: RegionId) => void;
  className?: string;
}

export function BodySvg({
  hoveredRegion,
  selectedRegion,
  highlightedRegions,
  activePathways = [],
  showPathways = false,
  onRegionHover,
  onRegionClick,
  className,
}: BodySvgProps) {
  const getHighlightIntensity = useCallback(
    (regionId: RegionId): number => {
      return highlightedRegions.get(regionId)?.intensity ?? 0;
    },
    [highlightedRegions]
  );

  return (
    <svg
      viewBox={BODY_SVG.viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Interactive human body diagram showing peptide-affected regions"
    >
      <BodyGlowFilter />

      {/* Body outline silhouette */}
      <path
        d={bodyOutlinePath}
        fill="#f0f4f8"
        stroke="#c8d6e5"
        strokeWidth={1}
        opacity={0.6}
      />

      {/* Interactive regions */}
      {(Object.entries(regionPaths) as [RegionId, { d: string; label: string }][]).map(
        ([regionId, { d, label }]) => (
          <BodyRegion
            key={regionId}
            regionId={regionId}
            path={d}
            label={label}
            isHovered={hoveredRegion === regionId}
            isSelected={selectedRegion === regionId}
            highlightIntensity={getHighlightIntensity(regionId)}
            onHover={onRegionHover}
            onClick={onRegionClick}
          />
        )
      )}

      {/* Pathway animations */}
      <PathwayOverlay pathways={activePathways} isActive={showPathways} />

      {/* Region labels (shown on hover) */}
      {hoveredRegion && regionPaths[hoveredRegion] && (
        <g pointerEvents="none">
          <text
            x={200}
            y={15}
            textAnchor="middle"
            fill="#1e293b"
            fontSize="13"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {regionPaths[hoveredRegion].label}
          </text>
        </g>
      )}
    </svg>
  );
}
