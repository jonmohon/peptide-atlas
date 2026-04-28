/**
 * Stack detail. Shows the curated combination's goal, full description, each
 * peptide's role (primary/synergist/support) with rationale, combined effects,
 * and highlighted body regions. Tapping a peptide chip opens its detail page.
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import { useFocusEffect } from '@react-navigation/native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { bodyRegions } from '@/data/body-regions';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import { stacks } from '@/data/stacks';
import {
  deleteSavedStack,
  fetchSavedStacks,
  saveStack,
  type SavedStackRow,
} from '@/lib/amplify-data';

const ROLE_INFO: Record<'primary' | 'synergist' | 'support', { label: string; color: string }> = {
  primary: { label: 'Primary', color: '#06b6d4' },
  synergist: { label: 'Synergist', color: '#a855f7' },
  support: { label: 'Support', color: '#10b981' },
};

type StackAnalysis = {
  overall_synergy: number;
  synergies?: { peptides: string[]; description: string }[];
  conflicts?: { peptides: string[]; description: string; severity?: string }[];
  suggestions?: string[];
};

export default function StackDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const stack = stacks.find((s) => s.slug === slug);
  const [saved, setSaved] = useState<SavedStackRow | null>(null);
  const [savingState, setSavingState] = useState(false);
  const [analysis, setAnalysis] = useState<StackAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      if (!stack) return;
      fetchSavedStacks()
        .then((rows) => {
          if (!alive) return;
          // Match by name OR by exact peptide-set equality.
          const match = rows.find(
            (r) =>
              r.name === stack.name ||
              (r.peptideIds.length === stack.peptides.length &&
                stack.peptides.every((p) => r.peptideIds.includes(p.peptideId)))
          );
          setSaved(match ?? null);
        })
        .catch(() => setSaved(null));
      return () => {
        alive = false;
      };
    }, [stack])
  );

  if (!stack) {
    return (
      <Screen>
        <Text className="text-foreground">Stack not found.</Text>
      </Screen>
    );
  }

  const runAnalysis = async () => {
    if (!stack) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await expoFetch(`${API_BASE_URL}/api/ai/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ peptideIds: stack.peptides.map((p) => p.peptideId) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as StackAnalysis;
      setAnalysis(json);
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSave = async () => {
    setSavingState(true);
    try {
      if (saved) {
        await deleteSavedStack(saved.id);
        setSaved(null);
      } else {
        const row = await saveStack({
          name: stack.name,
          peptideIds: stack.peptides.map((p) => p.peptideId),
        });
        setSaved(row);
      }
    } finally {
      setSavingState(false);
    }
  };

  return (
    <Screen contentContainerStyle={{ paddingTop: 8 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="-ml-2 flex-row items-center gap-1 active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
          <Text className="text-sm text-text-secondary">Stacks</Text>
        </Pressable>
        <Pressable onPress={toggleSave} disabled={savingState} className="active:opacity-70">
          <View
            className="flex-row items-center gap-1.5 rounded-full border px-3 py-1.5"
            style={{
              backgroundColor: saved ? 'rgba(6,182,212,0.20)' : 'rgba(255,255,255,0.04)',
              borderColor: saved ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
              opacity: savingState ? 0.5 : 1,
            }}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={14}
              color={saved ? '#06b6d4' : '#a3a3a3'}
            />
            <Text
              className="text-[11px] font-semibold"
              style={{ color: saved ? '#06b6d4' : '#a3a3a3' }}
            >
              {saved ? 'Saved' : 'Save'}
            </Text>
          </View>
        </Pressable>
      </View>

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

      {!analysis && !analyzing ? (
        <Pressable onPress={runAnalysis} className="mb-6 active:opacity-70">
          <View
            className="flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3.5"
            style={{
              backgroundColor: 'rgba(168,85,247,0.20)',
              borderColor: 'rgba(168,85,247,0.45)',
            }}
          >
            <Ionicons name="sparkles" size={16} color="#a855f7" />
            <Text className="text-sm font-semibold text-neon-purple">
              Analyze synergies with Atlas AI
            </Text>
          </View>
        </Pressable>
      ) : (
        <View className="mb-6">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Synergy analysis · Atlas AI
          </Text>
          {analyzing && (
            <GlassCard className="p-4">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#a855f7" />
                <Text className="text-xs text-text-secondary">Running…</Text>
              </View>
            </GlassCard>
          )}
          {analysis && (
            <View className="gap-3">
              <GlassCard className="p-4" bright>
                <Text className="text-[10px] uppercase tracking-widest text-text-secondary">
                  Overall synergy
                </Text>
                <View className="mt-2 flex-row items-baseline gap-1">
                  <Text className="text-3xl font-bold text-neon-purple">
                    {analysis.overall_synergy}
                  </Text>
                  <Text className="text-sm text-text-muted">/10</Text>
                </View>
                <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <View
                    className="h-full rounded-full bg-neon-purple"
                    style={{ width: `${Math.min(100, analysis.overall_synergy * 10)}%` }}
                  />
                </View>
              </GlassCard>
              {analysis.synergies && analysis.synergies.length > 0 && (
                <GlassCard className="p-4">
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-green">
                    Synergies
                  </Text>
                  {analysis.synergies.map((s, i) => (
                    <View key={i} className={i > 0 ? 'mt-2.5 border-t border-white/5 pt-2.5' : ''}>
                      <Text className="text-xs font-semibold text-foreground">
                        {s.peptides.join(' + ')}
                      </Text>
                      <Text className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                        {s.description}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              )}
              {analysis.conflicts && analysis.conflicts.length > 0 && (
                <GlassCard className="p-4">
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
                    Conflicts
                  </Text>
                  {analysis.conflicts.map((c, i) => (
                    <View key={i} className={i > 0 ? 'mt-2.5 border-t border-white/5 pt-2.5' : ''}>
                      <Text className="text-xs font-semibold text-foreground">
                        {c.peptides.join(' / ')}
                      </Text>
                      <Text className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                        {c.description}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              )}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <GlassCard className="p-4">
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-neon-cyan">
                    Suggestions
                  </Text>
                  {analysis.suggestions.map((s, i) => (
                    <View key={i} className={`flex-row gap-2 ${i > 0 ? 'mt-2' : ''}`}>
                      <Text className="text-xs text-neon-cyan">•</Text>
                      <Text className="flex-1 text-[12px] leading-relaxed text-foreground/90">
                        {s}
                      </Text>
                    </View>
                  ))}
                </GlassCard>
              )}
            </View>
          )}
          {analysisError && (
            <View className="mt-2 rounded-xl border border-red-500/25 bg-red-500/10 p-2.5">
              <Text className="text-[11px] text-red-400">{analysisError}</Text>
            </View>
          )}
        </View>
      )}

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
