/**
 * Reminders settings — toggle a daily journal reminder at a chosen time.
 * Local-only notification scheduling (Expo Go limitation). Push via APNs/FCM
 * comes online when we move to a dev-client build with proper entitlements.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import {
  clearReminder,
  getReminder,
  setReminder,
  type ReminderConfig,
} from '@/lib/notifications';

export default function RemindersScreen() {
  const router = useRouter();
  const [config, setConfig] = useState<ReminderConfig | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getReminder().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = async () => {
    if (!config) return;
    setBusy(true);
    try {
      if (config.enabled) {
        const next = await clearReminder();
        setConfig(next);
      } else {
        const next = await setReminder(config.hour, config.minute);
        setConfig(next);
      }
    } catch (e) {
      Alert.alert('Reminder error', e instanceof Error ? e.message : 'Failed to schedule');
    } finally {
      setBusy(false);
    }
  };

  const onTimeChange = async (_: unknown, date?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (!date || !config) return;
    const hour = date.getHours();
    const minute = date.getMinutes();
    setConfig({ ...config, hour, minute });
    if (config.enabled) {
      setBusy(true);
      try {
        const next = await setReminder(hour, minute);
        setConfig(next);
      } catch (e) {
        Alert.alert('Reminder error', e instanceof Error ? e.message : 'Failed');
      } finally {
        setBusy(false);
      }
    }
  };

  if (!config) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#06b6d4" />
      </SafeAreaView>
    );
  }

  const reminderDate = new Date();
  reminderDate.setHours(config.hour);
  reminderDate.setMinutes(config.minute);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-2 border-b border-white/5 px-5 py-3">
        <Pressable onPress={() => router.back()} className="active:opacity-60">
          <Ionicons name="chevron-back" size={20} color="#a3a3a3" />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">Reminders</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View className="mb-6">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-neon-cyan/15 mb-4">
            <Ionicons name="notifications-outline" size={22} color="#06b6d4" />
          </View>
          <Text className="text-2xl font-bold text-foreground">Daily journal nudge</Text>
          <Text className="mt-2 text-sm leading-relaxed text-text-secondary">
            One quick reminder per day to log your dose, sleep, energy, and how you feel. Local
            notifications only — your phone, not our servers.
          </Text>
        </View>

        <Pressable onPress={toggle} disabled={busy} className="active:opacity-70">
          <GlassCard className="mb-4 p-4" bright={config.enabled}>
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={config.enabled ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={config.enabled ? '#10b981' : '#737373'}
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {config.enabled ? 'Reminder is on' : 'Reminder is off'}
                </Text>
                <Text className="mt-0.5 text-[11px] text-text-secondary">
                  {config.enabled
                    ? `Tomorrow at ${formatTime(config.hour, config.minute)} and every day after.`
                    : 'Tap to enable, then choose a time.'}
                </Text>
              </View>
              {busy && <ActivityIndicator size="small" color="#06b6d4" />}
            </View>
          </GlassCard>
        </Pressable>

        <Pressable onPress={() => setShowPicker((v) => !v)} className="active:opacity-70">
          <GlassCard className="mb-4 p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/15">
                <Ionicons name="time-outline" size={18} color="#a855f7" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Time</Text>
                <Text className="mt-0.5 text-[11px] text-text-secondary">
                  Tap to change.
                </Text>
              </View>
              <Text className="text-base font-semibold text-foreground">
                {formatTime(config.hour, config.minute)}
              </Text>
            </View>
          </GlassCard>
        </Pressable>

        {showPicker && (
          <View className="mb-4 rounded-xl border border-white/10 bg-white/[0.04]">
            <DateTimePicker
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              value={reminderDate}
              onChange={onTimeChange}
              themeVariant="dark"
            />
            {Platform.OS === 'ios' && (
              <Pressable onPress={() => setShowPicker(false)} className="border-t border-white/5 p-3 active:opacity-60">
                <Text className="text-center text-sm font-semibold text-neon-cyan">Done</Text>
              </Pressable>
            )}
          </View>
        )}

        <View className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <View className="flex-row items-start gap-2">
            <Ionicons name="information-circle-outline" size={14} color="#a3a3a3" />
            <Text className="flex-1 text-[11px] leading-relaxed text-text-secondary">
              Reminders are scheduled on this device only. Push notifications across devices will
              come with the production build.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(h: number, m: number): string {
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
