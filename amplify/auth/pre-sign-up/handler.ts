/**
 * Cognito Pre-Sign-Up Lambda trigger.
 *
 * Two responsibilities:
 *
 * 1. **Account linking** — when a Google federated user signs up with an email
 *    that already exists as a native (email/password) Cognito user, link them
 *    via AdminLinkProviderForUser so they share one Cognito sub and one
 *    UserProfile/journal/etc. (`allow.owner()` data access). Without this,
 *    Cognito creates a separate user per identity provider, splitting their
 *    data.
 *
 * 2. **Auto-confirm federated users** — Google has already verified the email,
 *    so we set autoConfirmUser/autoVerifyEmail to true. Native sign-ups still
 *    go through the email-code verification flow.
 */

import {
  CognitoIdentityProviderClient,
  AdminLinkProviderForUserCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import type { PreSignUpTriggerHandler } from 'aws-lambda';

const cognito = new CognitoIdentityProviderClient({});

export const handler: PreSignUpTriggerHandler = async (event) => {
  const { triggerSource, userPoolId, userName } = event;
  const email = event.request.userAttributes.email;

  // Native sign-up: nothing to do, let it proceed normally
  if (triggerSource !== 'PreSignUp_ExternalProvider') {
    return event;
  }

  if (!email) return event;

  try {
    const list = await cognito.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Filter: `email = "${email}"`,
        Limit: 5,
      }),
    );

    const native = list.Users?.find((u) =>
      u.Attributes?.some(
        (attr) =>
          attr.Name === 'email' &&
          attr.Value === email &&
          u.UserStatus === 'CONFIRMED' &&
          // skip federated usernames; we want the CONFIRMED native user only
          !u.Username?.toLowerCase().startsWith('google_'),
      ),
    );

    if (native?.Username) {
      // userName format from Cognito for federated users: "<provider>_<sub>"
      // where <provider> is lowercased. The configured ProviderName in the
      // pool is the exact case (e.g. "Google"), so we map explicitly.
      const lowerPrefix = userName.split('_')[0]?.toLowerCase();
      const providerUserId = userName.slice(userName.indexOf('_') + 1);
      const providerNameMap: Record<string, string> = {
        google: 'Google',
        facebook: 'Facebook',
        amazon: 'LoginWithAmazon',
        signinwithapple: 'SignInWithApple',
      };
      const providerName = lowerPrefix ? providerNameMap[lowerPrefix] : undefined;
      if (providerName && providerUserId) {
        await cognito.send(
          new AdminLinkProviderForUserCommand({
            UserPoolId: userPoolId,
            DestinationUser: { ProviderName: 'Cognito', ProviderAttributeValue: native.Username },
            SourceUser: {
              ProviderName: providerName,
              ProviderAttributeName: 'Cognito_Subject',
              ProviderAttributeValue: providerUserId,
            },
          }),
        );
      }
    }
  } catch (err) {
    console.error('[pre-sign-up] account link attempt failed:', err);
  }

  // Auto-confirm federated users so they don't see the email-code prompt
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
