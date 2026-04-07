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
            Ready to Explore?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-lg mb-8 leading-relaxed">
            Discover how peptides affect your body with our free interactive
            atlas.
          </p>
          <CTAButton href="/atlas" className="px-8 py-4 text-lg">
            Launch Atlas
          </CTAButton>
          <p className="mt-5 text-xs text-text-muted">
            No signup required. Always free.
          </p>
        </motion.div>
      </PageContainer>
    </section>
  );
}
