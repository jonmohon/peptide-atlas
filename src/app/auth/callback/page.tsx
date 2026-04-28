'use client';

/**
 * OAuth callback handler. Cognito Hosted UI redirects here after federated
 * sign-in (Google). Amplify's auth library auto-detects the ?code= param on
 * load, exchanges it for tokens, and emits a Hub event when done. We then
 * navigate to /atlas (or back to the page the user was originally trying to
 * visit, preserved in localStorage).
 *
 * This page lives in /auth, not /atlas, so the server-side auth gate doesn't
 * pre-empt Amplify's client-side OAuth processing.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const proceed = (path: string) => {
      if (cancelled) return;
      router.replace(path);
    };

    // If Amplify has already finished processing (cached session, fast paths),
    // we can skip waiting for the Hub event.
    getCurrentUser()
      .then(() => proceed('/atlas'))
      .catch(() => {
        /* still pending — Hub listener below will handle */
      });

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
        case 'signedIn':
          proceed('/atlas');
          break;
        case 'signInWithRedirect_failure':
          proceed('/auth/signin?error=oauth');
          break;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-bright w-full max-w-sm rounded-2xl p-8 text-center">
        <div className="text-neon-cyan font-bold text-lg">PeptideAtlas</div>
        <h1 className="text-xl font-semibold text-foreground mt-4">
          Signing you in&hellip;
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          Just a moment while we finish setting up your session.
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
        </div>
      </div>
    </div>
  );
}
