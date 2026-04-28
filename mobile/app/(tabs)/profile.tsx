/**
 * Profile tab — shows the signed-in user, tier badge, settings rows, and
 * sign-out. Tier is hard-coded FREE in the prototype; wiring to UserProfile
 * lands once the AppSync RN client is configured.
 */

import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { AtlasButton } from '@/components/atlas-button';
import { GlassCard } from '@/components/glass-card';
import { Screen } from '@/components/screen';
import { useAuth } from '@/lib/auth-context';

type SettingsRow = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: string;
  url?: string;
};

const SETTINGS_ROWS: SettingsRow[] = [
  { label: 'Goals & experience', icon: 'flag-outline', href: '/profile-edit' },
  { label: 'Body metrics', icon: 'fitness-outline', href: '/profile-edit' },
  { label: 'Health conditions', icon: 'medkit-outline', href: '/profile-edit' },
  { label: 'Notifications', icon: 'notifications-outline', href: '/reminders' },
  { label: 'Medical disclaimer', icon: 'medkit-outline', href: '/medical-disclaimer' },
  { label: 'Privacy policy', icon: 'lock-closed-outline', url: 'https://peptideatlas.ai/privacy' },
  { label: 'Terms of service', icon: 'document-text-outline', url: 'https://peptideatlas.ai/terms' },
  { label: 'Help & feedback', icon: 'help-circle-outline', url: 'mailto:support@peptideatlas.ai?subject=Peptide%20Atlas%20mobile%20feedback' },
];

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  FREE: { label: 'Free', color: '#a3a3a3' },
  PRO: { label: 'Pro', color: '#06b6d4' },
  PRO_PLUS: { label: 'Pro+', color: '#a855f7' },
};

export default function ProfileScreen() {
  const { user, signOut, tier } = useAuth();
  const tierInfo = TIER_LABEL[tier];

  return (
    <Screen>
      <View className="mb-6">
        <Text className="text-xs uppercase tracking-widest text-text-secondary">Account</Text>
        <Text className="mt-1 text-3xl font-bold text-foreground">Profile</Text>
      </View>

      <GlassCard className="mb-5 p-5" bright>
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-neon-cyan/20">
            <Text className="text-lg font-bold text-neon-cyan">
              {user?.email.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{user?.email ?? 'Guest'}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: `${tierInfo.color}26`, borderWidth: 1, borderColor: `${tierInfo.color}55` }}
              >
                <Text
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: tierInfo.color }}
                >
                  {tierInfo.label}
                </Text>
              </View>
              <Text className="text-[11px] text-text-secondary">
                {tier === 'FREE' ? 'Manage on the web' : 'Active subscription'}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {tier === 'FREE' && (
        <GlassCard className="mb-5 p-4">
          <Text className="mb-2 text-xs uppercase tracking-widest text-text-secondary">
            Upgrade
          </Text>
          <Text className="text-base font-semibold text-foreground">Unlock Pro</Text>
          <Text className="mt-1 text-xs leading-relaxed text-text-secondary">
            Unlimited AI, bloodwork OCR, full journal history. Manage your subscription on
            peptideatlas.ai.
          </Text>
        </GlassCard>
      )}

      <Link href="/profile-edit" asChild>
        <Pressable className="active:opacity-70">
          <GlassCard className="mb-3 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/15">
                <Ionicons name="person-circle-outline" size={22} color="#06b6d4" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Edit profile</Text>
                <Text className="mt-0.5 text-[11px] text-text-secondary">
                  Goals, body metrics, health context — used by Atlas AI
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#737373" />
            </View>
          </GlassCard>
        </Pressable>
      </Link>

      <Link href="/saved-stacks" asChild>
        <Pressable className="active:opacity-70">
          <GlassCard className="mb-3 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-neon-green/15">
                <Ionicons name="bookmark-outline" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Saved stacks</Text>
                <Text className="mt-0.5 text-[11px] text-text-secondary">
                  Quick access to combinations you bookmarked
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#737373" />
            </View>
          </GlassCard>
        </Pressable>
      </Link>

      <Link href="/reminders" asChild>
        <Pressable className="active:opacity-70">
          <GlassCard className="mb-5 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/15">
                <Ionicons name="notifications-outline" size={20} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Reminders</Text>
                <Text className="mt-0.5 text-[11px] text-text-secondary">
                  Daily nudge to log your dose, sleep, and how you feel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#737373" />
            </View>
          </GlassCard>
        </Pressable>
      </Link>

      <View className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {SETTINGS_ROWS.map((row, i) => {
          const inner = (
            <View
              className={`flex-row items-center gap-3 px-4 py-3.5 ${
                i < SETTINGS_ROWS.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <Ionicons name={row.icon} size={18} color="#a3a3a3" />
              <Text className="flex-1 text-sm text-foreground">{row.label}</Text>
              {row.url ? (
                <Ionicons name="open-outline" size={14} color="#737373" />
              ) : (
                <Ionicons name="chevron-forward" size={16} color="#737373" />
              )}
            </View>
          );
          if (row.href) {
            return (
              <Link key={row.label} href={row.href as never} asChild>
                <Pressable className="active:bg-white/[0.04]">{inner}</Pressable>
              </Link>
            );
          }
          if (row.url) {
            return (
              <Pressable
                key={row.label}
                onPress={() => Linking.openURL(row.url!)}
                className="active:bg-white/[0.04]"
              >
                {inner}
              </Pressable>
            );
          }
          return null;
        })}
      </View>

      <AtlasButton label="Sign out" variant="secondary" onPress={signOut} />

      <Text className="mt-6 text-center text-[10px] text-text-muted">
        Peptide Atlas v0.1.0 · Educational use only
      </Text>
    </Screen>
  );
}
