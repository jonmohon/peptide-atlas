import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { TIER_LIMITS, type Tier } from '@/types/user';

interface RateLimitResult {
  allowed: boolean;
  userId: string | null;
  tier: Tier;
  remaining: number;
  response?: NextResponse;
}

/**
 * Check AI rate limit for the current user.
 * Uses Amplify Data (DynamoDB) to track daily usage per endpoint.
 *
 * Note: This does a client-side import of the Amplify data client
 * to avoid importing it at module level (which would fail at build time).
 */
export async function checkAiRateLimit(endpoint: string): Promise<RateLimitResult> {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const tier: Tier = session?.user?.tier ?? 'FREE';
  const limit = TIER_LIMITS[tier].aiCallsPerDay;

  // Unlimited for paid tiers
  if (limit === Infinity) {
    return { allowed: true, userId, tier, remaining: Infinity };
  }

  // Anonymous users must sign in
  if (!userId) {
    return {
      allowed: false,
      userId: null,
      tier: 'FREE',
      remaining: 0,
      response: NextResponse.json(
        { error: 'Sign in to use AI features', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    };
  }

  // For now, use a simple in-memory approach for rate limiting
  // The full Amplify Data integration for usage tracking will be
  // handled client-side or via a dedicated API route
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `ai_usage:${userId}:${endpoint}:${today}`;

  // Use global cache for serverless function invocations
  const globalCache = globalThis as unknown as Record<string, number>;
  const currentCount = (globalCache[cacheKey] ?? 0) + 1;
  globalCache[cacheKey] = currentCount;

  if (currentCount > limit) {
    return {
      allowed: false,
      userId,
      tier,
      remaining: 0,
      response: NextResponse.json(
        {
          error: 'Daily AI limit reached. Upgrade to Pro for unlimited access.',
          code: 'RATE_LIMIT',
          limit,
          upgradeUrl: '/pricing',
        },
        { status: 429 }
      ),
    };
  }

  return { allowed: true, userId, tier, remaining: limit - currentCount };
}
