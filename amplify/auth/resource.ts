/**
 * Amplify Gen 2 Cognito User Pool configuration — email login with code-based verification,
 * optional TOTP MFA, and email-only account recovery.
 */

import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'PeptideAtlas - Verify your email',
      verificationEmailBody: (code) =>
        `Welcome to PeptideAtlas! Your verification code is: ${code()}`,
    },
  },
  userAttributes: {
    email: { required: true },
    preferredUsername: { required: false },
  },
  accountRecovery: 'EMAIL_ONLY',
  multifactor: { mode: 'OPTIONAL', totp: true },
});
