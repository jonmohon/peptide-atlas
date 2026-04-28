/**
 * Amplify configuration for React Native.
 *
 * Uses the same amplify_outputs.json as the web app — both clients hit the
 * same Cognito User Pool and AppSync/DynamoDB backend. AsyncStorage is the
 * RN-equivalent of localStorage for token persistence between app launches.
 */

import '@aws-amplify/react-native';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import AsyncStorage from '@react-native-async-storage/async-storage';

import outputs from '../amplify_outputs.json';

let configured = false;

export function configureAmplify() {
  if (configured) return;
  Amplify.configure(outputs);
  cognitoUserPoolsTokenProvider.setKeyValueStorage(AsyncStorage);
  configured = true;
}

/**
 * Get the current Cognito ID token (JWT). Returns null if there's no session.
 * Used to authorize calls to the web's AI streaming endpoints.
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}
