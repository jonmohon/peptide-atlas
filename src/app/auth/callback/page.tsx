'use client';

/**
 * OAuth callback handler. Cognito Hosted UI redirects here with `?code=` and
 * `?state=` after federated sign-in. Amplify auto-processes the code on
 * `Amplify.configure()` — but that often completes BEFORE this React tree
 * hydrates, so we can't rely on the Hub event alone (it may have already
 * fired and we missed it).
 *
 * Instead: poll `fetchAuthSession({ forceRefresh: false })` up to 10 seconds.
 * Once it returns tokens, the OAuth flow is complete and we navigate to /atlas.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let elapsed = 0;
    const POLL_INTERVAL_MS = 200;
    const MAX_WAIT_MS = 10000;

    const tick = async () => {
      if (cancelled) return;

      try {
        const session = await fetchAuthSession();
        const hasTokens = !!session.tokens?.idToken || !!session.tokens?.accessToken;
        if (hasTokens) {
          if (!cancelled) router.replace('/atlas');
          return;
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'OAuth processing failed');
        }
        return;
      }

      elapsed += POLL_INTERVAL_MS;
      if (elapsed >= MAX_WAIT_MS) {
        if (!cancelled) {
          setError(
            'Sign-in is taking longer than expected. Please try again or sign in with email.'
          );
        }
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
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
