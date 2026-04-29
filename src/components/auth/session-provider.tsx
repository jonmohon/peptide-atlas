'use client';

/**
 * Configures Amplify on the client side using amplify_outputs.json.
 * Must wrap the entire app so all Amplify calls (auth, data) are initialized before use.
 *
 * The `aws-amplify/auth/enable-oauth-listener` import is the side-effect module
 * that registers the OAuth callback handler. Without it, signInWithRedirect()
 * sets the inflight flag and redirects out, but the return trip from Cognito
 * with `?code=` is never auto-processed — Hub events never fire and tokens
 * never land. This is undocumented but confirmed by reading the SDK source.
 */

import { Amplify } from 'aws-amplify';
import 'aws-amplify/auth/enable-oauth-listener';
import outputs from '../../../amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
