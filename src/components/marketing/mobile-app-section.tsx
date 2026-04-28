'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageContainer } from '@/components/marketing/page-container';

/**
 * Mobile App teaser section. iOS + Android coming-soon stores with a screenshot
 * carousel of the actual mobile app (signed-in dashboard, peptide detail, AI
 * pipeline). Hero images live at /public/mobile/ — see docs/IMAGE-PROMPTS.md.
 */
export function MobileAppSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(168,85,247,0.06) 0%, transparent 70%)',
      }}
    >
      <PageContainer>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-purple mb-4">
              Mobile App · Coming Soon
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5">
              Your peptide intelligence,{' '}
              <span className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
                in your pocket.
              </span>
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-8">
              Native iOS &amp; Android apps with the full Atlas experience —
              streaming AI protocol generator, photo OCR for bloodwork, daily
              journal with reminders, body map, and the verified peptide library
              with confidence badges on every entry.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Photo OCR for bloodwork → AI interpretation in seconds',
                'Daily reminder to log your protocol; tap the notification to journal',
                'Multi-stage Opus AI runs draft → safety check → personalized output',
                'Reader-app sign-in: manage your subscription on the web, no Apple cut',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-neon-purple flex-shrink-0" />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 cursor-not-allowed">
                <svg className="w-7 h-7 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.50-3.74 4.25z" />
                </svg>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">Coming Soon to</div>
                  <div className="text-sm font-semibold text-foreground">App Store</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 cursor-not-allowed">
                <svg className="w-7 h-7 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.794-3.793 2.378 1.378a1 1 0 0 1 0 1.732l-2.378 1.378-2.553-2.244 2.553-2.244zM5.864 2.658 16.802 8.99l-2.302 2.302-8.636-8.634z" />
                </svg>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted">Coming Soon to</div>
                  <div className="text-sm font-semibold text-foreground">Google Play</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: phone mockup placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative flex items-center justify-center"
          >
            <div
              className="relative aspect-[9/19] w-full max-w-[320px] rounded-[3rem] border border-white/10 bg-gradient-to-br from-neon-cyan/10 via-neon-purple/10 to-neon-pink/5 p-1.5 shadow-[0_30px_80px_-20px_rgba(168,85,247,0.45)]"
            >
              <div className="h-full w-full rounded-[2.5rem] overflow-hidden bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mobile/hero-dashboard.webp"
                  alt="Peptide Atlas mobile app dashboard — streak, quick actions, and the Atlas explore menu"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
