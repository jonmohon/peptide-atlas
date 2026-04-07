'use client';

import { motion } from 'framer-motion';
import { GradientText } from '@/components/marketing/gradient-text';
import { CTAButton } from '@/components/marketing/cta-button';
import { PageContainer } from '@/components/marketing/page-container';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center grid-bg overflow-hidden">
      {/* Radial glow behind content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,212,255,0.08) 0%, transparent 70%)',
        }}
      />

      <PageContainer className="relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan mb-6"
          >
            Interactive Peptide Education Platform
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            Explore How Peptides{' '}
            <GradientText>Transform Your Body</GradientText>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-8"
          >
            An interactive visual atlas that maps peptide effects across every
            body system. Build custom stacks, explore pre-built protocols, and
            learn the science behind each compound.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <CTAButton href="/atlas">Launch Atlas</CTAButton>
          </motion.div>

          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-5 text-xs text-text-muted"
          >
            Free to use. No signup required.
          </motion.p>
        </div>
      </PageContainer>
    </section>
  );
}
