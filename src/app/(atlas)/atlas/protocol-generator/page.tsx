'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { useStreamingText } from '@/hooks/use-streaming-text';
import { ProtocolDisplay } from '@/components/ai/protocol-display';
import { AILoadingSkeleton } from '@/components/ai/ai-loading-skeleton';

const goals = [
  { id: 'healing', label: 'Healing & Recovery', icon: '🩹' },
  { id: 'muscle-growth', label: 'Muscle Growth', icon: '💪' },
  { id: 'fat-loss', label: 'Fat Loss', icon: '🔥' },
  { id: 'cognition', label: 'Cognitive Enhancement', icon: '🧠' },
  { id: 'anti-aging', label: 'Anti-Aging', icon: '⏳' },
  { id: 'sleep', label: 'Sleep & Recovery', icon: '🌙' },
  { id: 'immune', label: 'Immune Support', icon: '🛡️' },
  { id: 'sexual-health', label: 'Sexual Health', icon: '❤️' },
];

const experienceLevels = [
  { id: 'beginner', label: 'Beginner', description: 'No prior peptide experience' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some peptide experience' },
  { id: 'advanced', label: 'Advanced', description: 'Extensive peptide experience' },
];

export default function ProtocolGeneratorPage() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('');
  const [step, setStep] = useState(1);
  const { text, isStreaming, error, startStream, reset: resetStream } = useStreamingText();

  useEffect(() => {
    if (step === 3 && !text && !isStreaming) {
      startStream('/api/ai/protocol', { goals: selectedGoals, experience });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Protocol Generator</h1>
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

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-medical-500 text-white'
                  : 'bg-surface-dim text-text-secondary border border-border'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? 'bg-medical-500' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Goals */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">What are your primary goals?</h2>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedGoals.includes(goal.id)
                    ? 'border-medical-400 bg-medical-50'
                    : 'border-border hover:border-medical-200'
                }`}
              >
                <span className="text-xl">{goal.icon}</span>
                <div className="text-sm font-medium mt-1">{goal.label}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              disabled={selectedGoals.length === 0}
              onClick={() => setStep(2)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your experience level?</h2>
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setExperience(level.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  experience === level.id
                    ? 'border-medical-400 bg-medical-50'
                    : 'border-border hover:border-medical-200'
                }`}
              >
                <div className="text-sm font-medium">{level.label}</div>
                <div className="text-xs text-text-secondary">{level.description}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button
              disabled={!experience}
              onClick={() => setStep(3)}
            >
              Generate Protocol
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Protocol</h2>

          {/* Selected goals summary */}
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
            <p className="text-xs text-text-secondary">
              Experience: {experience}
            </p>
          </div>

          {/* Protocol display */}
          {(isStreaming || text) && (
            <ProtocolDisplay text={text} isStreaming={isStreaming} />
          )}

          {!text && isStreaming && (
            <AILoadingSkeleton variant="protocol" />
          )}

          {error && (
            <div className="rounded-xl border border-[#ff6b35]/20 bg-[#ff6b35]/[0.05] p-4 text-sm text-[#ff6b35]">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {text && !isStreaming && (
              <Button
                onClick={() => navigator.clipboard.writeText(text)}
              >
                Copy Protocol
              </Button>
            )}
            <Button
              variant="ghost"
              disabled={isStreaming}
              onClick={() => {
                resetStream();
                startStream('/api/ai/protocol', { goals: selectedGoals, experience });
              }}
            >
              Regenerate
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                resetStream();
                setStep(1);
                setSelectedGoals([]);
                setExperience('');
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
