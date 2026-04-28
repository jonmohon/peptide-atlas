/**
 * Journal — daily log timeline backed by JournalEntry (DynamoDB via Amplify Data).
 *
 * Pull-to-refresh re-fetches. "Log today" opens the modal entry form. Streak is
 * computed by walking entries newest-first; consecutive days = streak. Empty
 * state guides first-time users into logging.
 */

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { fetchJournalEntries, type JournalEntryRow } from '@/lib/amplify-data';

type DoseShape = {
  peptideId?: string;
  peptideName?: string;
  amount?: string;
  route?: string;
};

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const rows = await fetchJournalEntries();
      setEntries(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entries');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setLoading(true);
      load().finally(() => {
        if (alive) setLoading(false);
      });
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

  const stats = useMemo(() => computeStats(entries), [entries]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(6,182,212,0.08)', 'transparent', 'rgba(168,85,247,0.06)']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-widest text-text-secondary">Journal</Text>
            <Text className="mt-1 text-3xl font-bold text-foreground">Daily log</Text>
          </View>
          <Link href="/log-entry" asChild>
            <Pressable className="active:opacity-70">
              <View className="flex-row items-center gap-1.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/15 px-4 py-2">
                <Ionicons name="add" size={16} color="#06b6d4" />
                <Text className="text-xs font-semibold text-neon-cyan">Log today</Text>
              </View>
            </Pressable>
          </Link>
        </View>

        <GlassCard className="mb-5 p-4" bright>
          <View className="flex-row justify-between">
            <Stat label="This week" value={`${stats.thisWeek} / 7`} accent="#10b981" />
            <Stat label="Streak" value={stats.streak === 0 ? '0' : `${stats.streak}d`} accent="#06b6d4" />
            <Stat label="Avg sleep" value={stats.avgSleep ? `${stats.avgSleep}h` : '—'} accent="#a855f7" />
          </View>

          {entries.length > 0 && (
            <>
              <View className="my-4 h-px bg-white/5" />
              <Text className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                Last 30 days
              </Text>
              <Heatmap entries={entries} />
            </>
          )}
        </GlassCard>

        {error && (
          <GlassCard className="mb-3 p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text className="flex-1 text-xs text-red-400">{error}</Text>
            </View>
          </GlassCard>
        )}

        {loading && entries.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#06b6d4" />
          </View>
        ) : entries.length === 0 ? (
          <GlassCard className="items-center p-8" bright>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-neon-cyan/15">
              <Ionicons name="journal-outline" size={26} color="#06b6d4" />
            </View>
            <Text className="mt-4 text-base font-semibold text-foreground">No entries yet</Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-text-secondary">
              Log your first dose, sleep, and how you feel. Your trends show up here as you build a
              history.
            </Text>
          </GlassCard>
        ) : (
          <View className="gap-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EntryCard({ entry }: { entry: JournalEntryRow }) {
  const doses = (entry.peptideDoses as DoseShape[] | null) ?? [];
  return (
    <GlassCard className="p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">{formatDay(entry.date)}</Text>
      </View>

      {doses.length > 0 && (
        <View className="mb-3 gap-1.5">
          {doses.map((d, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
              <Text className="text-xs text-foreground/90">
                {d.peptideName ?? d.peptideId ?? 'Peptide'}
                {d.amount ? `  ·  ${d.amount}` : ''}
                {d.route ? `  ${d.route}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row gap-4 border-t border-white/5 pt-3">
        {entry.energy != null && <Metric icon="battery-charging-outline" label="Energy" value={`${entry.energy}/10`} />}
        {entry.mood != null && <Metric icon="happy-outline" label="Mood" value={`${entry.mood}/10`} />}
        {entry.sleepHours != null && <Metric icon="moon-outline" label="Sleep" value={`${entry.sleepHours}h`} />}
      </View>

      {entry.subjectiveNotes && (
        <Text className="mt-3 text-xs italic leading-relaxed text-text-secondary">
          {entry.subjectiveNotes}
        </Text>
      )}
    </GlassCard>
  );
}

function Heatmap({ entries }: { entries: JournalEntryRow[] }) {
  const dates = new Set(entries.map((e) => e.date));
  const today = new Date();
  const days: { date: string; logged: boolean; isToday: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      logged: dates.has(iso),
      isToday: i === 0,
    });
  }
  return (
    <View className="flex-row flex-wrap" style={{ gap: 4 }}>
      {days.map((d) => (
        <View
          key={d.date}
          style={{
            width: 24,
            height: 24,
            borderRadius: 5,
            backgroundColor: d.logged ? 'rgba(16,185,129,0.55)' : 'rgba(255,255,255,0.05)',
            borderWidth: d.isToday ? 1.5 : 0,
            borderColor: '#06b6d4',
          }}
        />
      ))}
    </View>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View>
      <Text className="text-[10px] uppercase tracking-widest text-text-secondary">{label}</Text>
      <Text className="mt-1 text-xl font-bold" style={{ color: accent }}>
        {value}
      </Text>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Ionicons name={icon} size={14} color="#a3a3a3" />
      <Text className="text-[11px] text-text-secondary">{label}</Text>
      <Text className="text-[11px] font-semibold text-foreground">{value}</Text>
    </View>
  );
}

function formatDay(iso: string): string {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);

  if (iso === todayIso) return 'Today';
  if (iso === yesterdayIso) return 'Yesterday';
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function computeStats(entries: JournalEntryRow[]) {
  const today = new Date();
  const dates = new Set(entries.map((e) => e.date));

  // This week (last 7 days including today)
  let thisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dates.has(d.toISOString().slice(0, 10))) thisWeek++;
  }

  // Streak — consecutive days ending today (or yesterday if no entry today yet)
  let streak = 0;
  const cursor = new Date(today);
  // If today has no entry, allow yesterday as the chain start so the streak doesn't reset until midnight + 1.
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Avg sleep over last 7 entries that recorded it
  const sleepValues = entries
    .filter((e) => e.sleepHours != null)
    .slice(0, 7)
    .map((e) => e.sleepHours as number);
  const avgSleep = sleepValues.length
    ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10
    : null;

  return { thisWeek, streak, avgSleep };
}
