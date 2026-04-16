'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarHeatmap } from '@/components/journal/calendar-heatmap';
import { StreakCounter } from '@/components/journal/streak-counter';
import { TrendSparklines } from '@/components/journal/trend-sparklines';
import { useJournalStore } from '@/stores/use-journal-store';
import type { CalendarDay } from '@/types/journal';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function JournalPage() {
  const router = useRouter();
  const { calendarDays, currentMonth, currentStreak, bestStreak, setCurrentMonth, loadCalendarMonth } = useJournalStore();
  const [recentEntries, setRecentEntries] = useState<Array<{
    date: string;
    weight?: number | null;
    mood?: number | null;
    energy?: number | null;
    sleepQuality?: number | null;
  }>>([]);

  useEffect(() => {
    loadCalendarMonth(currentMonth);
  }, [currentMonth, loadCalendarMonth]);

  const today = getToday();
  const todayStatus = calendarDays.find((d) => d.date === today)?.status ?? 'empty';

  const handleDayClick = (date: string) => {
    router.push(`/atlas/journal/${date}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track your doses, body metrics, and how you feel every day.
          </p>
        </div>
        <button
          onClick={() => router.push(`/atlas/journal/${today}`)}
          className="px-5 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-sm font-semibold shadow-[0_0_15px_rgba(0,212,255,0.15)]"
        >
          {todayStatus === 'empty' ? 'Log Today' : 'Edit Today'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: Calendar + Streak */}
        <div className="lg:col-span-1 space-y-4">
          <CalendarHeatmap
            days={calendarDays}
            month={currentMonth}
            onDayClick={handleDayClick}
            onMonthChange={(m) => { setCurrentMonth(m); loadCalendarMonth(m); }}
          />
          <StreakCounter current={currentStreak} best={bestStreak} />
        </div>

        {/* Right column: Today's summary + Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Card */}
          <div className="glass-bright rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Today — {new Date(today).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              {todayStatus === 'logged' && (
                <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-[10px] font-medium">
                  Logged
                </span>
              )}
            </div>

            {todayStatus === 'empty' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon-cyan/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  No entry yet today. Log your doses and how you feel.
                </p>
                <button
                  onClick={() => router.push(`/atlas/journal/${today}`)}
                  className="px-4 py-2 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-xs font-semibold"
                >
                  Start Logging
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/atlas/journal/${today}`)}
                className="w-full text-left p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <p className="text-sm text-text-secondary">Tap to view or edit today&apos;s entry</p>
              </button>
            )}
          </div>

          {/* Trend Sparklines */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Trends (Last 14 Days)</h2>
            <TrendSparklines entries={recentEntries} />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/atlas/journal/insights')}
              className="glass rounded-xl p-4 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-semibold text-foreground">AI Insights</span>
              </div>
              <p className="text-xs text-text-secondary">Weekly & monthly AI analysis of your protocol.</p>
            </button>
            <button
              onClick={() => router.push('/atlas/journal/bloodwork')}
              className="glass rounded-xl p-4 text-left hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-sm font-semibold text-foreground">Bloodwork</span>
              </div>
              <p className="text-xs text-text-secondary">Track lab results with AI interpretation.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
