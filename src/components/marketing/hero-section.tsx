'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GradientText } from '@/components/marketing/gradient-text';
import { CTAButton } from '@/components/marketing/cta-button';
import { PageContainer } from '@/components/marketing/page-container';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center grid-bg overflow-hidden">
      {/* Hero background image */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/hero/hero-bg.webp)' }}
      />
      {/* Dark overlay to keep text readable */}
      <div className="pointer-events-none absolute inset-0 bg-background/60" />
      {/* Radial glow accents on top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(0,212,255,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 30%, rgba(168,85,247,0.10) 0%, transparent 60%)',
        }}
      />

      <PageContainer className="relative z-10 py-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-6 flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neon-cyan">
              Now live · AI personalization powered by Claude Opus 4.7
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            The peptide reference,{' '}
            <GradientText>personalized to you.</GradientText>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-10"
          >
            Track your protocol, log doses, run AI safety checks on your stack, and interpret
            bloodwork — grounded in 33 peptides with verified citations and an evidence-aware
            confidence rating on every entry.
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <CTAButton href="/auth/signin?mode=signup">Get started — free</CTAButton>
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-text-secondary hover:text-foreground transition-colors px-4 py-2"
            >
              Sign in →
            </Link>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
              Coming soon to iOS &amp; Android
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 opacity-60">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.50-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-text-muted">Coming Soon</div>
                  <div className="text-sm font-semibold text-text-secondary">App Store</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 opacity-60">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.794-3.793 2.378 1.378a1 1 0 0 1 0 1.732l-2.378 1.378-2.553-2.244 2.553-2.244zM5.864 2.658 16.802 8.99l-2.302 2.302-8.636-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-text-muted">Coming Soon</div>
                  <div className="text-sm font-semibold text-text-secondary">Google Play</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
