/**
 * Sign-in screen. Email + password against Cognito. Surfaces a friendly
 * "no account? sign up" message when Cognito returns UserNotFoundException.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasButton } from '@/components/atlas-button';
import { useAuth } from '@/lib/auth-context';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      // Verbosely dump the error so "Unknown" wrappers reveal their cause in
      // Metro logs (network failures and crypto polyfill misses both surface
      // here as Amplify Auth "Unknown" without an explicit Cognito error name).
      const e = err as {
        name?: string;
        message?: string;
        underlyingError?: { name?: string; message?: string };
        recoverySuggestion?: string;
        stack?: string;
      };
      console.warn('[sign-in] name=', e.name, '| message=', e.message);
      console.warn('[sign-in] underlying name=', e.underlyingError?.name, '| msg=', e.underlyingError?.message);
      console.warn('[sign-in] recovery=', e.recoverySuggestion);
      console.warn('[sign-in] stack=', e.stack?.split('\n').slice(0, 8).join('\n'));
      const msg = e.message ?? 'Sign in failed';
      if (msg.includes('User does not exist') || e.name === 'UserNotFoundException') {
        setError('No account for that email. Want to create one?');
      } else if (
        msg.toLowerCase().includes('incorrect') ||
        e.name === 'NotAuthorizedException'
      ) {
        setError('Incorrect email or password.');
      } else if (e.name === 'UserNotConfirmedException') {
        setError('Confirm your email first — check your inbox for the code.');
      } else {
        setError(`${e.name ?? 'Error'}: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 px-6 pt-12"
      >
        <View className="mb-8 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/20">
            <Ionicons name="flask" size={18} color="#06b6d4" />
          </View>
          <Text className="text-base font-bold text-foreground">Peptide Atlas</Text>
        </View>

        <Text className="text-3xl font-bold text-foreground">Sign in</Text>
        <Text className="mt-2 text-sm text-text-secondary">
          New here?{' '}
          <Link href="/(auth)/sign-up" className="font-semibold text-neon-cyan">
            Create an account
          </Link>
        </Text>

        {error && (
          <View className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
            <Text className="text-xs text-red-400">{error}</Text>
          </View>
        )}

        <View className="mt-6">
          <Text className="mb-1.5 text-xs font-medium text-text-secondary">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#737373"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-foreground"
          />
        </View>

        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-medium text-text-secondary">Password</Text>
          <View className="flex-row items-center rounded-xl border border-white/10 bg-white/[0.04] pr-2">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              placeholder="At least 8 characters"
              placeholderTextColor="#737373"
              className="flex-1 px-4 py-3.5 text-sm text-foreground"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} className="p-2 active:opacity-60">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#a3a3a3" />
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <AtlasButton label="Sign in" loading={loading} onPress={handleSubmit} />
        </View>

        <Text className="mt-6 text-center text-[11px] leading-relaxed text-text-secondary">
          By signing in you agree to the Terms and Privacy Policy.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
