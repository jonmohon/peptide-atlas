/**
 * Amplify Gen 2 OAuth route handlers. Handles:
 *   GET /api/auth/sign-in?provider=google      → initiate Google OAuth
 *   GET /api/auth/sign-in-callback             → exchange ?code= for tokens
 *   GET /api/auth/sign-out                     → initiate Cognito sign-out
 *   GET /api/auth/sign-out-callback            → finalize sign-out
 *
 * All four run server-side, so PKCE verifier + state cookies stay HTTPOnly,
 * and tokens land in cookies that the SSR auth gate (isAuthenticated) and
 * client-side Amplify (configure with ssr:true) both read.
 *
 * On successful sign-in, redirect to /atlas. On sign-out, redirect home.
 */

import { createAuthRouteHandlers } from '@/lib/amplify-server';

export const GET = createAuthRouteHandlers({
  redirectOnSignInComplete: '/atlas',
  redirectOnSignOutComplete: '/',
});
