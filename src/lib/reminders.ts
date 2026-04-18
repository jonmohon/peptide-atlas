/**
 * Reminder scheduling helpers — compute the next firing time for a daily reminder,
 * format the notification body, and respect per-user quiet hours.
 */

import type { Schema } from './amplify-data';

type Reminder = Schema['Reminder']['type'];

export const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export function isInQuietHours(
  date: Date,
  quietStart?: number | null,
  quietEnd?: number | null,
): boolean {
  if (quietStart == null || quietEnd == null) return false;
  if (quietStart === quietEnd) return false;
  const hour = date.getHours();
  if (quietStart < quietEnd) return hour >= quietStart && hour < quietEnd;
  return hour >= quietStart || hour < quietEnd;
}

export function nextFireAt(
  reminder: Reminder,
  now: Date,
  quietStart?: number | null,
  quietEnd?: number | null,
): Date | null {
  if (!reminder.enabled) return null;
  if (!reminder.time) return null;

  const [hStr, mStr] = reminder.time.split(':');
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const days = ((reminder.daysOfWeek ?? []).filter(Boolean) as string[])
    .map((d) => d.toUpperCase())
    .filter((d): d is DayOfWeek => (DAYS_OF_WEEK as readonly string[]).includes(d));
  const everyDay = days.length === 0 || days.length === 7;

  for (let offset = 0; offset < 14; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate.getTime() <= now.getTime()) continue;
    const dayName = DAYS_OF_WEEK[candidate.getDay()];
    if (!everyDay && !days.includes(dayName)) continue;
    if (isInQuietHours(candidate, quietStart, quietEnd)) continue;
    return candidate;
  }
  return null;
}

export function reminderNotificationBody(r: Reminder): string {
  if (r.body) return r.body;
  if (r.dose && r.unit) return `Time to take ${r.dose} ${r.unit}`;
  return 'Time for your dose';
}
