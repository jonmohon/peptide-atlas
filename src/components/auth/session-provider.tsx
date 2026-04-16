'use client';

/**
 * Configures Amplify on the client side using amplify_outputs.json.
 * Must wrap the entire app so all Amplify calls (auth, data) are initialized before use.
 */

import { Amplify } from 'aws-amplify';
import outputs from '../../../amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
