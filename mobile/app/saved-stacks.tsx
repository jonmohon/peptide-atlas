/**
 * Saved stacks — list combinations the user has bookmarked. Tap to open the
 * matching curated stack detail (matched by name first, peptide-set fallback).
 * Each row shows the peptide chips, save date, and an unsave action.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { peptides } from '@/data/peptides';
import { stacks } from '@/data/stacks';
import {
  deleteSavedStack,
  fetchSavedStacks,
  type SavedStackRow,
} from '@/lib/amplify-data';

export default function SavedStacksScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<SavedStackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetchSavedStacks();
      setRows(r);
    } catch {
      setRows([]);
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

  const handleDelete = (s: SavedStackRow) => {
    Alert.alert('Remove saved stack?', s.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setRows((prev) => prev.filter((x) => x.id !== s.id));
          try {
            await deleteSavedStack(s.id);
          } catch {
            await load();
          }
        },
      },
    ]);
  };

  const navigateTo = (s: SavedStackRow) => {
    // Match by name first, then by exact peptide-set equality.
    const match = stacks.find(
      (st) =>
        st.name === s.name ||
        (st.peptides.length === s.peptideIds.length &&
          st.peptides.every((p) => s.peptideIds.includes(p.peptideId)))
    );
    if (match) router.push(`/stacks/${match.slug}`);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(6,182,212,0.08)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center gap-2 border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Saved stacks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        {loading && rows.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#06b6d4" />
          </View>
        ) : rows.length === 0 ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neon-cyan/15">
              <Ionicons name="bookmark-outline" size={26} color="#06b6d4" />
            </View>
            <Text className="mt-4 text-base font-semibold text-foreground">No saved stacks</Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
              Bookmark stacks from the Stacks browser to keep them handy here.
            </Text>
            <Pressable onPress={() => router.push('/stacks')} className="mt-4 active:opacity-70">
              <View className="rounded-full border border-neon-cyan/40 bg-neon-cyan/15 px-4 py-2">
                <Text className="text-xs font-semibold text-neon-cyan">Browse stacks</Text>
              </View>
            </Pressable>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {rows.map((s) => {
              const peps = s.peptideIds
                .map((id) => peptides.find((p) => p.id === id))
                .filter(Boolean);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => navigateTo(s)}
                  onLongPress={() => handleDelete(s)}
                  className="active:opacity-70"
                >
                  <GlassCard className="p-4">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">{s.name}</Text>
                        <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
                          {peps.map((p) =>
                            p ? (
                              <View key={p.id} className="rounded-full bg-white/[0.06] px-2 py-0.5">
                                <Text className="text-[10px] text-text-secondary">{p.name}</Text>
                              </View>
                            ) : null
                          )}
                        </View>
                        <Text className="mt-2 text-[10px] text-text-muted">
                          {s.peptideIds.length} peptide{s.peptideIds.length === 1 ? '' : 's'} · long-press to remove
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color="#737373" />
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
