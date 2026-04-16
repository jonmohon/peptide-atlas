/**
 * Lazy Stripe client singleton (initialized on first call) and PLANS config
 * mapping PRO/PRO_PLUS tiers to their Stripe Price IDs and amounts.
 */

import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const PLANS = {
  PRO: {
    name: 'Pro',
    priceMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    priceYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? '',
    amount: { monthly: 12, yearly: 96 },
  },
  PRO_PLUS: {
    name: 'Pro+',
    priceMonthly: process.env.STRIPE_PRO_PLUS_MONTHLY_PRICE_ID ?? '',
    priceYearly: process.env.STRIPE_PRO_PLUS_YEARLY_PRICE_ID ?? '',
    amount: { monthly: 24, yearly: 192 },
  },
} as const;
