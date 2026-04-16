# Auth & Payments

AWS Cognito authentication and Stripe subscription billing.

**Related Documentation:**
- [Architecture](ARCHITECTURE.md) - System design
- [Database](database.md) - UserProfile and Subscription models

---

> Status: IMPLEMENTED — Last updated: 2026-04-14

## Overview

Authentication uses AWS Cognito via Amplify Gen 2. Payments use Stripe for subscription billing. The UserProfile model in DynamoDB tracks the user's subscription tier.

```
Sign Up/In → Cognito (email + password, Google OAuth planned)
     ↓
UserProfile created in DynamoDB (tier: FREE)
     ↓
Upgrade → Stripe Checkout → Webhook → Update UserProfile.tier
```

## Auth Flow

### Client-side
```typescript
import { signIn, signUp, getCurrentUser } from 'aws-amplify/auth';
```

### Server-side
```typescript
import { auth } from '@/lib/auth';
const session = await auth(); // Returns { user: { id, email, name, tier } } or null
```

Server-side uses `runWithAmplifyServerContext` with Next.js `cookies` to read the Cognito session from httpOnly cookies.

## Key Files

| File | Purpose |
|------|---------|
| `amplify/auth/resource.ts` | Cognito User Pool config |
| `src/lib/auth.ts` | Server-side `auth()` helper |
| `src/lib/amplify-config.ts` | Client config from amplify_outputs.json |
| `src/lib/amplify-server.ts` | Server context runner |
| `src/lib/stripe.ts` | Stripe client + plan config |
| `src/components/auth/sign-in-modal.tsx` | Sign in/up/confirm modal |
| `src/components/auth/user-menu.tsx` | User avatar dropdown |
| `src/components/auth/premium-gate.tsx` | Feature gating component |
| `src/types/user.ts` | Tier definitions + feature access matrix |

## Pricing Tiers

| | FREE | PRO ($12/mo) | PRO+ ($24/mo) |
|---|---|---|---|
| AI calls/day | 5 | Unlimited | Unlimited |
| Save stacks/protocols | — | Yes | Yes |
| Tools (calculator, planner) | — | Yes | Yes |
| Journal (full) | 7 days | Unlimited | Unlimited |
| Bloodwork + AI insights | — | — | Yes |

Full feature matrix in `src/types/user.ts` → `FEATURE_ACCESS` map.

## Gotchas

- **`auth()` returns tier: 'FREE' by default** — It reads from Cognito only. Actual tier comes from UserProfile in DynamoDB, fetched separately.
- **Stripe webhook can't write to DynamoDB directly** — Webhooks have no Cognito session. Tier updates from webhooks need API key auth mode or a Lambda function.
- **Google OAuth not yet configured** — The sign-in modal has a Google button but Cognito doesn't have a Google identity provider configured yet.

## See Also

- [Database](database.md) - UserProfile model
- [Journal](journal.md) - Tier-gated journal features
