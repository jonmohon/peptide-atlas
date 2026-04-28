/**
 * Local notification helpers for daily journal reminders.
 *
 * In Expo Go we're limited to LOCAL notifications (scheduled on-device, no APNs
 * round-trip). Daily reminder is a SchedulableTriggerInputTypes.DAILY trigger
 * stored alongside an AsyncStorage key so we can show the chosen time in UI.
 *
 * Push notifications via APNs/FCM require a dev-client build with the proper
 * entitlements + provisioning profile — deferred until we move off Expo Go.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = 'atlas_journal_reminder';

// Configure how foreground notifications behave system-wide.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type ReminderConfig = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId?: string;
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('atlas-journal', {
      name: 'Journal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted || existing.status === 'granted') return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted || next.status === 'granted';
}

export async function getReminder(): Promise<ReminderConfig> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    if (!raw) return { enabled: false, hour: 21, minute: 0 };
    const parsed = JSON.parse(raw) as ReminderConfig;
    return parsed;
  } catch {
    return { enabled: false, hour: 21, minute: 0 };
  }
}

export async function setReminder(hour: number, minute: number): Promise<ReminderConfig> {
  const ok = await requestNotificationPermission();
  if (!ok) throw new Error('Notification permission denied');

  // Cancel previous schedule (if any) before scheduling a new one.
  const previous = await getReminder();
  if (previous.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
    } catch {
      // ignore
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Log your day',
      body: "How'd today's protocol go? Tap to journal it before the streak resets.",
      data: { route: '/log-entry' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const next: ReminderConfig = { enabled: true, hour, minute, notificationId: id };
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(next));
  return next;
}

export async function clearReminder(): Promise<ReminderConfig> {
  const previous = await getReminder();
  if (previous.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
    } catch {
      // ignore
    }
  }
  const next: ReminderConfig = { enabled: false, hour: previous.hour, minute: previous.minute };
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(next));
  return next;
}
