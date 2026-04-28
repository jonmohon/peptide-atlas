/**
 * Protocol generator — AI-built protocol from goals + journal data.
 * Stub for prototype; streams from /api/ai/protocol once Bearer-token auth
 * is added to the web routes.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';

export default function ProtocolScreen() {
  const router = useRouter();
  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Atlas</Text>
      </Pressable>

      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">AI</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Protocol generator</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Tell us your goal, current health, and experience — Claude builds an evidence-aware protocol
          for you.
        </Text>
      </View>

      <GlassCard className="items-center p-8" bright>
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neon-orange/15">
          <Ionicons name="construct-outline" size={26} color="#f97316" />
        </View>
        <Text className="mt-4 text-base font-semibold text-foreground">Wiring in progress</Text>
        <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
          The protocol generator runs on the web. Mobile streaming connects to /api/ai/protocol once we
          add Bearer-token auth alongside the existing cookie session.
        </Text>
      </GlassCard>
    </Screen>
  );
}
