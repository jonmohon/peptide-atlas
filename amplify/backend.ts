/**
 * Amplify Gen 2 backend entry point — composes the Cognito auth and AppSync data resources
 * into a single backend definition deployed to AWS (us-east-2).
 *
 * USER_PASSWORD_AUTH is enabled alongside the default SRP flow so the React Native
 * mobile app (Expo Go) can sign in without the native crypto module that Cognito
 * SRP requires. SRP stays available for the web app and future dev-client builds.
 */

import { defineBackend } from '@aws-amplify/backend';
import { CfnUserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
});

const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_USER_SRP_AUTH',
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_REFRESH_TOKEN_AUTH',
];

// Cognito Hosted UI domain — used by the Google OAuth redirect flow.
// Provisions https://peptide-atlas-auth.auth.us-east-2.amazoncognito.com
// which Cognito uses as the /oauth2/idpresponse endpoint configured in Google.
const { userPool } = backend.auth.resources;
new CfnUserPoolDomain(userPool.stack, 'PeptideAtlasAuthDomain', {
  domain: 'peptide-atlas-auth',
  userPoolId: userPool.userPoolId,
});
