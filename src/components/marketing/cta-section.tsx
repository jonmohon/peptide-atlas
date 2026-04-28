'use client';

import { motion } from 'framer-motion';
import { PageContainer } from '@/components/marketing/page-container';
import { CTAButton } from '@/components/marketing/cta-button';

export function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Radial glow background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }}
      />

      <PageContainer className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop guessing. Start tracking.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mb-8 leading-relaxed">
            Create a free account to unlock the AI protocol generator,
            bloodwork interpretation, daily journal, and saved stacks —
            personalized to your goals and history.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CTAButton href="/auth/signin?mode=signup" className="px-8 py-4 text-lg">
              Get started — free
            </CTAButton>
            <a
              href="/auth/signin"
              className="px-6 py-4 text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign in →
            </a>
          </div>
          <p className="mt-5 text-xs text-text-muted">
            Free tier includes the full peptide library and body map. Upgrade
            anytime for unlimited AI runs.
          </p>
        </motion.div>
      </PageContainer>
    </section>
  );
}
