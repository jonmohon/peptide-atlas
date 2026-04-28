/**
 * Root layout — installs the Amplify config + auth provider, picks dark theme,
 * and renders a Stack that hosts both the (tabs) navigator and the (auth) stack.
 *
 * Order matters: '@aws-amplify/react-native' must be the FIRST import so its
 * crypto/randomBytes polyfills are registered before Cognito's SRP code runs.
 * configureAmplify() then runs synchronously so the SDK is ready before any
 * sign-in attempt instead of waiting on a useEffect tick.
 */

import '@aws-amplify/react-native';
import 'react-native-get-random-values';
import { configureAmplify } from '@/lib/amplify';
configureAmplify();

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import '../global.css';
import { AuthProvider } from '@/lib/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    // When the user taps a notification, route them to the journal log form.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { route?: string } | undefined;
      const target = data?.route ?? '/log-entry';
      router.push(target as never);
    });
    return () => sub.remove();
  }, [router]);

  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a0a' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="peptides" />
          <Stack.Screen name="body-map" />
          <Stack.Screen name="compare" />
          <Stack.Screen name="protocol" />
          <Stack.Screen name="effects" />
          <Stack.Screen name="reconstitution" />
          <Stack.Screen name="notes" />
          <Stack.Screen name="saved-stacks" />
          <Stack.Screen name="bloodwork" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="medical-disclaimer" />
          <Stack.Screen name="reminders" />
          <Stack.Screen name="profile-edit" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log-entry" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AuthProvider>
  );
}
