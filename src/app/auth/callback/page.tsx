'use client';

/**
 * Google OAuth landing page. Cognito redirects here with ?code= and ?state=
 * after federated sign-in. The OAuth listener registered in session-provider
 * (via the `aws-amplify/auth/enable-oauth-listener` side-effect import)
 * auto-processes the URL and writes Cognito tokens to cookies.
 *
 * This page just waits for the session to materialize — listening to the
 * Hub auth event AND polling fetchAuthSession as a belt-and-suspenders. Once
 * tokens are present we navigate to /atlas; on failure we show the error and
 * link back to /auth/signin.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const POLL_INTERVAL_MS = 200;
    const MAX_WAIT_MS = 12000;
    let elapsed = 0;

    const proceed = () => {
      if (cancelled) return;
      router.replace('/atlas');
    };

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect' || payload.event === 'signedIn') {
        proceed();
      } else if (payload.event === 'signInWithRedirect_failure') {
        const data = (payload as { data?: { error?: { message?: string } } }).data;
        if (!cancelled) {
          setError(data?.error?.message ?? 'Google sign-in failed. Please try again.');
        }
      }
    });

    const tick = async () => {
      if (cancelled) return;
      try {
        const session = await fetchAuthSession();
        if (session.tokens?.idToken || session.tokens?.accessToken) {
          proceed();
          return;
        }
      } catch {
        /* still pending */
      }
      elapsed += POLL_INTERVAL_MS;
      if (elapsed >= MAX_WAIT_MS) {
        if (!cancelled) {
          setError(
            'Sign-in took too long. Please try again, or sign in with email and password.'
          );
        }
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-bright w-full max-w-sm rounded-2xl p-8 text-center">
        <div className="text-neon-cyan font-bold text-lg">PeptideAtlas</div>
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-foreground mt-4">
              Couldn&rsquo;t complete sign-in
            </h1>
            <p className="text-sm text-text-secondary mt-2">{error}</p>
            <a
              href="/auth/signin"
              className="inline-block mt-6 px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold"
            >
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground mt-4">
              Signing you in&hellip;
            </h1>
            <p className="text-sm text-text-secondary mt-2">
              Just a moment while we finish setting up your session.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
