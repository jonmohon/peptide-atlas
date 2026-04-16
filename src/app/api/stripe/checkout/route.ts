import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripe();

  const { plan, billing } = (await req.json()) as {
    plan: 'PRO' | 'PRO_PLUS';
    billing: 'monthly' | 'yearly';
  };

  const planConfig = PLANS[plan];
  if (!planConfig) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const priceId = billing === 'yearly' ? planConfig.priceYearly : planConfig.priceMonthly;

  // Create a Stripe customer for this user
  const customer = await stripe.customers.create({
    email: session.user.email,
    name: session.user.name ?? undefined,
    metadata: { userId: session.user.id },
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/atlas?upgraded=true`,
    cancel_url: `${req.nextUrl.origin}/pricing`,
    metadata: {
      userId: session.user.id,
      plan,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
