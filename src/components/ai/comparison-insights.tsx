'use client';

import { useState, useCallback } from 'react';
import { useStreamingText } from '@/hooks/use-streaming-text';
import { StreamingText } from './streaming-text';
import { AILoadingSkeleton } from './ai-loading-skeleton';
import { getCachedResponse, setCachedResponse, makeCacheKey } from '@/lib/ai/cache';

interface ComparisonInsightsProps {
  peptideIds: string[];
}

export function ComparisonInsights({ peptideIds }: ComparisonInsightsProps) {
  const [cachedText, setCachedText] = useState<string | null>(null);
  const { text, isStreaming, error, startStream, reset } = useStreamingText();

  const cacheKey = makeCacheKey('compare', ...peptideIds);

  const handleAnalyze = useCallback(() => {
    // Check cache first
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      setCachedText(cached);
      return;
    }

    reset();
    setCachedText(null);
    startStream('/api/ai/compare', { peptideIds });
  }, [cacheKey, reset, startStream, peptideIds]);

  // Cache completed streaming text
  if (!isStreaming && text && !cachedText) {
    setCachedResponse(cacheKey, text);
    setCachedText(text);
  }

  const displayText = cachedText || text;

  if (peptideIds.length < 2) return null;

  return (
    <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <h3 className="text-base font-semibold text-foreground">AI Comparison Analysis</h3>
      </div>

      {!displayText && !isStreaming && !error && (
        <button
          onClick={handleAnalyze}
          className="w-full py-3 text-sm font-medium rounded-lg border border-neon-cyan/30 bg-neon-cyan/[0.05] text-neon-cyan hover:bg-neon-cyan/10 transition-all"
        >
          Get AI Comparison Analysis
        </button>
      )}

      {isStreaming && !displayText && (
        <AILoadingSkeleton variant="explanation" />
      )}

      {displayText && (
        <StreamingText text={displayText} isStreaming={isStreaming} />
      )}

      {error && (
        <div className="text-xs text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}
