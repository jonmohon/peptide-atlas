/**
 * Bloodwork panel detail. Shows all markers with in-range / out-of-range
 * highlighting, optional notes, and an "Interpret with AI" affordance that
 * streams a personalized educational summary from /api/ai/bloodwork into the
 * panel's aiInterpretation field (persisted so we don't re-bill on revisits).
 */

import { Ionicons } from '@expo/vector-icons';
import { fetch as expoFetch } from 'expo/fetch';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { StepSequencer, type Step, consumeSseStream } from '@/components/step-sequencer';
import {
  deleteBloodworkPanel,
  fetchBloodworkPanels,
  updateBloodworkInterpretation,
  type BloodworkMarker,
  type BloodworkPanelRow,
} from '@/lib/amplify-data';
import { getIdToken } from '@/lib/amplify';
import { API_BASE_URL } from '@/lib/config';

const INTERPRET_STEPS: Step[] = [
  { id: 'profile', label: 'Reading your profile', state: 'pending' },
  { id: 'draft', label: 'Interpreting markers', state: 'pending' },
  { id: 'critique', label: 'Running safety check', state: 'pending' },
  { id: 'format', label: 'Finalizing', state: 'pending' },
];

export default function BloodworkDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [panel, setPanel] = useState<BloodworkPanelRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [aiText, setAiText] = useState('');
  const [steps, setSteps] = useState<Step[]>(INTERPRET_STEPS);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await fetchBloodworkPanels();
      const p = rows.find((r) => r.id === id) ?? null;
      setPanel(p);
      if (p?.aiInterpretation) setAiText(p.aiInterpretation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      load().finally(() => alive && setLoading(false));
      return () => {
        alive = false;
      };
    }, [load])
  );

  const interpret = async () => {
    if (!panel) return;
    setStreaming(true);
    setAiText('');
    setError(null);
    setWarnings([]);
    setSteps(INTERPRET_STEPS.map((s) => ({ ...s })));
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in required');

      const res = await expoFetch(`${API_BASE_URL}/api/ai/bloodwork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          markers: panel.markers.map((m) => ({
            name: m.name,
            value: m.value,
            unit: m.unit,
            referenceRange:
              m.refLow !== undefined && m.refHigh !== undefined
                ? `${m.refLow}–${m.refHigh}`
                : undefined,
          })),
          labDate: panel.date,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('Empty response');

      let acc = '';
      await consumeSseStream(res.body, {
        onStage: (id) => {
          setSteps((prev) => {
            const idx = prev.findIndex((s) => s.id === id);
            if (idx === -1) return prev;
            return prev.map((s, i) => ({
              ...s,
              state: i < idx ? 'done' : i === idx ? 'active' : 'pending',
            }));
          });
        },
        onText: (delta) => {
          acc += delta;
          setAiText(acc);
        },
        onWarning: (msg) => setWarnings((prev) => [...prev, msg]),
        onError: (msg) => setError(msg),
        onDone: () => {
          setSteps((prev) => prev.map((s) => ({ ...s, state: 'done' })));
        },
      });
      // Persist so revisits don't re-bill the AI.
      if (acc.trim().length > 0) {
        await updateBloodworkInterpretation(panel.id, acc);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI failed');
    } finally {
      setStreaming(false);
    }
  };

  const handleDelete = () => {
    if (!panel) return;
    Alert.alert('Delete panel?', `${formatDate(panel.date)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBloodworkPanel(panel.id);
            router.back();
          } catch {
            // ignore
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#06b6d4" />
      </SafeAreaView>
    );
  }
  if (!panel) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Panel not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          {formatDate(panel.date)}
        </Text>
        <Pressable onPress={handleDelete} className="active:opacity-60">
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {panel.labName && (
          <Text className="mb-1 text-xs uppercase tracking-widest text-text-secondary">
            {panel.labName}
          </Text>
        )}
        <Text className="mb-5 text-2xl font-bold text-foreground">
          {panel.markers.length} markers
        </Text>

        <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Results
        </Text>
        <View className="mb-5 gap-2">
          {panel.markers.map((m, i) => (
            <MarkerRow key={i} marker={m} />
          ))}
        </View>

        {!aiText && !streaming && (
          <Pressable onPress={interpret} className="mb-5 active:opacity-70">
            <View
              className="flex-row items-center justify-center gap-2 rounded-xl border px-4 py-3.5"
              style={{
                backgroundColor: 'rgba(168,85,247,0.20)',
                borderColor: 'rgba(168,85,247,0.45)',
              }}
            >
              <Ionicons name="sparkles" size={16} color="#a855f7" />
              <Text className="text-sm font-semibold text-neon-purple">Interpret with Atlas AI</Text>
            </View>
          </Pressable>
        )}

        {(aiText || streaming || steps.some((s) => s.state !== 'pending')) && (
          <View className="mb-5">
            <View className="mb-2 flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-md bg-neon-purple/20">
                <Ionicons name="sparkles" size={12} color="#c084fc" />
              </View>
              <Text className="text-xs font-semibold text-foreground">Interpretation · Atlas AI</Text>
            </View>

            <View className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Text className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-secondary">
                Pipeline
              </Text>
              <StepSequencer steps={steps} />
            </View>

            {warnings.length > 0 && (
              <View className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <Ionicons name="warning" size={12} color="#f59e0b" />
                  <Text className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                    Safety check flagged
                  </Text>
                </View>
                {warnings.map((w, i) => (
                  <Text key={i} className="mt-1 text-[11px] leading-relaxed text-amber-100">
                    • {w}
                  </Text>
                ))}
              </View>
            )}

            <View
              className="rounded-2xl border px-4 py-3"
              style={{
                backgroundColor: 'rgba(168,85,247,0.10)',
                borderColor: 'rgba(168,85,247,0.28)',
              }}
            >
              {aiText ? (
                <Markdown style={MD_STYLES}>{aiText}</Markdown>
              ) : (
                <Text className="py-1 text-xs text-text-secondary">
                  Output will stream here when the pipeline finishes…
                </Text>
              )}
            </View>
          </View>
        )}

        {error && (
          <View className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 p-3">
            <Text className="text-xs text-red-400">{error}</Text>
          </View>
        )}

        {panel.notes && (
          <>
            <Text className="mb-3 mt-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Notes
            </Text>
            <GlassCard className="p-4">
              <Text className="text-sm leading-relaxed text-foreground/90">{panel.notes}</Text>
            </GlassCard>
          </>
        )}

        <Text className="mt-6 text-center text-[10px] leading-relaxed text-text-muted">
          Educational use only. Not medical advice. Always discuss results with your clinician.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MarkerRow({ marker }: { marker: BloodworkMarker }) {
  const status = computeStatus(marker);
  const color =
    status === 'low' ? '#06b6d4' : status === 'high' ? '#f97316' : status === 'in' ? '#10b981' : '#a3a3a3';
  return (
    <GlassCard className="p-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{marker.name}</Text>
          {marker.refLow !== undefined && marker.refHigh !== undefined && (
            <Text className="mt-0.5 text-[10px] text-text-muted">
              ref {marker.refLow}–{marker.refHigh} {marker.unit}
            </Text>
          )}
        </View>
        <View className="items-end">
          <Text className="text-base font-bold" style={{ color }}>
            {marker.value} <Text className="text-[10px] text-text-muted">{marker.unit}</Text>
          </Text>
          {status !== 'unknown' && (
            <Text className="text-[10px] uppercase tracking-wider" style={{ color }}>
              {status === 'in' ? 'in range' : status === 'low' ? 'low' : 'high'}
            </Text>
          )}
        </View>
      </View>
    </GlassCard>
  );
}

function computeStatus(m: BloodworkMarker): 'low' | 'high' | 'in' | 'unknown' {
  if (m.refLow === undefined || m.refHigh === undefined) return 'unknown';
  if (m.value < m.refLow) return 'low';
  if (m.value > m.refHigh) return 'high';
  return 'in';
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const MD_STYLES = {
  body: { color: '#fafafa', fontSize: 13, lineHeight: 20 },
  paragraph: { color: '#fafafa', fontSize: 13, lineHeight: 20, marginTop: 0, marginBottom: 8 },
  strong: { color: '#ffffff', fontWeight: '700' as const },
  em: { color: '#fafafa', fontStyle: 'italic' as const },
  heading1: { color: '#ffffff', fontSize: 16, fontWeight: '700' as const, marginTop: 6, marginBottom: 4 },
  heading2: { color: '#ffffff', fontSize: 14, fontWeight: '700' as const, marginTop: 6, marginBottom: 4 },
  heading3: { color: '#ffffff', fontSize: 13, fontWeight: '700' as const, marginTop: 4, marginBottom: 2 },
  list_item: { marginBottom: 3 },
  bullet_list_icon: { color: '#06b6d4', marginRight: 6 },
};
