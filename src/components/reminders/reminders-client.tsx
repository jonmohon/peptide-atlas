'use client';

/**
 * Reminders settings + CRUD UI. Handles permission prompt, quiet hours,
 * and a list of per-peptide reminders with day/time selectors.
 */

import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import { DAYS_OF_WEEK, type DayOfWeek } from '@/lib/reminders';
import type { Schema } from '@/lib/amplify-data';

type Reminder = Schema['Reminder']['type'];

const DAY_LABELS: Record<DayOfWeek, string> = {
  SUN: 'S',
  MON: 'M',
  TUE: 'T',
  WED: 'W',
  THU: 'T',
  FRI: 'F',
  SAT: 'S',
};

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

function detectPermission(): PermissionState {
  if (typeof window === 'undefined') return 'default';
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as PermissionState;
}

function fireChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('atlas-reminders-changed'));
  }
}

export function RemindersClient() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState<number>(22);
  const [quietEnd, setQuietEnd] = useState<number>(7);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPermission(detectPermission());
    load();
  }, []);

  async function load() {
    try {
      await getCurrentUser();
    } catch {
      setLoading(false);
      return;
    }

    try {
      const [pRes, rRes] = await Promise.all([
        dataClient.models.UserProfile.list(),
        dataClient.models.Reminder.list(),
      ]);
      const profile = pRes.data?.[0];
      if (profile) {
        setProfileId(profile.id);
        setEnabled(profile.notificationsEnabled ?? false);
        if (profile.reminderQuietHoursStart != null) setQuietStart(profile.reminderQuietHoursStart);
        if (profile.reminderQuietHoursEnd != null) setQuietEnd(profile.reminderQuietHoursEnd);
      }
      setReminders(rRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function requestPermissionAndEnable() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    if (result === 'granted' && profileId) {
      await dataClient.models.UserProfile.update({
        id: profileId,
        notificationsEnabled: true,
      });
      setEnabled(true);
      fireChanged();
    }
  }

  async function toggleEnabled() {
    if (!profileId) return;
    const next = !enabled;
    if (next && permission !== 'granted') {
      await requestPermissionAndEnable();
      return;
    }
    setEnabled(next);
    await dataClient.models.UserProfile.update({
      id: profileId,
      notificationsEnabled: next,
    });
    fireChanged();
  }

  async function saveQuietHours() {
    if (!profileId) return;
    await dataClient.models.UserProfile.update({
      id: profileId,
      reminderQuietHoursStart: quietStart,
      reminderQuietHoursEnd: quietEnd,
    });
    fireChanged();
  }

  async function addReminder() {
    const { data } = await dataClient.models.Reminder.create({
      title: 'New reminder',
      time: '08:00',
      daysOfWeek: [...DAYS_OF_WEEK] as string[],
      enabled: true,
    });
    if (data) setReminders((prev) => [...prev, data]);
    fireChanged();
  }

  type ReminderPatch = {
    title?: string;
    body?: string | null;
    time?: string;
    daysOfWeek?: string[];
    peptideId?: string | null;
    dose?: string | null;
    unit?: string;
    enabled?: boolean;
  };

  async function updateReminder(id: string, patch: ReminderPatch) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? ({ ...r, ...patch } as Reminder) : r)),
    );
    try {
      await dataClient.models.Reminder.update({ id, ...patch });
      fireChanged();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await dataClient.models.Reminder.delete({ id });
      fireChanged();
    } catch (err) {
      console.error(err);
    }
  }

  async function testNotification() {
    if (permission !== 'granted') return;
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification('PeptideAtlas test', {
      body: 'Notifications are working! You will get reminders at your scheduled times.',
      icon: '/icons/icon-192.svg',
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 glass rounded-xl" />
        <div className="h-40 glass rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission / master toggle */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-text-secondary mt-1">
              {permission === 'unsupported'
                ? 'Your browser does not support notifications.'
                : permission === 'denied'
                  ? 'Notifications are blocked in your browser settings.'
                  : enabled
                    ? 'Enabled. You will get reminders at your scheduled times.'
                    : 'Turn on to receive reminders.'}
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={permission === 'unsupported' || permission === 'denied'}
            className={cn(
              'relative w-12 h-7 rounded-full transition-all',
              enabled && permission === 'granted'
                ? 'bg-neon-cyan/40'
                : 'bg-white/[0.08]',
              (permission === 'unsupported' || permission === 'denied') && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-5 h-5 rounded-full bg-white transition-all',
                enabled && permission === 'granted' ? 'left-6' : 'left-1',
              )}
            />
          </button>
        </div>

        {permission === 'granted' && enabled && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
            <button
              onClick={testNotification}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] text-text-secondary border border-white/[0.06] hover:text-foreground hover:bg-white/[0.08]"
            >
              Send test notification
            </button>
            <p className="text-[10px] text-text-secondary/70">
              Install as a PWA (home-screen / app tray) for reliable background reminders.
            </p>
          </div>
        )}
      </div>

      {/* Quiet hours */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground">Quiet hours</h2>
        <p className="text-xs text-text-secondary mt-1 mb-3">
          Reminders falling in this window are skipped to the next allowed day.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-text-secondary">From</label>
          <select
            value={quietStart}
            onChange={(e) => setQuietStart(Number(e.target.value))}
            onBlur={saveQuietHours}
            className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
          >
            {Array.from({ length: 24 }).map((_, h) => (
              <option key={h} value={h} className="bg-[#111827]">
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
          <label className="text-xs text-text-secondary">to</label>
          <select
            value={quietEnd}
            onChange={(e) => setQuietEnd(Number(e.target.value))}
            onBlur={saveQuietHours}
            className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
          >
            {Array.from({ length: 24 }).map((_, h) => (
              <option key={h} value={h} className="bg-[#111827]">
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reminder list */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Your reminders</h2>
          <button
            onClick={addReminder}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
          >
            + Add
          </button>
        </div>
        {reminders.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-6">
            No reminders yet. Add one to get notified at dose time.
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                onChange={(patch) => updateReminder(r.id, patch)}
                onDelete={() => deleteReminder(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type ReminderRowPatch = {
  title?: string;
  body?: string | null;
  time?: string;
  daysOfWeek?: string[];
  peptideId?: string | null;
  dose?: string | null;
  unit?: string;
  enabled?: boolean;
};

function ReminderRow({
  reminder,
  onChange,
  onDelete,
}: {
  reminder: Reminder;
  onChange: (patch: ReminderRowPatch) => void;
  onDelete: () => void;
}) {
  const days = useMemo(
    () =>
      new Set(
        ((reminder.daysOfWeek ?? []).filter(Boolean) as string[]).map((d) => d.toUpperCase()),
      ),
    [reminder.daysOfWeek],
  );

  function toggleDay(day: DayOfWeek) {
    const next = new Set(days);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange({ daysOfWeek: Array.from(next) as string[] });
  }

  return (
    <div className={cn('rounded-xl p-3 border border-white/[0.06] bg-white/[0.02]')}>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={reminder.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
          placeholder="e.g., BPC-157 AM dose"
        />
        <input
          type="time"
          value={reminder.time}
          onChange={(e) => onChange({ time: e.target.value })}
          className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
        />
        <select
          value={reminder.peptideId ?? ''}
          onChange={(e) => onChange({ peptideId: e.target.value || null })}
          className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground max-w-[180px]"
        >
          <option value="" className="bg-[#111827]">
            — Peptide —
          </option>
          {peptides.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#111827]">
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={reminder.dose ?? ''}
          onChange={(e) => onChange({ dose: e.target.value || null })}
          placeholder="dose"
          className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
        />
        <select
          value={reminder.unit ?? 'mcg'}
          onChange={(e) => onChange({ unit: e.target.value })}
          className="px-2 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
        >
          <option value="mcg" className="bg-[#111827]">
            mcg
          </option>
          <option value="mg" className="bg-[#111827]">
            mg
          </option>
          <option value="iu" className="bg-[#111827]">
            iu
          </option>
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={cn(
                'w-7 h-7 rounded-full text-[11px] font-semibold transition-all',
                days.has(d) || days.size === 0
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : 'bg-white/[0.03] text-text-secondary border border-white/[0.06] hover:bg-white/[0.06]',
              )}
            >
              {DAY_LABELS[d]}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={reminder.enabled ?? false}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="accent-neon-cyan"
          />
          Enabled
        </label>
        <button
          onClick={onDelete}
          className="text-xs text-text-secondary hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
