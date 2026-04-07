'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useReducedMotion } from './use-reduced-motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(MotionPathPlugin);
}

export function usePathwayAnimation(
  containerRef: React.RefObject<SVGGElement | null>,
  pathData: string[],
  isActive: boolean
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isActive || !containerRef.current || prefersReducedMotion || pathData.length === 0) {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      return;
    }

    const container = containerRef.current;
    const dots: SVGCircleElement[] = [];

    // Create dots for each pathway
    pathData.forEach((_, i) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', '#00cc88');
      dot.setAttribute('class', 'pathway-dot');
      dot.setAttribute('opacity', '0');
      container.appendChild(dot);
      dots.push(dot);
    });

    // Create the animation timeline
    const tl = gsap.timeline({ repeat: -1 });
    timelineRef.current = tl;

    pathData.forEach((path, i) => {
      const dot = dots[i];
      if (!dot) return;

      tl.to(
        dot,
        {
          motionPath: {
            path,
            align: 'self',
            alignOrigin: [0.5, 0.5],
          },
          duration: 2.5,
          ease: 'none',
          opacity: 1,
        },
        i * 0.6
      );

      // Fade out at the end
      tl.to(
        dot,
        {
          opacity: 0,
          duration: 0.5,
        },
        i * 0.6 + 2.0
      );
    });

    return () => {
      tl.kill();
      dots.forEach((dot) => dot.remove());
      timelineRef.current = null;
    };
  }, [containerRef, pathData, isActive, prefersReducedMotion]);
}
