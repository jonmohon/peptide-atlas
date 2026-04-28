/**
 * Peptides browse — real data from data/peptides.ts. Search across name +
 * description + effects, filter by category. Tap a row to open the detail
 * route. Categories use the canonical color set from data/categories.ts.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import type { PeptideCategory } from '@/types';

const CATEGORY_FILTERS: { id: PeptideCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#06b6d4' },
  ...categories.map((c) => ({ id: c.id, label: c.label, color: c.color })),
];

export default function PeptidesScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PeptideCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return peptides.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.fullName ?? ''} ${p.description} ${p.effects.join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category]);

  return (
    <Screen>
      <View className="mb-5">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Library</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">
          {peptides.length} peptides
        </Text>
      </View>

      <View className="mb-4 flex-row items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
        <Ionicons name="search" size={16} color="#737373" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, effect, mechanism"
          placeholderTextColor="#737373"
          className="flex-1 text-sm text-foreground"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} className="active:opacity-60">
            <Ionicons name="close-circle" size={16} color="#737373" />
          </Pressable>
        )}
      </View>

      <View className="-mx-1 mb-4 flex-row flex-wrap">
        {CATEGORY_FILTERS.map((c) => {
          const selected = c.id === category;
          return (
            <Pressable key={c.id} onPress={() => setCategory(c.id)} className="m-1 active:opacity-70">
              <View
                className="rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: selected ? `${c.color}26` : 'rgba(255,255,255,0.03)',
                  borderColor: selected ? `${c.color}66` : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: selected ? c.color : '#a3a3a3' }}
                >
                  {c.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-3 text-[11px] uppercase tracking-widest text-text-secondary">
        {filtered.length} match{filtered.length === 1 ? '' : 'es'}
      </Text>

      <View className="gap-2.5">
        {filtered.map((p) => {
          const catInfo = categories.find((c) => c.id === p.category);
          const accent = catInfo?.color ?? '#06b6d4';
          return (
            <Link key={p.id} href={`/peptides/${p.slug}`} asChild>
              <Pressable className="active:opacity-70">
                <GlassCard className="p-4">
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${accent}22` }}
                    >
                      <Ionicons name="flask" size={20} color={accent} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row flex-wrap items-center gap-2">
                        <Text className="text-base font-semibold text-foreground">{p.name}</Text>
                        <View
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: `${accent}1f` }}
                        >
                          <Text className="text-[10px] font-medium" style={{ color: accent }}>
                            {catInfo?.label ?? p.category}
                          </Text>
                        </View>
                      </View>
                      <Text className="mt-1 text-xs leading-relaxed text-text-secondary" numberOfLines={2}>
                        {p.description}
                      </Text>
                      <View className="mt-2 flex-row items-center gap-3">
                        <Stat label="Efficacy" value={p.ratings.efficacy} accent={accent} />
                        <Stat label="Evidence" value={p.ratings.evidence} accent={accent} />
                        <Stat label="Safety" value={p.ratings.safety} accent={accent} />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#737373" />
                  </View>
                </GlassCard>
              </Pressable>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <Text className="mt-6 text-center text-sm text-text-secondary">
            No peptides match.
          </Text>
        )}
      </View>
    </Screen>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View className="flex-row items-baseline gap-1">
      <Text className="text-[10px] uppercase tracking-wider text-text-muted">{label}</Text>
      <Text className="text-[11px] font-semibold" style={{ color: accent }}>
        {value}
      </Text>
      <Text className="text-[10px] text-text-muted">/10</Text>
    </View>
  );
}
