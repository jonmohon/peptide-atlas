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

const googleClientId = process.env.GOOGLE_OAUTH_ENABLED === 'true' ? secret('GOOGLE_CLIENT_ID') : undefined;
const googleClientSecret = process.env.GOOGLE_OAUTH_ENABLED === 'true' ? secret('GOOGLE_CLIENT_SECRET') : undefined;

export const auth = defineAuth({
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
            callbackUrls: [
              'http://localhost:3000/atlas',
              'https://peptide-atlas.app/atlas',
            ],
            logoutUrls: ['http://localhost:3000/', 'https://peptide-atlas.app/'],
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
