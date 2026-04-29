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
          (u.UserStatus === 'CONFIRMED' || u.UserStatus === 'EXTERNAL_PROVIDER') &&
          // skip the in-flight federated user we're about to create
          !u.Username?.startsWith('Google_'),
      ),
    );

    if (native?.Username) {
      // userName format from Cognito for federated users: "Google_<sub>"
      const [providerName, ...rest] = userName.split('_');
      const providerUserId = rest.join('_');
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
