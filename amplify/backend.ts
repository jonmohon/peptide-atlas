/**
 * Amplify Gen 2 backend entry point — composes the Cognito auth and AppSync data resources
 * into a single backend definition deployed to AWS (us-east-2).
 */

import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

defineBackend({
  auth,
  data,
  storage,
});
