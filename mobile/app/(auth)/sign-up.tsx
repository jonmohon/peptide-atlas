/**
 * Sign-up screen — Cognito signUp + confirmSignUp two-step. After CONFIRM_SIGN_UP
 * the screen swaps to a code-entry view, then auto-signs the user in on success.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AtlasButton } from '@/components/atlas-button';
import { useAuth } from '@/lib/auth-context';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, confirmSignUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'signUp' | 'confirm'>('signUp');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password);
      if (result.requiresConfirmation) {
        setStep('confirm');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp(email.trim(), code.trim(), password);
      router.replace('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
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

        {step === 'signUp' ? (
          <>
            <Text className="text-3xl font-bold text-foreground">Create account</Text>
            <Text className="mt-2 text-sm text-text-secondary">
              Already have one?{' '}
              <Link href="/(auth)/sign-in" className="font-semibold text-neon-cyan">
                Sign in
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
                  autoComplete="new-password"
                  placeholder="At least 8 characters, mixed case + number"
                  placeholderTextColor="#737373"
                  className="flex-1 px-4 py-3.5 text-sm text-foreground"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} className="p-2 active:opacity-60">
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#a3a3a3" />
                </Pressable>
              </View>
            </View>

            <View className="mt-6">
              <AtlasButton label="Create account" loading={loading} onPress={handleSignUp} />
            </View>
          </>
        ) : (
          <>
            <Text className="text-3xl font-bold text-foreground">Verify email</Text>
            <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
              We sent a 6-digit code to {email}.
            </Text>

            {error && (
              <View className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
                <Text className="text-xs text-red-400">{error}</Text>
              </View>
            )}

            <View className="mt-6">
              <Text className="mb-1.5 text-xs font-medium text-text-secondary">Confirmation code</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="123456"
                placeholderTextColor="#737373"
                maxLength={6}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-center text-xl tracking-[0.5em] text-foreground"
              />
            </View>

            <View className="mt-6">
              <AtlasButton label="Verify and sign in" loading={loading} onPress={handleConfirm} />
            </View>
          </>
        )}

        <Text className="mt-6 text-center text-[11px] leading-relaxed text-text-secondary">
          Educational use only. Not medical advice.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
