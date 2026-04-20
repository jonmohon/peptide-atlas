'use client';

/**
 * AI Protocol Generator — 3-step wizard. Pre-fills goals and experience from
 * the user's UserProfile and offers to save any edits back so the next feature
 * (and the AI) sees the latest answer. Passes the full AtlasContext to the
 * /api/ai/protocol endpoint so the protocol is personalized, not generic.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { useStreamingText } from '@/hooks/use-streaming-text';
import { ProtocolDisplay } from '@/components/ai/protocol-display';
import { AILoadingSkeleton } from '@/components/ai/ai-loading-skeleton';
import { SavePublishButtons } from '@/components/community/save-publish-buttons';
import { useAtlasContext } from '@/hooks/use-atlas-context';
import { updateAtlasProfile } from '@/lib/user-profile/aggregate';
import { atlasContextToPrompt } from '@/lib/user-profile/to-ai-context';
import { cn } from '@/lib/utils';

const goals = [
  { id: 'healing', label: 'Healing & Recovery', icon: '🩹' },
  { id: 'muscle-growth', label: 'Muscle Growth', icon: '💪' },
  { id: 'fat-loss', label: 'Fat Loss', icon: '🔥' },
  { id: 'cognitive', label: 'Cognitive Enhancement', icon: '🧠' },
  { id: 'anti-aging', label: 'Anti-Aging', icon: '⏳' },
  { id: 'sleep', label: 'Sleep & Recovery', icon: '🌙' },
  { id: 'immune', label: 'Immune Support', icon: '🛡️' },
  { id: 'sexual', label: 'Sexual Health', icon: '❤️' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'No prior peptide experience' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some peptide experience' },
  { id: 'advanced', label: 'Advanced', description: 'Extensive peptide experience' },
];

function normalizeGoal(stored: string): string | null {
  const lower = stored.toLowerCase();
  const byId = goals.find((g) => g.id === lower);
  if (byId) return byId.id;
  const byLabel = goals.find((g) => g.label.toLowerCase() === lower);
  if (byLabel) return byLabel.id;
  const partial = goals.find(
    (g) => lower.includes(g.id) || g.label.toLowerCase().includes(lower),
  );
  return partial?.id ?? null;
}

export default function ProtocolGeneratorPage() {
  const { context, loading } = useAtlasContext();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('');
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [savedFromProfile, setSavedFromProfile] = useState(false);
  const [originalGoals, setOriginalGoals] = useState<string[]>([]);
  const [originalExperience, setOriginalExperience] = useState<string>('');
  const [saveBack, setSaveBack] = useState(true);
  const { text, isStreaming, error, startStream, reset: resetStream } = useStreamingText();

  // Pre-fill from profile on first context load.
  useEffect(() => {
    if (hydrated || loading) return;
    const normalized = context.profile.goals
      .map((g) => normalizeGoal(g))
      .filter((g): g is string => g !== null);
    const experienceId = context.profile.experienceLevel?.toLowerCase() ?? '';
    const validExp = experienceLevels.some((l) => l.id === experienceId) ? experienceId : '';

    if (normalized.length > 0 || validExp) {
      setSelectedGoals(normalized);
      setExperience(validExp);
      setOriginalGoals(normalized);
      setOriginalExperience(validExp);
      setSavedFromProfile(true);
    }
    setHydrated(true);
  }, [context, loading, hydrated]);

  const goalsChanged =
    savedFromProfile &&
    (selectedGoals.length !== originalGoals.length ||
      selectedGoals.some((g) => !originalGoals.includes(g)));
  const experienceChanged = savedFromProfile && experience !== originalExperience;
  const offerSaveBack = goalsChanged || experienceChanged;

  async function saveChangesBackToProfile() {
    if (!saveBack || !offerSaveBack) return;
    await updateAtlasProfile({
      goals: selectedGoals,
      experienceLevel: experience,
    });
  }

  function startGeneration() {
    const personalContext = atlasContextToPrompt({
      ...context,
      profile: {
        ...context.profile,
        goals: selectedGoals,
        experienceLevel: experience,
      },
    });
    startStream('/api/ai/protocol', {
      goals: selectedGoals,
      experience,
      userContext: personalContext,
    });
  }

  useEffect(() => {
    if (step === 3 && !text && !isStreaming) {
      saveChangesBackToProfile();
      startGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId],
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">AI Protocol Generator</h1>
        <p className="text-text-secondary mt-1">
          Tell us your goals and we&apos;ll generate a personalized peptide protocol
        </p>
        {error && (
          <div className="mt-3 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-3">
            <p className="text-xs text-[#ff6b35]">
              <strong>Note:</strong> {error}
            </p>
          </div>
        )}
      </div>

      {/* Pre-filled-from-profile banner */}
      {savedFromProfile && step < 3 && (
        <div className="glass rounded-xl p-3 mb-6 flex items-center justify-between gap-3 border border-neon-cyan/20">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-neon-cyan"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-xs text-foreground">
              Loaded from your profile — edit below if this run is different.
            </span>
          </div>
          <Link href="/atlas/profile" className="text-[10px] text-neon-cyan hover:underline">
            Edit profile →
          </Link>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border',
                step >= s
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                  : 'bg-white/[0.04] text-text-secondary border-white/[0.06]',
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  'w-12 h-0.5',
                  step > s ? 'bg-neon-cyan/40' : 'bg-white/[0.06]',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Goals */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What are your primary goals?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all',
                    selected
                      ? 'glass-bright border-neon-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                      : 'glass border-white/[0.06] hover:border-neon-cyan/20 hover:bg-white/[0.04]',
                  )}
                >
                  <span className="text-xl">{goal.icon}</span>
                  <div
                    className={cn(
                      'text-sm font-medium mt-1',
                      selected ? 'text-neon-cyan' : 'text-foreground',
                    )}
                  >
                    {goal.label}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={selectedGoals.length === 0} onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your experience level?
          </h2>
          <div className="space-y-3">
            {experienceLevels.map((level) => {
              const selected = experience === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setExperience(level.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all',
                    selected
                      ? 'glass-bright border-neon-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                      : 'glass border-white/[0.06] hover:border-neon-cyan/20 hover:bg-white/[0.04]',
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium',
                      selected ? 'text-neon-cyan' : 'text-foreground',
                    )}
                  >
                    {level.label}
                  </div>
                  <div className="text-xs text-text-secondary">{level.description}</div>
                </button>
              );
            })}
          </div>

          {offerSaveBack && (
            <label className="flex items-center gap-2 mt-4 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={saveBack}
                onChange={(e) => setSaveBack(e.target.checked)}
                className="accent-neon-cyan"
              />
              Update my profile with these answers (keeps the rest of the app in sync)
            </label>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!experience} onClick={() => setStep(3)}>
              Generate Protocol
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Protocol</h2>

          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedGoals.map((g) => {
                const goal = goals.find((gl) => gl.id === g);
                return (
                  <Tag key={g} variant="medical" size="sm">
                    {goal?.icon} {goal?.label}
                  </Tag>
                );
              })}
            </div>
            <p className="text-xs text-text-secondary capitalize">
              Experience: {experience}
              {context.profile.weight && ` · ${context.profile.weight} lbs`}
              {context.profile.sex && ` · ${context.profile.sex}`}
              {context.profile.healthConditions.length > 0 &&
                ` · avoiding: ${context.profile.healthConditions.join(', ')}`}
            </p>
          </div>

          {(isStreaming || text) && (
            <ProtocolDisplay text={text} isStreaming={isStreaming} />
          )}

          {!text && isStreaming && <AILoadingSkeleton variant="protocol" />}

          {error && (
            <div className="rounded-xl border border-[#ff6b35]/20 bg-[#ff6b35]/[0.05] p-4 text-sm text-[#ff6b35]">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {text && !isStreaming && (
              <Button onClick={() => navigator.clipboard.writeText(text)}>Copy Protocol</Button>
            )}
            <Button
              variant="ghost"
              disabled={isStreaming}
              onClick={() => {
                resetStream();
                startGeneration();
              }}
            >
              Regenerate
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetStream();
                setStep(1);
              }}
            >
              Tweak inputs
            </Button>
          </div>

          {text && !isStreaming && (
            <div className="mt-6">
              <SavePublishButtons
                goals={selectedGoals}
                experience={experience}
                protocolText={text}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
