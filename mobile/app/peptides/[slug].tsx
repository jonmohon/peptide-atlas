/**
 * Peptide detail. Mirrors the web's per-peptide page: hero, ratings, dosing,
 * timeline, mechanisms, side effects, key studies, interactions. All static
 * content from data/peptides.ts — no Amplify Data calls here.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AiExplain } from '@/components/ai-explain';
import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { categories } from '@/data/categories';
import { peptides } from '@/data/peptides';
import type { Peptide } from '@/types';

const EVIDENCE_LABEL: Record<Peptide['evidenceLevel'], { label: string; color: string }> = {
  strong: { label: 'Strong', color: '#10b981' },
  moderate: { label: 'Moderate', color: '#06b6d4' },
  emerging: { label: 'Emerging', color: '#f97316' },
  preclinical: { label: 'Preclinical', color: '#a855f7' },
};

const CONFIDENCE_BADGE: Record<NonNullable<Peptide['confidence']>, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  verified: { label: 'Verified', color: '#10b981', icon: 'shield-checkmark' },
  likely: { label: 'Sourced', color: '#06b6d4', icon: 'shield' },
  preliminary: { label: 'Needs review', color: '#f97316', icon: 'shield-half' },
};

const SEVERITY_COLOR: Record<string, string> = {
  mild: '#10b981',
  moderate: '#f97316',
  severe: '#ef4444',
};

export default function PeptideDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const peptide = peptides.find((p) => p.slug === slug);

  if (!peptide) {
    return (
      <Screen>
        <Text className="text-foreground">Peptide not found.</Text>
      </Screen>
    );
  }

  const cat = categories.find((c) => c.id === peptide.category);
  const accent = cat?.color ?? '#06b6d4';
  const evidence = EVIDENCE_LABEL[peptide.evidenceLevel];
  const confidence = CONFIDENCE_BADGE[peptide.confidence ?? 'preliminary'];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen contentContainerStyle={{ paddingTop: 8 }}>
        <Pressable onPress={() => router.back()} className="-ml-2 mb-4 flex-row items-center gap-1 active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
          <Text className="text-sm text-text-secondary">Library</Text>
        </Pressable>

        <View className="mb-1 flex-row flex-wrap" style={{ gap: 6 }}>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${accent}1f` }}
          >
            <Text className="text-[10px] font-medium uppercase tracking-wider" style={{ color: accent }}>
              {cat?.label ?? peptide.category}
            </Text>
          </View>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${evidence.color}1f` }}
          >
            <Text className="text-[10px] font-medium uppercase tracking-wider" style={{ color: evidence.color }}>
              {evidence.label} evidence
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${confidence.color}1f` }}
          >
            <Ionicons name={confidence.icon} size={9} color={confidence.color} />
            <Text className="text-[10px] font-medium uppercase tracking-wider" style={{ color: confidence.color }}>
              {confidence.label}
            </Text>
          </View>
        </View>

        <Text className="text-3xl font-bold text-foreground">{peptide.name}</Text>
        <Text className="mt-0.5 text-sm text-text-secondary">{peptide.fullName}</Text>
        {peptide.lastReviewedAt && (
          <Text className="mt-1 text-[10px] text-text-muted">
            Reviewed {new Date(peptide.lastReviewedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </Text>
        )}

        <Text className="mt-4 text-sm leading-relaxed text-foreground/90">{peptide.description}</Text>

        <View className="mt-6">
          <AiExplain peptideId={peptide.id} peptideName={peptide.name} />
        </View>

        <Text className="mb-3 mt-7 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Ratings
        </Text>
        <GlassCard className="mb-6 p-4" bright>
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            <Rating label="Efficacy" value={peptide.ratings.efficacy} accent={accent} />
            <Rating label="Evidence" value={peptide.ratings.evidence} accent={accent} />
            <Rating label="Safety" value={peptide.ratings.safety} accent={accent} />
            <Rating label="Ease" value={peptide.ratings.easeOfUse} accent={accent} />
            <Rating label="Cost" value={peptide.ratings.cost} accent={accent} />
            <Rating label="Popularity" value={peptide.ratings.popularity} accent={accent} />
          </View>
        </GlassCard>

        <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Dosing
        </Text>
        <GlassCard className="mb-6 p-4">
          <DoseRow label="Route" value={routeLabel(peptide.dosing.route)} />
          <DoseRow label="Typical dose" value={peptide.dosing.typicalDose} />
          <DoseRow label="Frequency" value={peptide.dosing.frequency} />
          <DoseRow label="Cycle" value={peptide.dosing.cycleLength} last={!peptide.halfLifeHours} />
          {peptide.halfLifeHours && (
            <DoseRow label="Half-life" value={`${peptide.halfLifeHours}h`} last />
          )}
          {peptide.dosing.notes && (
            <Text className="mt-3 text-[11px] italic leading-relaxed text-text-secondary">
              {peptide.dosing.notes}
            </Text>
          )}
        </GlassCard>

        <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Effect timeline
        </Text>
        <GlassCard className="mb-6 p-4">
          {peptide.timeline.map((phase, i) => (
            <View key={phase.label} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                {i < peptide.timeline.length - 1 && (
                  <View className="my-1 w-px flex-1" style={{ backgroundColor: `${accent}55` }} />
                )}
              </View>
              <View className={`flex-1 ${i < peptide.timeline.length - 1 ? 'pb-4' : ''}`}>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-foreground">{phase.label}</Text>
                  <Text className="text-[11px] text-text-muted">
                    Wk {phase.weekStart}–{phase.weekEnd}
                  </Text>
                </View>
                <Text className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {phase.description}
                </Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {peptide.sideEffects && peptide.sideEffects.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Side effects
            </Text>
            <View className="mb-6 flex-row flex-wrap" style={{ gap: 8 }}>
              {peptide.sideEffects.map((s) => (
                <View
                  key={s}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
                >
                  <Text className="text-[11px] text-text-secondary">{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {peptide.contraindications && peptide.contraindications.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Contraindications
            </Text>
            <GlassCard className="mb-6 p-4">
              {peptide.contraindications.map((c, i) => (
                <View
                  key={c}
                  className={`flex-row items-start gap-2.5 ${i > 0 ? 'mt-2.5 border-t border-white/5 pt-2.5' : ''}`}
                >
                  <Ionicons name="warning-outline" size={16} color="#f97316" />
                  <Text className="flex-1 text-xs leading-relaxed text-foreground/90">{c}</Text>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {peptide.interactions && peptide.interactions.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Interactions
            </Text>
            <View className="mb-6 gap-2.5">
              {peptide.interactions.map((it) => {
                const sev = SEVERITY_COLOR[it.severity] ?? '#a3a3a3';
                return (
                  <GlassCard key={it.substance} className="p-3.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-semibold text-foreground">{it.substance}</Text>
                      <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${sev}1f` }}>
                        <Text className="text-[10px] font-medium uppercase" style={{ color: sev }}>
                          {it.severity}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {it.description}
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          </>
        )}

        {peptide.keyStudies && peptide.keyStudies.length > 0 && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Key research
            </Text>
            <View className="mb-6 gap-2.5">
              {peptide.keyStudies.slice(0, 4).map((s) => (
                <GlassCard key={s.pmid} className="p-3.5">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="document-text-outline" size={14} color={accent} />
                    <Text className="text-[10px] uppercase tracking-wider text-text-muted">
                      PMID {s.pmid} · {s.year}
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-sm font-medium leading-snug text-foreground">
                    {s.title}
                  </Text>
                  <Text className="mt-2 text-[11px] leading-relaxed text-text-secondary">
                    {s.finding}
                  </Text>
                </GlassCard>
              ))}
            </View>
          </>
        )}

        <Text className="mt-2 text-center text-[10px] leading-relaxed text-text-muted">
          Educational use only. Not medical advice. Consult a licensed clinician.
        </Text>
      </Screen>
    </>
  );
}

function Rating({ label, value, accent }: { label: string; value: number; accent: string }) {
  const pct = Math.min(100, value * 10);
  return (
    <View style={{ width: '47%' }}>
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[11px] font-medium text-text-secondary">{label}</Text>
        <Text className="text-sm font-semibold" style={{ color: accent }}>
          {value}
          <Text className="text-[10px] text-text-muted">/10</Text>
        </Text>
      </View>
      <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
      </View>
    </View>
  );
}

function DoseRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row justify-between py-2 ${last ? '' : 'border-b border-white/5'}`}>
      <Text className="text-xs text-text-secondary">{label}</Text>
      <Text className="text-xs font-medium text-foreground">{value}</Text>
    </View>
  );
}

function routeLabel(route: string): string {
  const map: Record<string, string> = {
    subcutaneous: 'Subcutaneous (SC)',
    intramuscular: 'Intramuscular (IM)',
    oral: 'Oral',
    nasal: 'Nasal spray',
    topical: 'Topical',
  };
  return map[route] ?? route;
}
