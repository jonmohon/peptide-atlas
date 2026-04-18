'use client';

/**
 * First-run onboarding modal. Three steps: goals → experience → next actions.
 * On finish, writes goals + experienceLevel + onboardingCompleted to UserProfile.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const GOALS = [
  { id: 'healing', label: 'Healing & Recovery', desc: 'Joint, tendon, and gut repair', icon: '🩹' },
  { id: 'muscle-growth', label: 'Muscle Growth', desc: 'Lean mass and strength', icon: '💪' },
  { id: 'fat-loss', label: 'Fat Loss', desc: 'Body recomposition', icon: '🔥' },
  { id: 'cognitive', label: 'Cognitive Enhancement', desc: 'Focus, memory, mood', icon: '🧠' },
  { id: 'anti-aging', label: 'Anti-Aging', desc: 'Longevity and cellular repair', icon: '⏳' },
  { id: 'sleep', label: 'Sleep & Recovery', desc: 'Deep sleep and restoration', icon: '🌙' },
  { id: 'immune', label: 'Immune Support', desc: 'Resilience and defense', icon: '🛡️' },
  { id: 'sexual', label: 'Sexual Health', desc: 'Libido and performance', icon: '❤️' },
];

const EXPERIENCE = [
  {
    id: 'beginner',
    label: 'New to peptides',
    desc: 'Just learning. I want safety-first, well-researched options with clear explanations.',
  },
  {
    id: 'intermediate',
    label: 'Some experience',
    desc: 'I have used 1–3 peptides. Comfortable with subQ injections and basic protocols.',
  },
  {
    id: 'advanced',
    label: 'Experienced',
    desc: 'Cycle planner, stack optimization, and bloodwork tracking — show me the data.',
  },
];

type Props = {
  onComplete: (data: { goals: string[]; experienceLevel: string }) => Promise<void>;
};

export function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const canAdvance =
    (step === 1 && goals.length > 0 && goals.length <= 3) ||
    (step === 2 && experience !== '') ||
    step === 3;

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await onComplete({ goals, experienceLevel: experience });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-bright rounded-2xl max-w-2xl w-full border border-neon-cyan/20 shadow-[0_0_40px_rgba(0,212,255,0.12)] max-h-[90vh] overflow-auto"
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-2 px-6 pt-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                n <= step ? 'bg-neon-cyan' : 'bg-white/[0.08]',
              )}
            />
          ))}
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Welcome to PeptideAtlas
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  What brings you here? Pick 1–3 goals — we&apos;ll tailor the AI to them.
                </p>
                <div className="grid grid-cols-2 gap-2.5 mt-6">
                  {GOALS.map((g) => {
                    const selected = goals.includes(g.id);
                    const disabled = !selected && goals.length >= 3;
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        disabled={disabled}
                        className={cn(
                          'text-left rounded-xl p-3 border transition-all',
                          selected
                            ? 'bg-neon-cyan/15 border-neon-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                            : disabled
                              ? 'bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed'
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]',
                        )}
                      >
                        <div className="text-lg mb-1">{g.icon}</div>
                        <div
                          className={cn(
                            'text-xs font-semibold',
                            selected ? 'text-neon-cyan' : 'text-foreground',
                          )}
                        >
                          {g.label}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{g.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-text-secondary mt-3 text-center">
                  {goals.length}/3 selected
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  How experienced are you?
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  The AI adjusts its depth and defaults based on this.
                </p>
                <div className="space-y-2.5 mt-6">
                  {EXPERIENCE.map((e) => {
                    const selected = experience === e.id;
                    return (
                      <button
                        key={e.id}
                        onClick={() => setExperience(e.id)}
                        className={cn(
                          'w-full text-left rounded-xl p-4 border transition-all',
                          selected
                            ? 'bg-neon-cyan/15 border-neon-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]',
                        )}
                      >
                        <div
                          className={cn(
                            'text-sm font-semibold',
                            selected ? 'text-neon-cyan' : 'text-foreground',
                          )}
                        >
                          {e.label}
                        </div>
                        <div className="text-xs text-text-secondary mt-1">{e.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">You&apos;re set.</h2>
                <p className="text-sm text-text-secondary mt-1">
                  Here&apos;s the fastest way to get value in your first 10 minutes.
                </p>
                <div className="grid gap-2.5 mt-6">
                  {[
                    {
                      href: '/atlas/protocol-generator',
                      label: 'Generate your first protocol',
                      desc: 'AI builds a peptide plan around your goals in ~20 seconds.',
                      icon: '⚡',
                      color: 'neon-cyan',
                    },
                    {
                      href: `/atlas/journal/${new Date().toISOString().split('T')[0]}`,
                      label: 'Log your first journal entry',
                      desc: 'Record today to start your streak and unlock AI insights.',
                      icon: '📝',
                      color: 'neon-green',
                    },
                    {
                      href: '/atlas/peptides',
                      label: 'Explore the peptide database',
                      desc: '30 peptides with studies, dosing, body-region maps.',
                      icon: '🔬',
                      color: 'purple-400',
                    },
                  ].map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      onClick={handleFinish}
                      className="glass rounded-xl p-4 hover:bg-white/[0.06] transition-all flex items-center gap-3 group"
                    >
                      <div className="text-2xl">{card.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{card.label}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{card.desc}</div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-text-secondary group-hover:text-${card.color} transition-all group-hover:translate-x-0.5`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-8 pb-6">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className={cn(
              'text-xs text-text-secondary transition-all',
              step === 1 ? 'opacity-0 pointer-events-none' : 'hover:text-foreground',
            )}
          >
            ← Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => Math.min(3, s + 1))}
              disabled={!canAdvance}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                canAdvance
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30'
                  : 'bg-white/[0.04] text-text-secondary border border-white/[0.06] cursor-not-allowed',
              )}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-white/[0.06] text-text-secondary border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            >
              {saving ? 'Saving...' : 'I\u2019ll explore on my own'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
