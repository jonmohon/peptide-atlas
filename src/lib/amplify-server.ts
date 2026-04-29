/**
 * Creates the server-side Amplify context runner for Next.js App Router.
 * Use runWithAmplifyServerContext to call Amplify auth/data APIs in Server Components and Route Handlers.
 *
 * Also exposes createAuthRouteHandlers — the official Amplify Gen 2 + Next.js
 * pattern for OAuth. Wired in src/app/api/auth/[slug]/route.ts so the entire
 * OAuth flow (initiate + callback) runs server-side, which is the only
 * reliable way to complete OAuth under SSR token storage.
 */

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '../../amplify_outputs.json';

export const { runWithAmplifyServerContext, createAuthRouteHandlers } =
  createServerRunner({
    config: outputs,
  });
