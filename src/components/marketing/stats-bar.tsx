'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { peptides } from '@/data/peptides';
import { bodyRegions } from '@/data/body-regions';
import { stacks } from '@/data/stacks';
import { PageContainer } from '@/components/marketing/page-container';

interface StatItemProps {
  target: number;
  suffix?: string;
  label: string;
  inView: boolean;
}

function StatItem({ target, suffix = '', label, inView }: StatItemProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl sm:text-4xl font-bold text-neon-cyan tabular-nums">
        {count}
        {suffix}
      </span>
      <span className="text-sm text-white/70">{label}</span>
    </div>
  );
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  const stats = [
    { target: peptides.length, suffix: '+', label: 'Peptides Cataloged' },
    { target: bodyRegions.length, suffix: '', label: 'Body Systems Mapped' },
    { target: stacks.length, suffix: '', label: 'Pre-built Stacks' },
  ];

  return (
    <section
      ref={ref}
      className="border-t border-b border-white/[0.06] bg-surface-dim/50"
    >
      <PageContainer className="py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-6"
        >
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
              inView={inView}
            />
          ))}
        </motion.div>
      </PageContainer>
    </section>
  );
}
