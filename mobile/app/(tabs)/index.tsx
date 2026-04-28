/**
 * Atlas dashboard. Greeting, today's streak (real, from JournalEntry), quick
 * actions, and explore cards into the body map / stacks / compare / protocol.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { fetchJournalEntries } from '@/lib/amplify-data';
import { useAuth } from '@/lib/auth-context';

const QUICK_ACTIONS = [
  { label: 'Log dose', icon: 'add-circle-outline' as const, href: '/(tabs)/journal' as const, accent: 'text-neon-cyan' },
  { label: 'Ask AI', icon: 'sparkles-outline' as const, href: '/(tabs)/ai' as const, accent: 'text-neon-purple' },
  { label: 'Browse', icon: 'flask-outline' as const, href: '/(tabs)/peptides' as const, accent: 'text-neon-green' },
] as const;

const EXPLORE_CARDS = [
  { title: 'Body map', description: 'Tap any region to see relevant peptides and effects.', icon: 'body-outline' as const, accent: '#06b6d4', href: '/body-map' as const },
  { title: 'Effects', description: 'Find peptides by what they do — fat loss, recovery, focus.', icon: 'flash-outline' as const, accent: '#f97316', href: '/effects' as const },
  { title: 'Stacks', description: 'Combinations curated by goal — fat loss, recovery, longevity.', icon: 'layers-outline' as const, accent: '#10b981', href: '/stacks' as const },
  { title: 'Compare', description: 'Side-by-side breakdown of any two peptides.', icon: 'git-compare-outline' as const, accent: '#a855f7', href: '/compare' as const },
  { title: 'Reconstitution', description: 'Mix a vial — concentration and units to draw.', icon: 'beaker-outline' as const, accent: '#ec4899', href: '/reconstitution' as const },
  { title: 'Notes', description: 'Personal research notes — observations, dosing tweaks.', icon: 'document-text-outline' as const, accent: '#22d3ee', href: '/notes' as const },
  { title: 'Bloodwork', description: 'Track lab markers — testosterone, IGF-1, A1c, lipids.', icon: 'pulse-outline' as const, accent: '#ef4444', href: '/bloodwork' as const },
  { title: 'Protocol generator', description: 'AI-built protocol from your goals + journal data.', icon: 'construct-outline' as const, accent: '#fbbf24', href: '/protocol' as const },
];

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const firstName = user?.email.split('@')[0] ?? 'there';
  const profileEmpty =
    !profile?.goals?.length && !profile?.experienceLevel;
  const [streak, setStreak] = useState<number | null>(null);
  const [loggedToday, setLoggedToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      fetchJournalEntries()
        .then((rows) => {
          if (!alive) return;
          const dates = new Set(rows.map((r) => r.date));
          const today = new Date();
          const todayIso = today.toISOString().slice(0, 10);
          setLoggedToday(dates.has(todayIso));
          let s = 0;
          const cursor = new Date(today);
          if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
          while (dates.has(cursor.toISOString().slice(0, 10))) {
            s++;
            cursor.setDate(cursor.getDate() - 1);
          }
          setStreak(s);
        })
        .catch(() => setStreak(0));
      return () => {
        alive = false;
      };
    }, [])
  );

  return (
    <Screen>
      <View className="mb-6">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Today</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Hey, {firstName}</Text>
      </View>

      <GlassCard className="mb-5 p-5" bright>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase tracking-widest text-text-secondary">Current streak</Text>
            <Text className="mt-1 text-4xl font-bold text-neon-green">
              {streak === null ? '—' : `${streak} day${streak === 1 ? '' : 's'}`}
            </Text>
          </View>
          <View className="h-14 w-14 items-center justify-center rounded-full bg-neon-green/15">
            <Ionicons name="flame" size={28} color="#10b981" />
          </View>
        </View>
        <Text className="mt-3 text-xs text-text-secondary">
          {loggedToday
            ? "Logged today — nice. See you tomorrow."
            : streak === 0
              ? "Log your first entry to start a streak."
              : "Keep going — log today to extend it."}
        </Text>
      </GlassCard>

      {profileEmpty && (
        <Link href="/profile-edit" asChild>
          <Pressable className="active:opacity-70">
            <GlassCard className="mb-5 p-4" bright>
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/20">
                  <Ionicons name="sparkles" size={18} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Personalize Atlas AI</Text>
                  <Text className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    Set your goals + experience so AI replies match you.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#a855f7" />
              </View>
            </GlassCard>
          </Pressable>
        </Link>
      )}

      <Text className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Quick actions
      </Text>
      <View className="mb-6 flex-row gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.label} href={action.href} asChild>
            <Pressable className="flex-1 active:opacity-70">
              <GlassCard className="items-center p-4">
                <Ionicons name={action.icon} size={28} color="#06b6d4" />
                <Text className={`mt-2 text-xs font-semibold ${action.accent}`}>{action.label}</Text>
              </GlassCard>
            </Pressable>
          </Link>
        ))}
      </View>

      <Text className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Explore
      </Text>
      <View className="gap-3">
        {EXPLORE_CARDS.map((card) => (
          <Link key={card.title} href={card.href} asChild>
            <Pressable className="active:opacity-70">
              <GlassCard className="p-4">
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${card.accent}22` }}
                  >
                    <Ionicons name={card.icon} size={22} color={card.accent} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{card.title}</Text>
                    <Text className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {card.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#737373" />
                </View>
              </GlassCard>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
