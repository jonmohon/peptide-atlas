'use client';

/**
 * Client-side reminder scheduler. Loads the user's reminders + quiet hours,
 * computes the next fire time for each, and posts SCHEDULE messages to the service worker.
 * Re-runs on focus and after reminders mutate.
 */

import { useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { nextFireAt, reminderNotificationBody } from '@/lib/reminders';

async function scheduleAll() {
  try {
    await getCurrentUser();
  } catch {
    return;
  }

  if (!('serviceWorker' in navigator)) return;
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;

  const [profileRes, reminderRes] = await Promise.all([
    dataClient.models.UserProfile.list(),
    dataClient.models.Reminder.list(),
  ]);

  if (!profileRes?.data || !reminderRes?.data) return;

  const profile = profileRes.data[0];
  const quietStart = profile?.reminderQuietHoursStart ?? null;
  const quietEnd = profile?.reminderQuietHoursEnd ?? null;
  const globallyEnabled = profile?.notificationsEnabled ?? false;

  reg.active?.postMessage({ type: 'CLEAR_ALL' });
  if (!globallyEnabled) return;

  const now = new Date();
  for (const r of reminderRes.data) {
    const at = nextFireAt(r, now, quietStart, quietEnd);
    if (!at) continue;
    reg.active?.postMessage({
      type: 'SCHEDULE',
      id: r.id,
      title: r.title,
      body: reminderNotificationBody(r),
      at: at.toISOString(),
      url: '/atlas',
    });
  }
}

export function ReminderScheduler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    scheduleAll().catch((err) => console.warn('Reminder scheduling failed:', err));
    const onFocus = () => scheduleAll().catch(() => undefined);
    window.addEventListener('focus', onFocus);
    window.addEventListener('atlas-reminders-changed', onFocus as EventListener);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('atlas-reminders-changed', onFocus as EventListener);
    };
  }, []);

  return null;
}
