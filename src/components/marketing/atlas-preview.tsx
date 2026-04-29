'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageContainer } from '@/components/marketing/page-container';
import { SectionHeading } from '@/components/marketing/section-heading';
import { CTAButton } from '@/components/marketing/cta-button';

export function AtlasPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-24 border-t border-white/[0.06]">
      <PageContainer>
        <SectionHeading
          eyebrow="Preview"
          heading="See It In Action"
          subheading="An interactive atlas that brings peptide science to life."
        />

        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow behind the frame */}
          <div
            className="absolute -inset-4 rounded-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)',
            }}
          />

          {/* Glass frame */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <span className="w-3 h-3 rounded-full bg-white/10" />
              <span className="w-3 h-3 rounded-full bg-white/10" />
              <span className="w-3 h-3 rounded-full bg-white/10" />
              <span className="ml-3 text-xs text-text-muted">
                peptideatlas.app/atlas
              </span>
            </div>

            {/* Stylized atlas representation */}
            <div className="relative flex flex-col items-center justify-center py-20 px-8">
              {/* Body silhouette placeholder */}
              <svg
                viewBox="0 0 100 210"
                className="w-32 h-auto opacity-20"
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
              >
                {/* Simplified body outline */}
                <ellipse cx="50" cy="14" rx="10" ry="12" className="text-neon-cyan" />
                <line x1="50" y1="26" x2="50" y2="90" className="text-white/30" />
                <line x1="50" y1="40" x2="30" y2="70" className="text-white/30" />
                <line x1="50" y1="40" x2="70" y2="70" className="text-white/30" />
                <line x1="50" y1="90" x2="35" y2="140" className="text-white/30" />
                <line x1="50" y1="90" x2="65" y2="140" className="text-white/30" />
              </svg>

              {/* Glowing dots to represent markers */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-[28%] left-[48%] w-2 h-2 rounded-full bg-neon-cyan/60 shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                <span className="absolute top-[38%] left-[52%] w-2 h-2 rounded-full bg-neon-green/60 shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
                <span className="absolute top-[48%] left-[46%] w-2 h-2 rounded-full bg-neon-orange/60 shadow-[0_0_8px_rgba(255,107,53,0.6)]" />
                <span className="absolute top-[55%] left-[54%] w-1.5 h-1.5 rounded-full bg-neon-cyan/40 shadow-[0_0_6px_rgba(0,212,255,0.4)]" />
                <span className="absolute top-[65%] left-[44%] w-1.5 h-1.5 rounded-full bg-neon-green/40 shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
              </div>

              <p className="mt-6 text-lg font-semibold text-white/60">
                Interactive Peptide Atlas
              </p>
              <p className="mt-2 text-sm text-text-muted mb-6">
                Click any body region to explore peptide targets
              </p>
              <CTAButton href="/auth/signin?mode=signup">Get started — free</CTAButton>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
