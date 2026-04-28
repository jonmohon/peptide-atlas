/**
 * Auth context: tracks the current Cognito user across the app.
 *
 * Exposes signIn / signOut helpers and a `user` value. On mount, restores
 * any persisted session by calling getCurrentUser(); the result is cached
 * so route guards can branch synchronously on subsequent renders.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  getCurrentUser,
} from 'aws-amplify/auth';

import { configureAmplify } from './amplify';
import { fetchUserProfile, type UserProfileRow } from './amplify-data';

export type AuthUser = {
  userId: string;
  username: string;
  email: string;
};

export type Tier = 'FREE' | 'PRO' | 'PRO_PLUS';

type AuthContextValue = {
  user: AuthUser | null;
  profile: UserProfileRow | null;
  tier: Tier;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ requiresConfirmation: boolean }>;
  confirmSignUp: (email: string, code: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser({
        userId: current.userId,
        username: current.username,
        email: current.signInDetails?.loginId ?? current.username,
      });
      // Load tier + profile from DynamoDB. Failure is non-fatal — we degrade
      // to FREE silently so the rest of the app stays usable.
      try {
        const p = await fetchUserProfile();
        setProfile(p);
      } catch {
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    configureAmplify();
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      // USER_PASSWORD_AUTH avoids Cognito SRP, which needs a native crypto module
      // from @aws-amplify/react-native that Expo Go can't link. Switch to SRP once
      // we move to a dev-client build.
      const result = await amplifySignIn({
        username: email,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });
      if (!result.isSignedIn) {
        throw new Error(`Additional step required: ${result.nextStep.signInStep}`);
      }
      await refresh();
    },
    [refresh]
  );

  const signUp = useCallback<AuthContextValue['signUp']>(async (email, password) => {
    const result = await amplifySignUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    });
    return { requiresConfirmation: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP' };
  }, []);

  const confirmSignUp = useCallback<AuthContextValue['confirmSignUp']>(
    async (email, code, password) => {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code });
      await amplifySignIn({
        username: email,
        password,
        options: { authFlowType: 'USER_PASSWORD_AUTH' },
      });
      await refresh();
    },
    [refresh]
  );

  const signOut = useCallback<AuthContextValue['signOut']>(async () => {
    await amplifySignOut();
    setUser(null);
    setProfile(null);
  }, []);

  const tier: Tier =
    profile?.tier === 'PRO' || profile?.tier === 'PRO_PLUS' ? profile.tier : 'FREE';

  return (
    <AuthContext.Provider
      value={{ user, profile, tier, loading, signIn, signUp, confirmSignUp, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
