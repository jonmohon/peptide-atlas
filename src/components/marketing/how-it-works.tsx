'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageContainer } from '@/components/marketing/page-container';
import { SectionHeading } from '@/components/marketing/section-heading';

const steps = [
  {
    number: 1,
    title: 'Explore',
    description:
      'Navigate the interactive body map and discover peptide targets across every system.',
  },
  {
    number: 2,
    title: 'Build',
    description:
      'Create custom stacks or use expert-curated protocols tailored to your goals.',
  },
  {
    number: 3,
    title: 'Learn',
    description:
      'Deep dive into mechanisms, research, and AI-powered insights for each peptide.',
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 border-t border-white/[0.06]">
      <PageContainer>
        <SectionHeading
          eyebrow="Getting Started"
          heading="How It Works"
          subheading="Three simple steps to start exploring peptide science."
        />

        <div ref={ref} className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting lines (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-neon-cyan/30 via-neon-cyan/10 to-neon-cyan/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              custom={i}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={stepVariants}
              className="flex flex-col items-center text-center"
            >
              <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full border-2 border-neon-cyan/40 bg-background text-neon-cyan text-xl font-bold mb-5">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
