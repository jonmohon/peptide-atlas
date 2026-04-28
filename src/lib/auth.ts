/**
 * Server-side Cognito auth helpers.
 *
 * auth(req?) resolves the current user via two paths in order:
 *   1. Authorization: Bearer <idToken> header — used by the React Native app
 *      where cookie-based sessions don't apply. The token is verified against
 *      the Cognito User Pool's JWKS via aws-jwt-verify (signature, expiry,
 *      audience, issuer).
 *   2. Cookie session — the existing browser path via Amplify's server adapter.
 *
 * Tier defaults to FREE; callers fetch the real tier from UserProfile when needed.
 */

import { cookies } from 'next/headers';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { runWithAmplifyServerContext } from './amplify-server';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth/server';
import outputs from '../../amplify_outputs.json';
import type { Tier } from '@/types/user';

export interface ServerSession {
  user: {
    id: string;
    email: string;
    name?: string;
    tier: Tier;
  };
}

const idVerifier = CognitoJwtVerifier.create({
  userPoolId: outputs.auth.user_pool_id,
  tokenUse: 'id',
  clientId: outputs.auth.user_pool_client_id,
});

async function authFromBearer(req: Request): Promise<ServerSession | null> {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const token = match[1].trim();
  if (!token) return null;
  try {
    const payload = await idVerifier.verify(token);
    const sub = payload.sub;
    const email = typeof payload.email === 'string' ? payload.email : '';
    const name =
      typeof payload['cognito:username'] === 'string'
        ? (payload['cognito:username'] as string)
        : undefined;
    return {
      user: { id: sub, email, name, tier: 'FREE' },
    };
  } catch {
    return null;
  }
}

async function authFromCookies(): Promise<ServerSession | null> {
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
        tier: 'FREE',
      },
    };
  } catch {
    return null;
  }
}

/**
 * Get the current authenticated user. Prefers a Bearer token on the request
 * (mobile flow); falls back to the cookie session (web flow).
 */
export async function auth(req?: Request): Promise<ServerSession | null> {
  if (req) {
    const fromBearer = await authFromBearer(req);
    if (fromBearer) return fromBearer;
  }
  return authFromCookies();
}

/**
 * Lightweight session check. Cookie-only — used by middleware-style code paths
 * that don't have access to the Request object.
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
