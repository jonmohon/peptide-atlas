/**
 * Compare — pick two peptides, see them side-by-side. Six stats matched up,
 * plus dosing, half-life, evidence, and shared/unique effects. All client-side
 * from data/peptides.ts; no AI call yet (deferred until /api/ai/compare gets
 * Bearer-token auth).
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import type { Peptide } from '@/types';

export default function CompareScreen() {
  const router = useRouter();
  const [a, setA] = useState<Peptide | null>(null);
  const [b, setB] = useState<Peptide | null>(null);
  const [picking, setPicking] = useState<'a' | 'b' | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Pressable onPress={() => router.back()} className="-ml-2 mb-3 flex-row items-center gap-1 active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
          <Text className="text-sm text-text-secondary">Atlas</Text>
        </Pressable>

        <View className="mb-5">
          <Text className="text-xs uppercase tracking-widest text-text-secondary">Tools</Text>
          <Text className="mt-1 text-3xl font-bold text-foreground">Compare</Text>
          <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
            Pick two peptides to see ratings, dosing, and effects side-by-side.
          </Text>
        </View>

        <View className="mb-5 flex-row gap-3">
          <Slot peptide={a} accent="#06b6d4" onPress={() => setPicking('a')} side="A" />
          <View className="items-center justify-center">
            <Text className="text-xl font-bold text-text-muted">vs</Text>
          </View>
          <Slot peptide={b} accent="#a855f7" onPress={() => setPicking('b')} side="B" />
        </View>

        {a && b && <ComparisonGrid a={a} b={b} />}
        {!a || !b ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Ionicons name="git-compare-outline" size={22} color="#737373" />
            </View>
            <Text className="mt-3 text-sm font-semibold text-foreground">Pick two peptides</Text>
            <Text className="mt-1 text-center text-xs leading-relaxed text-text-secondary">
              Tap a slot above to choose.
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>

      {picking && (
        <PickerOverlay
          onSelect={(p) => {
            if (picking === 'a') setA(p);
            else setB(p);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </SafeAreaView>
  );
}

function Slot({
  peptide,
  accent,
  onPress,
  side,
}: {
  peptide: Peptide | null;
  accent: string;
  onPress: () => void;
  side: string;
}) {
  if (!peptide) {
    return (
      <Pressable onPress={onPress} className="flex-1 active:opacity-70">
        <View
          className="rounded-2xl border border-dashed px-3 py-5 items-center"
          style={{ borderColor: `${accent}55`, backgroundColor: `${accent}0d` }}
        >
          <Ionicons name="add-circle-outline" size={26} color={accent} />
          <Text className="mt-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
            Slot {side}
          </Text>
        </View>
      </Pressable>
    );
  }
  const cat = categories.find((c) => c.id === peptide.category);
  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-70">
      <View
        className="rounded-2xl border px-3 py-3 items-center"
        style={{ backgroundColor: `${accent}1f`, borderColor: `${accent}66` }}
      >
        <Text className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
          {cat?.label ?? peptide.category}
        </Text>
        <Text className="mt-1 text-base font-bold text-foreground" numberOfLines={1}>
          {peptide.name}
        </Text>
        <Text className="mt-0.5 text-[10px] text-text-secondary">tap to change</Text>
      </View>
    </Pressable>
  );
}

function ComparisonGrid({ a, b }: { a: Peptide; b: Peptide }) {
  const sharedEffects = useMemo(
    () => a.effects.filter((e) => b.effects.includes(e)),
    [a, b]
  );
  const onlyA = useMemo(() => a.effects.filter((e) => !b.effects.includes(e)), [a, b]);
  const onlyB = useMemo(() => b.effects.filter((e) => !a.effects.includes(e)), [a, b]);

  return (
    <>
      <SectionTitle>Ratings</SectionTitle>
      <GlassCard className="mb-5 p-4">
        <RatingRow label="Efficacy" a={a.ratings.efficacy} b={b.ratings.efficacy} />
        <RatingRow label="Evidence" a={a.ratings.evidence} b={b.ratings.evidence} />
        <RatingRow label="Safety" a={a.ratings.safety} b={b.ratings.safety} />
        <RatingRow label="Ease of use" a={a.ratings.easeOfUse} b={b.ratings.easeOfUse} />
        <RatingRow label="Cost" a={a.ratings.cost} b={b.ratings.cost} />
        <RatingRow label="Popularity" a={a.ratings.popularity} b={b.ratings.popularity} last />
      </GlassCard>

      <SectionTitle>Dosing</SectionTitle>
      <GlassCard className="mb-5 p-4">
        <KvRow label="Route" a={routeLabel(a.dosing.route)} b={routeLabel(b.dosing.route)} />
        <KvRow label="Typical dose" a={a.dosing.typicalDose} b={b.dosing.typicalDose} />
        <KvRow label="Frequency" a={a.dosing.frequency} b={b.dosing.frequency} />
        <KvRow label="Cycle" a={a.dosing.cycleLength} b={b.dosing.cycleLength} />
        <KvRow label="Half-life" a={a.halfLifeHours ? `${a.halfLifeHours}h` : '—'} b={b.halfLifeHours ? `${b.halfLifeHours}h` : '—'} last />
      </GlassCard>

      <SectionTitle>Evidence</SectionTitle>
      <GlassCard className="mb-5 p-4">
        <KvRow label="Level" a={capitalize(a.evidenceLevel)} b={capitalize(b.evidenceLevel)} />
        <KvRow
          label="Studies cited"
          a={`${a.keyStudies?.length ?? 0}`}
          b={`${b.keyStudies?.length ?? 0}`}
          last
        />
      </GlassCard>

      {sharedEffects.length > 0 && (
        <>
          <SectionTitle>Shared effects ({sharedEffects.length})</SectionTitle>
          <View className="mb-5 flex-row flex-wrap" style={{ gap: 6 }}>
            {sharedEffects.map((e) => (
              <View key={e} className="rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1.5">
                <Text className="text-[11px] font-medium text-neon-green">{e}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {(onlyA.length > 0 || onlyB.length > 0) && (
        <>
          <SectionTitle>Differentiators</SectionTitle>
          <View className="mb-5 gap-3">
            {onlyA.length > 0 && (
              <UniqueEffects label={a.name} accent="#06b6d4" effects={onlyA} />
            )}
            {onlyB.length > 0 && (
              <UniqueEffects label={b.name} accent="#a855f7" effects={onlyB} />
            )}
          </View>
        </>
      )}
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
      {children}
    </Text>
  );
}

function RatingRow({
  label,
  a,
  b,
  last,
}: {
  label: string;
  a: number;
  b: number;
  last?: boolean;
}) {
  const max = Math.max(a, b);
  return (
    <View className={`py-2 ${last ? '' : 'border-b border-white/5'}`}>
      <View className="flex-row items-center justify-between">
        <Text className="w-24 text-xs text-foreground" style={{ color: a >= b ? '#06b6d4' : '#737373' }}>
          {a}/10
        </Text>
        <Text className="text-xs text-text-secondary">{label}</Text>
        <Text className="w-24 text-right text-xs" style={{ color: b >= a ? '#a855f7' : '#737373' }}>
          {b}/10
        </Text>
      </View>
      <View className="mt-2 flex-row gap-1">
        <View className="flex-1 h-1 rounded-full bg-white/[0.04]">
          <View
            className="h-full rounded-full"
            style={{
              width: `${(a / 10) * 100}%`,
              backgroundColor: a >= b ? '#06b6d4' : 'rgba(6,182,212,0.5)',
              alignSelf: 'flex-end',
            }}
          />
        </View>
        <View className="flex-1 h-1 rounded-full bg-white/[0.04]">
          <View
            className="h-full rounded-full"
            style={{
              width: `${(b / 10) * 100}%`,
              backgroundColor: b >= a ? '#a855f7' : 'rgba(168,85,247,0.5)',
            }}
          />
        </View>
      </View>
      {a === max && a > b && (
        <Text className="mt-1 text-[10px] text-neon-cyan">Edge: A</Text>
      )}
      {b === max && b > a && (
        <Text className="mt-1 text-right text-[10px] text-neon-purple">Edge: B</Text>
      )}
    </View>
  );
}

function KvRow({
  label,
  a,
  b,
  last,
}: {
  label: string;
  a: string;
  b: string;
  last?: boolean;
}) {
  return (
    <View className={`py-2.5 ${last ? '' : 'border-b border-white/5'}`}>
      <Text className="text-[10px] uppercase tracking-widest text-text-muted">{label}</Text>
      <View className="mt-1.5 flex-row gap-3">
        <Text className="flex-1 text-xs text-cyan-100">{a}</Text>
        <Text className="flex-1 text-right text-xs text-purple-200">{b}</Text>
      </View>
    </View>
  );
}

function UniqueEffects({
  label,
  accent,
  effects,
}: {
  label: string;
  accent: string;
  effects: string[];
}) {
  return (
    <View>
      <Text className="mb-1.5 text-xs font-semibold" style={{ color: accent }}>
        Only in {label}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        {effects.map((e) => (
          <View
            key={e}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: `${accent}1a`, borderColor: `${accent}40`, borderWidth: 1 }}
          >
            <Text className="text-[11px] font-medium" style={{ color: accent }}>
              {e}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PickerOverlay({
  onSelect,
  onClose,
}: {
  onSelect: (p: Peptide) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = query
    ? peptides.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : peptides;
  return (
    <View className="absolute inset-0 bg-black/80">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
          <Pressable onPress={onClose} className="active:opacity-60">
            <Text className="text-sm text-text-secondary">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold text-foreground">Pick a peptide</Text>
          <View style={{ width: 50 }} />
        </View>
        <View className="border-b border-white/5 px-5 py-3">
          <View className="flex-row items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <Ionicons name="search" size={14} color="#737373" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search peptides"
              placeholderTextColor="#737373"
              className="flex-1 text-sm text-foreground"
              autoCapitalize="none"
              autoFocus
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {filtered.map((p) => {
            const cat = categories.find((c) => c.id === p.category);
            const accent = cat?.color ?? '#06b6d4';
            return (
              <Pressable
                key={p.id}
                onPress={() => onSelect(p)}
                className="rounded-xl px-3 py-3 active:bg-white/[0.04]"
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${accent}22` }}
                  >
                    <Ionicons name="flask" size={16} color={accent} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{p.name}</Text>
                    <Text className="text-[11px]" style={{ color: accent }}>
                      {cat?.label ?? p.category}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
          {filtered.length === 0 && (
            <Text className="mt-6 text-center text-sm text-text-secondary">No matches.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function routeLabel(route: string): string {
  const map: Record<string, string> = {
    subcutaneous: 'SC',
    intramuscular: 'IM',
    oral: 'Oral',
    nasal: 'Nasal',
    topical: 'Topical',
  };
  return map[route] ?? route;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
