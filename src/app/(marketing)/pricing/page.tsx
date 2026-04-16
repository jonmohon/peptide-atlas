/**
 * Pricing tiers page — renders the three-tier PricingCards grid with monthly/yearly
 * billing toggle, and a FAQ accordion below.
 */

import type { Metadata } from 'next';
import { PricingCards } from '@/components/pricing/pricing-cards';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Unlock premium peptide tools — reconstitution calculator, cycle planner, unlimited AI, and more.',
};

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Unlock the Full <span className="text-neon-cyan">PeptideAtlas</span>
        </h1>
        <p className="mt-3 text-text-secondary max-w-xl mx-auto">
          Free tools to explore. Premium tools to master your protocol.
        </p>
      </div>

      <PricingCards />

      {/* FAQ */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-foreground text-center mb-8">Common Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel anytime from your account. You keep access until the end of your billing period.',
            },
            {
              q: 'What happens to my saved data if I downgrade?',
              a: 'Your saved stacks and protocols remain in your account. You can view them but not create new ones on the free tier.',
            },
            {
              q: 'Do you sell peptides?',
              a: 'No. PeptideAtlas is an educational platform. We do not sell, distribute, or prescribe any peptides.',
            },
            {
              q: 'Is the AI advice medical advice?',
              a: 'No. All AI-generated content is educational only. Always consult a healthcare professional before starting any peptide protocol.',
            },
          ].map((item) => (
            <div key={item.q} className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
              <p className="text-sm text-text-secondary mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
