/**
 * Amplify Gen 2 backend entry point — composes the Cognito auth and AppSync data resources
 * into a single backend definition deployed to AWS (us-east-2).
 *
 * USER_PASSWORD_AUTH is enabled alongside the default SRP flow so the React Native
 * mobile app (Expo Go) can sign in without the native crypto module that Cognito
 * SRP requires. SRP stays available for the web app and future dev-client builds.
 */

import { defineBackend } from '@aws-amplify/backend';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { preSignUp } from './auth/pre-sign-up/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  preSignUp,
});

const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_USER_SRP_AUTH',
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_REFRESH_TOKEN_AUTH',
];

// Grant the pre-sign-up Lambda the IAM perms it needs to look up existing
// users by email and link a federated identity to a native account.
//
// Scope: arn:aws:cognito-idp:<region>:<account>:userpool/* — using the
// concrete user pool ARN here causes a CloudFormation circular dependency
// because the user pool also references the Lambda (as the preSignUp
// trigger). The wildcard is scoped to this AWS account and region, which
// for a single-stack project is effectively the same set of resources.
const stack = backend.auth.resources.userPool.stack;
backend.preSignUp.resources.lambda.role?.addToPrincipalPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['cognito-idp:ListUsers', 'cognito-idp:AdminLinkProviderForUser'],
    resources: [`arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/*`],
  }),
);
