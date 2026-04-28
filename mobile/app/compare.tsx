/**
 * Compare — two-peptide side-by-side breakdown. Stub screen for the prototype;
 * full picker + comparison matrix lands in the next iteration.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';

export default function CompareScreen() {
  const router = useRouter();
  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Atlas</Text>
      </Pressable>

      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Tools</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Compare peptides</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Side-by-side breakdown of any two peptides — mechanism, dosing, evidence, side effects.
        </Text>
      </View>

      <GlassCard className="items-center p-8" bright>
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neon-purple/15">
          <Ionicons name="git-compare-outline" size={26} color="#a855f7" />
        </View>
        <Text className="mt-4 text-base font-semibold text-foreground">Coming next</Text>
        <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
          The web compare tool is live. Mobile picker + comparison matrix lands once we wire AI results
          into the same UI.
        </Text>
      </GlassCard>
    </Screen>
  );
}
