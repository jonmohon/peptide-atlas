'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  tier: 'FREE' | 'PRO' | 'PRO_PLUS';
  price: { monthly: number; yearly: number };
  description: string;
  features: PlanFeature[];
  highlight?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    tier: 'FREE',
    price: { monthly: 0, yearly: 0 },
    description: 'Explore the atlas and learn about peptides',
    features: [
      { text: 'Full peptide database & body map', included: true },
      { text: 'Effects explorer & pre-built stacks', included: true },
      { text: 'Blog, glossary, FAQ', included: true },
      { text: '5 AI interactions per day', included: true },
      { text: 'Save stacks & protocols', included: false },
      { text: 'Reconstitution calculator', included: false },
      { text: 'Cycle planner', included: false },
      { text: 'Unlimited AI', included: false },
    ],
  },
  {
    name: 'Pro',
    tier: 'PRO',
    price: { monthly: 12, yearly: 96 },
    description: 'Practical tools for serious peptide users',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited AI interactions', included: true },
      { text: 'Reconstitution calculator', included: true },
      { text: 'Cycle planner & dosing schedule', included: true },
      { text: 'Save stacks & protocols', included: true },
      { text: 'AI comparison insights', included: true },
      { text: 'Advanced mechanism explainer', included: true },
      { text: 'Bloodwork tracker', included: false },
    ],
  },
  {
    name: 'Pro+',
    tier: 'PRO_PLUS',
    price: { monthly: 24, yearly: 192 },
    description: 'Everything plus community & advanced analytics',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Bloodwork tracker with AI insights', included: true },
      { text: 'AI research digest', included: true },
      { text: 'Community protocol publishing', included: true },
      { text: 'Progress journals with AI summaries', included: true },
      { text: 'Priority AI responses', included: true },
      { text: 'Vendor directory with price alerts', included: true },
      { text: 'Early access to new features', included: true },
    ],
  },
];

export function PricingCards() {
  const [billing, setBilling] = useState<BillingCycle>('yearly');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsSignedIn(true))
      .catch(() => setIsSignedIn(false));
  }, []);

  const handleSubscribe = async (tier: 'PRO' | 'PRO_PLUS') => {
    if (!isSignedIn) {
      window.location.href = '/auth/signin';
      return;
    }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: tier, billing }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setBilling('monthly')}
          className={cn(
            'px-4 py-2 text-sm rounded-full transition-all',
            billing === 'monthly'
              ? 'bg-white/[0.1] text-foreground'
              : 'text-text-secondary hover:text-foreground'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling('yearly')}
          className={cn(
            'px-4 py-2 text-sm rounded-full transition-all',
            billing === 'yearly'
              ? 'bg-white/[0.1] text-foreground'
              : 'text-text-secondary hover:text-foreground'
          )}
        >
          Yearly
          <span className="ml-1.5 text-xs text-neon-green font-medium">Save 33%</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = billing === 'yearly'
            ? Math.round(plan.price.yearly / 12)
            : plan.price.monthly;

          return (
            <div
              key={plan.tier}
              className={cn(
                'relative rounded-2xl p-6 flex flex-col',
                plan.highlight
                  ? 'glass-bright border-2 border-neon-cyan/30 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                  : 'glass border border-white/[0.06]'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 text-xs font-medium text-neon-cyan">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{plan.description}</p>

              <div className="mt-4 mb-6">
                {price === 0 ? (
                  <span className="text-3xl font-bold text-foreground">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">${price}</span>
                    <span className="text-sm text-text-secondary">/mo</span>
                    {billing === 'yearly' && (
                      <div className="text-xs text-text-secondary mt-0.5">
                        ${plan.price.yearly}/year billed annually
                      </div>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-2 text-sm">
                    {feature.included ? (
                      <svg className="w-4 h-4 mt-0.5 text-neon-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mt-0.5 text-white/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={feature.included ? 'text-text-secondary' : 'text-white/30'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.tier === 'FREE' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/[0.05] text-text-secondary border border-white/[0.06] cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.tier as 'PRO' | 'PRO_PLUS')}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
                      plan.highlight
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                        : 'bg-white/[0.08] text-foreground border border-white/[0.1] hover:bg-white/[0.12]'
                    )}
                  >
                    Get {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
