/**
 * Stacks browse — curated peptide combinations grouped by goal.
 * Tapping a stack opens its detail (TODO) for now we just list them with
 * peptide count and combined effects to demonstrate visual depth.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { stacks } from '@/data/stacks';

export default function StacksScreen() {
  const router = useRouter();
  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Atlas</Text>
      </Pressable>

      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Curated</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">{stacks.length} stacks</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Combinations built around a goal — fat loss, recovery, longevity. Each one explains why the
          peptides work better together.
        </Text>
      </View>

      <View className="gap-3">
        {stacks.map((s) => (
          <Link key={s.id} href={`/stacks/${s.slug}`} asChild>
            <Pressable className="active:opacity-70">
              <GlassCard className="p-5">
                <View className="flex-row items-start gap-3">
                  <Text className="text-3xl">{s.icon ?? '💊'}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{s.name}</Text>
                    <Text className="mt-0.5 text-xs uppercase tracking-wider text-neon-cyan">{s.goal}</Text>
                    <Text className="mt-2 text-xs leading-relaxed text-text-secondary" numberOfLines={3}>
                      {s.description}
                    </Text>

                    <View className="mt-3 flex-row flex-wrap" style={{ gap: 6 }}>
                      {s.peptides.map((p) => (
                        <View key={p.peptideId} className="rounded-full bg-white/[0.06] px-2.5 py-1">
                          <Text className="text-[10px] text-text-secondary">{p.peptideId}</Text>
                        </View>
                      ))}
                    </View>

                    <View className="mt-3 flex-row items-center gap-3 border-t border-white/5 pt-3">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="layers-outline" size={12} color="#10b981" />
                        <Text className="text-[11px] text-text-secondary">
                          {s.peptides.length} peptide{s.peptides.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="flash-outline" size={12} color="#06b6d4" />
                        <Text className="text-[11px] text-text-secondary">
                          {s.combinedEffects.length} effect{s.combinedEffects.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#737373" />
                </View>
              </GlassCard>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
