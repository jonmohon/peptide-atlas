/**
 * Creates the server-side Amplify context runner for Next.js App Router.
 * Use runWithAmplifyServerContext to call Amplify auth/data APIs in Server Components and Route Handlers.
 */

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '../../amplify_outputs.json';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});
