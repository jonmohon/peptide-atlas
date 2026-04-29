'use client';

/**
 * OAuth callback handler — diagnostic mode.
 *
 * Listens to every Cognito Hub auth event, polls fetchAuthSession, and
 * surfaces every error / state transition both to the on-screen log and
 * the browser console so we can see exactly where OAuth is failing.
 *
 * Once we have a clean signal of which step breaks, this can be slimmed
 * back down to a non-diagnostic version.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

interface LogEntry {
  t: number;
  level: 'info' | 'warn' | 'error';
  msg: string;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    let elapsed = 0;
    const POLL_INTERVAL_MS = 250;
    const MAX_WAIT_MS = 15000;

    const log = (level: LogEntry['level'], msg: string) => {
      const entry = { t: Date.now() - startedAt.current, level, msg };
      // Mirror to console for DevTools

      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
        `[oauth-callback +${entry.t}ms] ${msg}`
      );
      if (!cancelled) setLogs((prev) => [...prev, entry]);
    };

    // 1. Capture URL params first — if no ?code=, we got here without OAuth flow
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const code = params?.get('code') ?? null;
    const state = params?.get('state') ?? null;
    const oauthError = params?.get('error') ?? null;
    const errorDescription = params?.get('error_description') ?? null;

    log('info', `URL: ${url}`);
    log('info', `code=${code ? code.slice(0, 8) + '…' : '(none)'} state=${state ? state.slice(0, 8) + '…' : '(none)'}`);

    if (oauthError) {
      log('error', `Cognito returned error: ${oauthError} — ${errorDescription ?? '(no description)'}`);
    }
    if (!code && !oauthError) {
      log(
        'warn',
        'No ?code= param and no ?error= — page was loaded directly. If you\'re testing, click the Google button on /auth/signin.'
      );
    }

    // 2. Hub listener for every auth event
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;
      if (event.includes('failure')) {
        const data = (payload as { data?: unknown }).data;
        log('error', `Hub event: ${event} — ${JSON.stringify(data)}`);
      } else {
        log('info', `Hub event: ${event}`);
      }
      if (event === 'signInWithRedirect' || event === 'signedIn') {
        if (!cancelled) {
          setDone(true);
          router.replace('/atlas');
        }
      }
    });

    // 3. Poll for tokens — covers the case where Hub event fired before listener attached
    const tick = async () => {
      if (cancelled) return;
      try {
        const session = await fetchAuthSession();
        const idTok = session.tokens?.idToken?.toString();
        const accTok = session.tokens?.accessToken?.toString();
        if (idTok || accTok) {
          log('info', `fetchAuthSession returned tokens (id=${!!idTok}, access=${!!accTok})`);
          if (!cancelled) {
            setDone(true);
            router.replace('/atlas');
          }
          return;
        }
      } catch (err: unknown) {
        log('error', `fetchAuthSession threw: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Also try getCurrentUser, which can sometimes complete what fetchAuthSession can't
      try {
        const user = await getCurrentUser();
        log('info', `getCurrentUser returned: ${user.username}`);
        if (!cancelled) {
          setDone(true);
          router.replace('/atlas');
        }
        return;
      } catch (err: unknown) {
        // expected while OAuth is still processing — log only every few seconds
        if (elapsed % 2000 < POLL_INTERVAL_MS) {
          log('info', `getCurrentUser pending: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      elapsed += POLL_INTERVAL_MS;
      if (elapsed >= MAX_WAIT_MS) {
        log('error', `Timed out after ${MAX_WAIT_MS}ms with no tokens`);
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="glass-bright w-full max-w-2xl rounded-2xl p-8">
        <div className="text-center">
          <div className="text-neon-cyan font-bold text-lg">PeptideAtlas</div>
          <h1 className="text-xl font-semibold text-foreground mt-4">
            {done ? 'Signed in — redirecting…' : 'Signing you in…'}
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            {done
              ? 'You should land on your dashboard in a moment.'
              : 'If this takes more than 10 seconds, check the diagnostic log below.'}
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-black/40 border border-white/[0.08] p-4 max-h-96 overflow-auto font-mono text-[11px] leading-relaxed">
          {logs.length === 0 ? (
            <p className="text-text-secondary">Waiting for events…</p>
          ) : (
            logs.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.level === 'error'
                    ? 'text-red-400'
                    : entry.level === 'warn'
                    ? 'text-yellow-400'
                    : 'text-text-secondary'
                }
              >
                <span className="text-text-muted">+{entry.t}ms</span> {entry.msg}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <a
            href="/auth/signin"
            className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.10] text-sm text-foreground"
          >
            Back to sign in
          </a>
          <a
            href="/atlas"
            className="px-4 py-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm text-neon-cyan"
          >
            Try /atlas anyway
          </a>
        </div>
      </div>
    </div>
  );
}
