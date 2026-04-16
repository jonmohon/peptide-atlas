/**
 * Stripe webhook handler — verifies the event signature and processes
 * checkout.session.completed and customer.subscription.deleted events.
 * Full tier update integration with Amplify Data is pending (see TODO comments inside).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Stripe webhook events are processed here.
  // User tier updates will be handled via Amplify Data
  // once the Stripe subscription is confirmed.
  //
  // For now, log the event type. Full integration with
  // Amplify Data for tier updates requires an API key auth mode
  // or a Lambda function to write to the UserProfile model
  // (since webhooks don't have a Cognito user session).
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        // TODO: Update UserProfile tier via Amplify Data with API key auth
        // or via a Lambda function triggered by this webhook
        console.log(`User ${userId} upgraded to ${plan}`);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      console.log(`Subscription canceled for customer ${customerId}`);
      // TODO: Downgrade user tier to FREE
      break;
    }
  }

  return NextResponse.json({ received: true });
}
