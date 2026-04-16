'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJournalStore } from '@/stores/use-journal-store';
import { useEffect } from 'react';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const quickActions = [
  {
    href: '/atlas/journal/' + getToday(),
    label: 'Log Today',
    description: 'Record your doses, mood, energy, and more',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>,
    color: 'neon-cyan',
  },
  {
    href: '/atlas/protocol-generator',
    label: 'Generate Protocol',
    description: 'AI-powered protocol tailored to your goals',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    color: 'purple-400',
  },
  {
    href: '/atlas/tools/reconstitution',
    label: 'Reconstitution Calc',
    description: 'Calculate your injection dose',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    color: 'neon-green',
  },
  {
    href: '/atlas/stacks',
    label: 'Build a Stack',
    description: 'Combine peptides with AI synergy analysis',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    color: 'neon-orange',
  },
];

const exploreCards = [
  { href: '/atlas/body-map', label: 'Body Map', desc: 'Interactive peptide visualization', icon: '🧬' },
  { href: '/atlas/peptides', label: 'Peptide Database', desc: '30 peptides with full profiles', icon: '📊' },
  { href: '/atlas/effects', label: 'Effects Explorer', desc: 'Find peptides by desired effect', icon: '⚡' },
  { href: '/atlas/compare', label: 'Compare Tool', desc: 'Side-by-side peptide comparison', icon: '⚖️' },
  { href: '/atlas/journal/bloodwork', label: 'Bloodwork', desc: 'Track labs with AI interpretation', icon: '🔬' },
  { href: '/atlas/journal/insights', label: 'AI Insights', desc: 'Weekly analysis of your data', icon: '📈' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { currentStreak, calendarDays, loadCalendarMonth, currentMonth } = useJournalStore();
  const today = getToday();

  useEffect(() => {
    loadCalendarMonth(currentMonth);
  }, [currentMonth, loadCalendarMonth]);

  const todayLogged = calendarDays.some((d) => d.date === today && d.status === 'logged');

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome + streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {currentStreak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/20">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-neon-green">{currentStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Today's status card */}
      <div className={`glass-bright rounded-2xl p-6 border ${todayLogged ? 'border-neon-green/20' : 'border-neon-cyan/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {todayLogged ? "Today's entry is logged ✓" : "You haven't logged today yet"}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {todayLogged
                ? 'View or edit your entry for today.'
                : 'Track your doses, mood, energy, and side effects to build your data.'}
            </p>
          </div>
          <button
            onClick={() => router.push(`/atlas/journal/${today}`)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              todayLogged
                ? 'bg-white/[0.06] text-text-secondary border border-white/[0.08] hover:bg-white/[0.1]'
                : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
            }`}
          >
            {todayLogged ? 'View Entry' : 'Log Now'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all group"
            >
              <div className={`text-${action.color} mb-2.5 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="text-xs font-semibold text-foreground">{action.label}</h3>
              <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-2">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Explore */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Explore</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {exploreCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-xl mb-2">{card.icon}</div>
              <h3 className="text-xs font-semibold text-foreground">{card.label}</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-text-secondary/50 text-center pt-4">
        Educational purposes only. Not medical advice. Consult a healthcare professional before using any peptides.
      </p>
    </div>
  );
}
