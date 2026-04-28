/**
 * Stack detail. Shows the curated combination's goal, full description, each
 * peptide's role (primary/synergist/support) with rationale, combined effects,
 * and highlighted body regions. Tapping a peptide chip opens its detail page.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { bodyRegions } from '@/data/body-regions';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import { stacks } from '@/data/stacks';

const ROLE_INFO: Record<'primary' | 'synergist' | 'support', { label: string; color: string }> = {
  primary: { label: 'Primary', color: '#06b6d4' },
  synergist: { label: 'Synergist', color: '#a855f7' },
  support: { label: 'Support', color: '#10b981' },
};

export default function StackDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const stack = stacks.find((s) => s.slug === slug);

  if (!stack) {
    return (
      <Screen>
        <Text className="text-foreground">Stack not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Stacks</Text>
      </Pressable>

      <View className="mb-2 flex-row items-center gap-3">
        <Text className="text-4xl">{stack.icon}</Text>
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-widest text-neon-cyan">{stack.goal}</Text>
          <Text className="text-2xl font-bold text-foreground">{stack.name}</Text>
        </View>
      </View>

      <Text className="mt-3 text-sm leading-relaxed text-foreground/90">{stack.description}</Text>

      <Text className="mb-3 mt-7 text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Components
      </Text>
      <View className="mb-6 gap-2.5">
        {stack.peptides.map((sp) => {
          const peptide = peptides.find((p) => p.id === sp.peptideId);
          if (!peptide) return null;
          const cat = categories.find((c) => c.id === peptide.category);
          const role = ROLE_INFO[sp.role];
          return (
            <Link key={peptide.id} href={`/peptides/${peptide.slug}`} asChild>
              <Pressable className="active:opacity-70">
                <GlassCard className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${cat?.color ?? '#06b6d4'}22` }}
                    >
                      <Ionicons name="flask" size={20} color={cat?.color ?? '#06b6d4'} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-base font-semibold text-foreground">{peptide.name}</Text>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: `${role.color}1f` }}
                        >
                          <Text className="text-[10px] font-medium uppercase" style={{ color: role.color }}>
                            {role.label}
                          </Text>
                        </View>
                      </View>
                      {sp.notes && (
                        <Text className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                          {sp.notes}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#737373" />
                  </View>
                </GlassCard>
              </Pressable>
            </Link>
          );
        })}
      </View>

      {stack.combinedEffects.length > 0 && (
        <>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Combined effects
          </Text>
          <View className="mb-6 flex-row flex-wrap" style={{ gap: 8 }}>
            {stack.combinedEffects.map((e) => (
              <View key={e} className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5">
                <Text className="text-[11px] font-medium text-neon-cyan">{e}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {stack.highlightedRegions.length > 0 && (
        <>
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Targets
          </Text>
          <GlassCard className="mb-6 p-4">
            {stack.highlightedRegions
              .slice()
              .sort((a, b) => b.intensity - a.intensity)
              .map((r, i, arr) => {
                const region = bodyRegions.find((br) => br.id === r.regionId);
                if (!region) return null;
                return (
                  <View
                    key={r.regionId}
                    className={`flex-row items-center gap-3 ${i < arr.length - 1 ? 'border-b border-white/5 pb-3 mb-3' : ''}`}
                  >
                    <Text className="flex-1 text-sm text-foreground">{region.label}</Text>
                    <View className="flex-row" style={{ gap: 3 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <View
                          key={j}
                          className="h-1.5 w-4 rounded-full"
                          style={{
                            backgroundColor: j < r.intensity ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </View>
                  </View>
                );
              })}
          </GlassCard>
        </>
      )}

      <Text className="mt-2 text-center text-[10px] leading-relaxed text-text-muted">
        Educational use only. Not medical advice. Consult a licensed clinician.
      </Text>
    </Screen>
  );
}
