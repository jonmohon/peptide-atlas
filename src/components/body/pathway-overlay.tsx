'use client';

import { useRef } from 'react';
import { usePathwayAnimation } from '@/hooks/use-pathway-animation';
import type { Pathway } from '@/data/pathways';

interface PathwayOverlayProps {
  pathways: Pathway[];
  isActive: boolean;
}

export function PathwayOverlay({ pathways, isActive }: PathwayOverlayProps) {
  const containerRef = useRef<SVGGElement>(null);
  const pathStrings = pathways.map((p) => p.svgPath);

  usePathwayAnimation(containerRef, pathStrings, isActive);

  return (
    <g ref={containerRef} id="pathways-layer" pointerEvents="none">
      {/* Static pathway lines (dashed) */}
      {isActive &&
        pathways.map((pathway, i) => (
          <path
            key={i}
            d={pathway.svgPath}
            fill="none"
            stroke="#00cc88"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            opacity={0.4}
            className="pathway-line"
          />
        ))}
    </g>
  );
}
