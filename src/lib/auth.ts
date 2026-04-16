import { cookies } from 'next/headers';
import { runWithAmplifyServerContext } from './amplify-server';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth/server';
import type { Tier } from '@/types/user';

export interface ServerSession {
  user: {
    id: string;
    email: string;
    name?: string;
    tier: Tier;
  };
}

/**
 * Get the current authenticated user on the server side.
 * Returns null if not authenticated.
 */
export async function auth(): Promise<ServerSession | null> {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!currentUser?.userId) return null;

    return {
      user: {
        id: currentUser.userId,
        email: currentUser.signInDetails?.loginId ?? '',
        name: currentUser.username ?? undefined,
        // Tier is fetched separately from the UserProfile model when needed
        tier: 'FREE',
      },
    };
  } catch {
    return null;
  }
}

/**
 * Check if the current request has a valid auth session (lightweight).
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    return !!session?.tokens;
  } catch {
    return false;
  }
}
