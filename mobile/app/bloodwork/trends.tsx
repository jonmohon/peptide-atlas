/**
 * Bloodwork trends — pick a marker, see its values across every panel charted
 * chronologically with reference range bands shaded green. Aggregates the
 * BloodworkPanel rows on the client; no backend trend logic needed yet.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { Sparkline, type Sample } from '@/components/sparkline';
import { fetchBloodworkPanels, type BloodworkPanelRow } from '@/lib/amplify-data';

export default function TrendsScreen() {
  const router = useRouter();
  const [panels, setPanels] = useState<BloodworkPanelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const rows = await fetchBloodworkPanels();
      // Oldest first so the chart reads left → right.
      setPanels(rows.slice().reverse());
    } catch {
      setPanels([]);
    }
  }, []);

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

  // Build a map from marker name → samples.
  const markerSeries = useMemo(() => {
    const m = new Map<
      string,
      {
        samples: Sample[];
        unit: string;
        refLow?: number;
        refHigh?: number;
      }
    >();
    panels.forEach((p) => {
      const t = new Date(`${p.date}T12:00:00`).getTime();
      p.markers.forEach((mk) => {
        const key = mk.name;
        const existing = m.get(key) ?? { samples: [], unit: mk.unit, refLow: mk.refLow, refHigh: mk.refHigh };
        existing.samples.push({ x: t, y: mk.value, label: p.date });
        // Prefer first non-empty unit + ref range.
        if (!existing.unit && mk.unit) existing.unit = mk.unit;
        if (existing.refLow === undefined && mk.refLow !== undefined) existing.refLow = mk.refLow;
        if (existing.refHigh === undefined && mk.refHigh !== undefined) existing.refHigh = mk.refHigh;
        m.set(key, existing);
      });
    });
    return m;
  }, [panels]);

  // Sort markers by sample count desc.
  const markerNames = useMemo(
    () =>
      Array.from(markerSeries.entries())
        .sort((a, b) => b[1].samples.length - a[1].samples.length)
        .map(([name]) => name),
    [markerSeries]
  );

  const selectedSeries = selected ? markerSeries.get(selected) : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Trends</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#06b6d4" />
          </View>
        ) : panels.length === 0 ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Ionicons name="trending-up-outline" size={26} color="#737373" />
            </View>
            <Text className="mt-4 text-base font-semibold text-foreground">No panels yet</Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
              Add a couple bloodwork panels and trends will populate here.
            </Text>
          </GlassCard>
        ) : (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Markers tracked
            </Text>
            <View className="-mx-1 mb-5 flex-row flex-wrap">
              {markerNames.map((n) => {
                const active = n === selected;
                const count = markerSeries.get(n)!.samples.length;
                return (
                  <Pressable key={n} onPress={() => setSelected(n)} className="m-1 active:opacity-70">
                    <View
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        backgroundColor: active ? 'rgba(6,182,212,0.20)' : 'rgba(255,255,255,0.03)',
                        borderColor: active ? 'rgba(6,182,212,0.45)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Text className="text-xs font-medium" style={{ color: active ? '#06b6d4' : '#a3a3a3' }}>
                        {n}{' '}
                        <Text className="text-[10px] text-text-muted">· {count}</Text>
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {!selected ? (
              <GlassCard className="items-center p-6" bright>
                <Ionicons name="pulse-outline" size={22} color="#737373" />
                <Text className="mt-2 text-xs text-text-secondary">
                  Pick a marker above to chart its history.
                </Text>
              </GlassCard>
            ) : selectedSeries && selectedSeries.samples.length >= 1 ? (
              <>
                <GlassCard className="mb-4 p-4" bright>
                  <Text className="mb-1 text-xs uppercase tracking-widest text-text-secondary">
                    {selected}
                  </Text>
                  <View className="flex-row items-baseline gap-2">
                    <Text className="text-3xl font-bold text-neon-cyan">
                      {selectedSeries.samples[selectedSeries.samples.length - 1].y}
                    </Text>
                    <Text className="text-xs text-text-muted">{selectedSeries.unit ?? ''}</Text>
                  </View>
                  {selectedSeries.refLow !== undefined && selectedSeries.refHigh !== undefined && (
                    <Text className="mt-1 text-[11px] text-text-muted">
                      reference {selectedSeries.refLow}–{selectedSeries.refHigh} {selectedSeries.unit ?? ''}
                    </Text>
                  )}
                  <View className="mt-4">
                    <Sparkline
                      data={selectedSeries.samples}
                      refLow={selectedSeries.refLow}
                      refHigh={selectedSeries.refHigh}
                      unit={selectedSeries.unit}
                      width={320}
                      height={140}
                    />
                  </View>
                </GlassCard>

                <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
                  History
                </Text>
                <View className="gap-2">
                  {[...selectedSeries.samples].reverse().map((s, i) => {
                    const inRange =
                      selectedSeries.refLow !== undefined &&
                      selectedSeries.refHigh !== undefined &&
                      s.y >= selectedSeries.refLow &&
                      s.y <= selectedSeries.refHigh;
                    return (
                      <View
                        key={i}
                        className="flex-row items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
                      >
                        <Text className="text-xs text-text-secondary">{formatDate(s.label!)}</Text>
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: inRange ? '#10b981' : '#f97316' }}
                        >
                          {s.y} <Text className="text-[10px] text-text-muted">{selectedSeries.unit ?? ''}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
