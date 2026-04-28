/**
 * Effects browse — every effect grouped by category, with the peptides that
 * deliver it. The data here is curated (data/effects.ts) so users can find
 * peptides by goal rather than name.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { categories } from '@/data/categories';
import { effects, type EffectCategory } from '@/data/effects';
import { peptides } from '@/data/peptides';

const CATEGORY_LABEL: Record<EffectCategory, { label: string; color: string }> = {
  'body-composition': { label: 'Body comp', color: '#f97316' },
  healing: { label: 'Healing', color: '#10b981' },
  cognitive: { label: 'Cognitive', color: '#8b5cf6' },
  longevity: { label: 'Longevity', color: '#06b6d4' },
  sleep: { label: 'Sleep', color: '#6366f1' },
  sexual: { label: 'Sexual', color: '#ec4899' },
  immune: { label: 'Immune', color: '#10b981' },
};

const CATEGORY_FILTERS: ('all' | EffectCategory)[] = [
  'all',
  'body-composition',
  'healing',
  'cognitive',
  'longevity',
  'sleep',
  'sexual',
  'immune',
];

export default function EffectsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [category, setCategory] = useState<'all' | EffectCategory>('all');

  const filteredEffects =
    category === 'all' ? effects : effects.filter((e) => e.category === category);

  const selectedEffect = effects.find((e) => e.id === selected);
  const relatedPeptides = selectedEffect
    ? peptides.filter((p) => p.effects.includes(selectedEffect.id))
    : [];

  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
        <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        <Text className="text-sm text-text-secondary">Atlas</Text>
      </Pressable>

      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Library</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Effects</Text>
        <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
          Find peptides by what they do — fat loss, recovery, focus, longevity.
        </Text>
      </View>

      <View className="-mx-1 mb-5 flex-row flex-wrap">
        {CATEGORY_FILTERS.map((c) => {
          const isAll = c === 'all';
          const info = isAll ? null : CATEGORY_LABEL[c];
          const accent = info?.color ?? '#06b6d4';
          const active = c === category;
          return (
            <Pressable key={c} onPress={() => setCategory(c)} className="m-1 active:opacity-70">
              <View
                className="rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: active ? `${accent}26` : 'rgba(255,255,255,0.03)',
                  borderColor: active ? `${accent}66` : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: active ? accent : '#a3a3a3' }}
                >
                  {isAll ? 'All' : info!.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedEffect ? (
        <>
          <Pressable onPress={() => setSelected(null)} className="mb-3 self-start active:opacity-60">
            <View className="flex-row items-center gap-1 rounded-full bg-white/[0.06] px-3 py-1.5">
              <Ionicons name="close" size={12} color="#a3a3a3" />
              <Text className="text-[11px] text-text-secondary">Clear selection</Text>
            </View>
          </Pressable>

          <GlassCard className="mb-5 p-5" bright>
            <View className="flex-row items-start gap-3">
              <Text className="text-3xl">{selectedEffect.icon}</Text>
              <View className="flex-1">
                <View
                  className="self-start rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${CATEGORY_LABEL[selectedEffect.category].color}1f` }}
                >
                  <Text
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: CATEGORY_LABEL[selectedEffect.category].color }}
                  >
                    {CATEGORY_LABEL[selectedEffect.category].label}
                  </Text>
                </View>
                <Text className="mt-1 text-xl font-bold text-foreground">{selectedEffect.label}</Text>
                <Text className="mt-2 text-xs leading-relaxed text-text-secondary">
                  {selectedEffect.description}
                </Text>
              </View>
            </View>
          </GlassCard>

          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {relatedPeptides.length} peptide{relatedPeptides.length === 1 ? '' : 's'} for this effect
          </Text>
          <View className="gap-2.5">
            {relatedPeptides.map((p) => {
              const cat = categories.find((c) => c.id === p.category);
              const accent = cat?.color ?? '#06b6d4';
              return (
                <Link key={p.id} href={`/peptides/${p.slug}`} asChild>
                  <Pressable className="active:opacity-70">
                    <GlassCard className="p-4">
                      <View className="flex-row items-center gap-3">
                        <View
                          className="h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${accent}22` }}
                        >
                          <Ionicons name="flask" size={16} color={accent} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-foreground">{p.name}</Text>
                          <Text className="mt-0.5 text-[11px] text-text-secondary" numberOfLines={1}>
                            {p.fullName}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color="#737373" />
                      </View>
                    </GlassCard>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </>
      ) : (
        <View className="gap-2.5">
          {filteredEffects.map((e) => {
            const info = CATEGORY_LABEL[e.category];
            const peptideCount = peptides.filter((p) => p.effects.includes(e.id)).length;
            return (
              <Pressable key={e.id} onPress={() => setSelected(e.id)} className="active:opacity-70">
                <GlassCard className="p-4">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl">{e.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{e.label}</Text>
                      <Text className="mt-0.5 text-[11px] text-text-secondary" numberOfLines={2}>
                        {e.description}
                      </Text>
                    </View>
                    <View className="items-end" style={{ gap: 4 }}>
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: `${info.color}1a` }}
                      >
                        <Text className="text-[10px] font-medium" style={{ color: info.color }}>
                          {peptideCount}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={12} color="#737373" />
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
          {filteredEffects.length === 0 && (
            <Text className="mt-6 text-center text-sm text-text-secondary">No effects in this category.</Text>
          )}
        </View>
      )}
    </Screen>
  );
}
