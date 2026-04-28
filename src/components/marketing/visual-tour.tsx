'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PageContainer } from '@/components/marketing/page-container';
import { SectionHeading } from '@/components/marketing/section-heading';

const tour = [
  {
    title: 'Multi-stage AI pipeline',
    blurb:
      'Every protocol passes through Draft → Critique → Personalize. The critique stage catches contraindications before you see the answer.',
    image: '/features/ai-pipeline.webp',
    alt: 'Three glowing stages — Draft, Critique, Personalize — connected by neon particle streams',
  },
  {
    title: 'Verified citations',
    blurb:
      'Every claim links back to a real PubMed paper. PMIDs are auto-verified against NCBI; fabricated ones are removed from the catalog.',
    image: '/features/verified-citations.webp',
    alt: 'Glowing green checkmark seal on a stack of translucent scientific papers with PMID badges',
  },
  {
    title: 'Anatomical body map',
    blurb:
      '13 body regions — heart, gut, joints, brain, muscles. Tap any region to see which peptides target it and how strongly.',
    image: '/features/body-map.webp',
    alt: 'Holographic anatomical body figure with 13 regions glowing in different neon colors',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: 'easeOut' as const },
  }),
};

export function VisualTour() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.05) 0%, transparent 70%)',
      }}
    >
      <PageContainer>
        <SectionHeading
          eyebrow="A visual tour"
          heading="Built like a research lab, not a wiki"
          subheading="Every surface in Atlas is grounded in evidence — and designed to make that evidence visible."
        />

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tour.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all hover:border-neon-cyan/25 hover:shadow-[0_0_30px_-10px_rgba(0,212,255,0.25)]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.blurb}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
