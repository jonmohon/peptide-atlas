/**
 * Bloodwork list — past panels backed by BloodworkPanel (DynamoDB). Each row
 * shows date + lab name + marker count + a flag if AI interpretation is missing.
 * Tap to open detail (TODO: detail screen for full marker view + AI dive).
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { fetchBloodworkPanels, type BloodworkPanelRow } from '@/lib/amplify-data';

export default function BloodworkScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<BloodworkPanelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setRows(await fetchBloodworkPanels());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(239,68,68,0.06)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center justify-between border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Bloodwork</Text>
        <Link href="/bloodwork/new" asChild>
          <Pressable className="active:opacity-60">
            <Ionicons name="add" size={22} color="#06b6d4" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        {error && (
          <GlassCard className="mb-3 p-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
              <Text className="flex-1 text-xs text-red-400">{error}</Text>
            </View>
          </GlassCard>
        )}

        {loading && rows.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#06b6d4" />
          </View>
        ) : rows.length === 0 ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15">
              <Ionicons name="pulse-outline" size={26} color="#ef4444" />
            </View>
            <Text className="mt-4 text-base font-semibold text-foreground">No panels yet</Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
              Track lab markers like testosterone, IGF-1, lipid panel, A1c. Atlas AI flags trends and
              suggests areas to watch.
            </Text>
            <Link href="/bloodwork/new" asChild>
              <Pressable className="mt-4 active:opacity-70">
                <View className="rounded-full border border-neon-cyan/40 bg-neon-cyan/15 px-4 py-2">
                  <Text className="text-xs font-semibold text-neon-cyan">Add a panel</Text>
                </View>
              </Pressable>
            </Link>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {rows.map((p) => (
              <GlassCard key={p.id} className="p-4">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {formatDate(p.date)}
                    </Text>
                    {p.labName && (
                      <Text className="mt-0.5 text-[11px] text-text-secondary">{p.labName}</Text>
                    )}
                    <View className="mt-2 flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1.5">
                        <Ionicons name="pulse-outline" size={12} color="#ef4444" />
                        <Text className="text-[11px] text-text-secondary">
                          {p.markers.length} marker{p.markers.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                      {p.aiInterpretation ? (
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="sparkles" size={11} color="#a855f7" />
                          <Text className="text-[11px] text-neon-purple">AI summary</Text>
                        </View>
                      ) : (
                        <View className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                          <Text className="text-[10px] text-amber-300">No AI yet</Text>
                        </View>
                      )}
                    </View>
                    {p.aiInterpretation && (
                      <Text className="mt-2 text-[11px] leading-relaxed text-text-secondary" numberOfLines={3}>
                        {p.aiInterpretation}
                      </Text>
                    )}
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
