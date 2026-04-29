/**
 * Amplify Gen 2 Cognito User Pool configuration — email login with code-based verification,
 * optional Google OAuth, optional TOTP MFA, email-only account recovery.
 *
 * Google OAuth: set secrets GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET via
 *   `npx ampx secret set GOOGLE_CLIENT_ID` / `npx ampx secret set GOOGLE_CLIENT_SECRET`
 * Create the OAuth client at https://console.cloud.google.com/apis/credentials with:
 *   - Authorized JS origins: your app origins (http://localhost:3000, https://your-domain)
 *   - Authorized redirect URIs: the Cognito Hosted UI callback printed after deploy
 *     (usually https://<your-cognito-domain>/oauth2/idpresponse)
 * Also set callbackUrls/logoutUrls below to match your deployed frontend origins.
 */

import { defineAuth, secret } from '@aws-amplify/backend';
import { preSignUp } from './pre-sign-up/resource';

const googleClientId = process.env.GOOGLE_OAUTH_ENABLED === 'true' ? secret('GOOGLE_CLIENT_ID') : undefined;
const googleClientSecret = process.env.GOOGLE_OAUTH_ENABLED === 'true' ? secret('GOOGLE_CLIENT_SECRET') : undefined;

export const auth = defineAuth({
  triggers: {
    // Links Google federated identities to existing email/password users when
    // the email matches; auto-confirms federated users. See pre-sign-up/handler.ts.
    preSignUp,
  },
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'PeptideAtlas - Verify your email',
      verificationEmailBody: (code) =>
        `Welcome to PeptideAtlas! Your verification code is: ${code()}`,
    },
    ...(googleClientId && googleClientSecret
      ? {
          externalProviders: {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
              scopes: ['email', 'profile', 'openid'],
              attributeMapping: {
                email: 'email',
                fullname: 'name',
              },
            },
            // Cognito Hosted UI prefix — produces
            // https://peptide-atlas-auth.auth.us-east-2.amazoncognito.com
            // which is the redirect URI configured in the Google OAuth client.
            // Runtime supports this (auth-construct reads it directly), but
            // @aws-amplify/backend's type definition omits the field.
            // @ts-expect-error - domainPrefix supported by underlying construct
            domainPrefix: 'peptide-atlas-auth',
            // Client-side OAuth callback page. The OAuth listener in
            // session-provider auto-processes the ?code= and writes tokens
            // to CookieStorage (the same store email/password sign-in uses),
            // so server-side auth gates and client-side AppSync calls both
            // see the same session.
            callbackUrls: [
              'http://localhost:3000/auth/callback',
              'https://peptideatlas.ai/auth/callback',
            ],
            logoutUrls: [
              'http://localhost:3000/',
              'https://peptideatlas.ai/',
            ],
          },
        }
      : {}),
  },
  userAttributes: {
    email: { required: true },
    preferredUsername: { required: false },
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: { mode: 'OPTIONAL', totp: true },
});
