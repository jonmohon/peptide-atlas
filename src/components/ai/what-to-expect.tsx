'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamingText } from '@/hooks/use-streaming-text';
import { StreamingText } from './streaming-text';
import { MedicalDisclaimer } from './medical-disclaimer';
import { getCachedResponse, setCachedResponse, makeCacheKey } from '@/lib/ai/cache';

interface WhatToExpectProps {
  peptideIds: string[];
}

export function WhatToExpect({ peptideIds }: WhatToExpectProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cachedText, setCachedText] = useState<string | null>(null);
  const { text, isStreaming, error, startStream, reset } = useStreamingText();

  const cacheKey = makeCacheKey('predict', ...peptideIds);

  const handleExpand = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    // Check cache first
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      setCachedText(cached);
      return;
    }

    // Stream from API
    reset();
    startStream('/api/ai/predict', { peptideIds });
  }, [isExpanded, cacheKey, reset, startStream, peptideIds]);

  // Cache completed streaming text
  if (!isStreaming && text && !cachedText) {
    setCachedResponse(cacheKey, text);
    setCachedText(text);
  }

  const displayText = cachedText || text;

  return (
    <section className="mb-8">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {/* Expand button */}
        <button
          onClick={handleExpand}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-sm font-semibold text-foreground">What to Expect (AI)</span>
          </div>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Collapsible content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 pt-1">
                {displayText ? (
                  <StreamingText text={displayText} isStreaming={isStreaming} />
                ) : isStreaming ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-white/[0.06] rounded w-full" />
                    <div className="h-3 bg-white/[0.06] rounded w-5/6" />
                    <div className="h-3 bg-white/[0.06] rounded w-4/5" />
                  </div>
                ) : null}

                {error && (
                  <div className="text-xs text-[#ff6b35] bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-lg p-2">
                    {error}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-white/[0.06]">
                  <MedicalDisclaimer variant="compact" className="text-text-muted" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
