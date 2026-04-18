'use client';

/**
 * AI Insights page — fetches journal entries for a selected period (weekly/monthly)
 * and streams an AI-generated analysis report from /api/ai/journal-insight.
 * Includes email-report + weekly auto-email controls.
 */

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/amplify-data';
import { cn } from '@/lib/utils';

type Period = 'weekly' | 'monthly';

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [weeklyEmailEnabled, setWeeklyEmailEnabled] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    dataClient.models.UserProfile.list().then(({ data }) => {
      const p = data?.[0];
      if (p) {
        setProfileId(p.id);
        setWeeklyEmailEnabled(p.weeklyEmailEnabled ?? false);
      }
    }).catch(() => undefined);
  }, []);

  async function toggleWeeklyEmail() {
    if (!profileId) return;
    const next = !weeklyEmailEnabled;
    setWeeklyEmailEnabled(next);
    try {
      await dataClient.models.UserProfile.update({
        id: profileId,
        weeklyEmailEnabled: next,
      });
    } catch {
      setWeeklyEmailEnabled(!next);
    }
  }

  async function emailMeReport() {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const { data: all } = await dataClient.models.JournalEntry.list({ limit: 200 });
      const entries = (all ?? []).map((e) => ({
        date: e.date,
        peptideDoses: e.peptideDoses,
        mood: e.mood,
        energy: e.energy,
        sleepQuality: e.sleepQuality,
        sleepHours: e.sleepHours,
        weight: e.weight,
        bodyFat: e.bodyFat,
        sideEffects: e.sideEffects,
        dietNotes: e.dietNotes,
      }));

      const { data: profiles } = await dataClient.models.UserProfile.list();
      const name = profiles?.[0]?.name ?? null;

      const res = await fetch('/api/insights/email-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, entries, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailStatus(data.error ?? 'Email failed');
      } else if (!data.ok) {
        setEmailStatus(data.error ?? 'Email provider error');
      } else {
        setEmailStatus('Emailed ✓');
      }
    } catch {
      setEmailStatus('Network error');
    } finally {
      setSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 5000);
    }
  }

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReport('');

    try {
      // Fetch journal entries for the period
      const { data: allEntries } = await dataClient.models.JournalEntry.list();
      const entries = (allEntries ?? [])
        .sort((a, b) => b.date.localeCompare(a.date));

      // Filter by period
      const today = new Date();
      const cutoff = new Date();
      if (period === 'weekly') cutoff.setDate(today.getDate() - 7);
      else cutoff.setDate(today.getDate() - 30);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      const periodEntries = entries.filter((e) => e.date >= cutoffStr);

      if (periodEntries.length < 3) {
        setError(`Need at least 3 journal entries for a ${period} report. You have ${periodEntries.length}.`);
        setLoading(false);
        return;
      }

      // Call AI endpoint
      const res = await fetch('/api/ai/journal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: periodEntries.map((e) => ({
            date: e.date,
            peptideDoses: e.peptideDoses,
            mood: e.mood,
            energy: e.energy,
            sleepQuality: e.sleepQuality,
            sleepHours: e.sleepHours,
            weight: e.weight,
            bodyFat: e.bodyFat,
            sideEffects: e.sideEffects,
            dietNotes: e.dietNotes,
          })),
          period,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate report');
        setLoading(false);
        return;
      }

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setReport(text);
      }
    } catch {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => window.history.back()}
          className="text-xs text-text-secondary hover:text-neon-cyan transition-colors"
        >
          &larr; Journal
        </button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-generated analysis of your journal data. The more you log, the better the insights.
          </p>
        </div>
      </div>

      {/* Period selector + Generate */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2 bg-white/[0.03] rounded-xl p-0.5 border border-white/[0.06]">
            {(['weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                  period === p
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'text-text-secondary hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
          <button
            onClick={emailMeReport}
            disabled={sendingEmail}
            className="px-4 py-2 rounded-xl bg-white/[0.05] text-text-secondary border border-white/[0.08] hover:bg-white/[0.1] transition-all text-sm font-medium disabled:opacity-50"
          >
            {sendingEmail ? 'Sending...' : emailStatus ?? 'Email me this report'}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-text-secondary mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={weeklyEmailEnabled}
            onChange={toggleWeeklyEmail}
            className="accent-neon-cyan"
          />
          Send me a weekly insight email automatically
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="glass-bright rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h2 className="text-sm font-semibold text-foreground">
              {period === 'weekly' ? 'Weekly' : 'Monthly'} Insight Report
            </h2>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
            {report}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!report && !error && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Your AI Analysis</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Select a period and generate a report. The AI will analyze your dose patterns, subjective ratings, side effects, and body metrics to find trends and make recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
