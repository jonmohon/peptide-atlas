/**
 * Email verification confirmation page shown after a magic-link or code is sent.
 * Static — just instructs the user to check their inbox.
 */

import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-bright w-full max-w-sm rounded-2xl p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground">Check your email</h1>
        <p className="text-sm text-text-secondary mt-2">
          A sign-in link has been sent to your email address. Click the link to sign in to PeptideAtlas.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 text-sm text-neon-cyan hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
