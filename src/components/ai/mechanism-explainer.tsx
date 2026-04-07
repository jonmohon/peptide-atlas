'use client';

import { useState, useCallback } from 'react';
import { useStreamingText } from '@/hooks/use-streaming-text';
import { StreamingText } from './streaming-text';
import { MedicalDisclaimer } from './medical-disclaimer';
import { cn } from '@/lib/utils';

interface MechanismExplainerProps {
  peptideId: string;
  peptideName: string;
}

const levels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
] as const;

type Level = (typeof levels)[number]['id'];

export function MechanismExplainer({ peptideId, peptideName }: MechanismExplainerProps) {
  const [activeLevel, setActiveLevel] = useState<Level>('beginner');
  const [cache, setCache] = useState<Record<string, string>>({});
  const { text, isStreaming, error, startStream, reset } = useStreamingText();
  const [streamingLevel, setStreamingLevel] = useState<Level | null>(null);

  const cacheKey = `${peptideId}:${activeLevel}`;
  const cachedText = cache[cacheKey];
  const isActiveStreaming = isStreaming && streamingLevel === activeLevel;

  const handleGenerate = useCallback(() => {
    if (cachedText) return;
    reset();
    setStreamingLevel(activeLevel);
    startStream('/api/ai/explain', {
      peptideId,
      peptideName,
      level: activeLevel,
    });
  }, [cachedText, reset, activeLevel, startStream, peptideId, peptideName]);

  // Cache completed streaming text
  if (!isStreaming && streamingLevel && text && !cache[`${peptideId}:${streamingLevel}`]) {
    setCache((prev) => ({ ...prev, [`${peptideId}:${streamingLevel}`]: text }));
    setStreamingLevel(null);
  }

  const displayText = cachedText || (isActiveStreaming ? text : '');

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5">
        <h2 className="text-lg font-semibold mb-3 text-foreground">
          How {peptideName} Works
        </h2>

        {/* Level buttons */}
        <div className="flex gap-2 mb-4">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                activeLevel === level.id
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 shadow-[0_0_8px_rgba(0,212,255,0.15)]'
                  : 'bg-white/[0.03] text-text-secondary border-white/[0.08] hover:border-neon-cyan/20 hover:text-foreground'
              )}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        {displayText ? (
          <StreamingText text={displayText} isStreaming={isActiveStreaming} />
        ) : (
          <button
            onClick={handleGenerate}
            disabled={isStreaming}
            className="w-full py-3 text-sm font-medium rounded-lg border border-neon-cyan/30 bg-neon-cyan/[0.05] text-neon-cyan hover:bg-neon-cyan/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Generating...' : 'Generate Explanation'}
          </button>
        )}

        {error && (
          <div className="mt-3 text-xs text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <MedicalDisclaimer variant="compact" className="text-text-muted" />
        </div>
      </div>
    </section>
  );
}
