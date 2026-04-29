import type { Metadata } from 'next';
import { faqItems } from '@/data/faq';
import { FAQAccordion } from '@/components/marketing/faq-accordion';

export const metadata: Metadata = {
  title: 'FAQ | PeptideAtlas',
  description:
    'Frequently asked questions about peptides, safety, legality, and how to use PeptideAtlas.',
};

export default function FAQPage() {
  const categories = Array.from(new Set(faqItems.map((f) => f.category)));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-white/50">
          Common questions about peptides, safety, and our platform.
        </p>
      </div>

      {/* Grouped FAQs */}
      <div className="space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-4 text-xl font-semibold text-[#00d4ff]">
              {category}
            </h2>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 sm:px-6">
              <FAQAccordion
                items={faqItems.filter((f) => f.category === category)}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
