'use client';

import { useState, useEffect } from 'react';
import { getCachedResponse, setCachedResponse, makeCacheKey } from '@/lib/ai/cache';

interface RegionSuggestionProps {
  regionId: string;
  peptideIds: string[];
}

export function RegionSuggestion({ regionId, peptideIds }: RegionSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const cacheKey = makeCacheKey('region', regionId, ...peptideIds);

  useEffect(() => {
    // Check cache
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      setSuggestion(cached);
      return;
    }

    // Fetch suggestion
    const controller = new AbortController();

    fetch('/api/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peptideIds: peptideIds.slice(0, 3) }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return;
        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
        }

        // Extract first sentence
        const firstSentence = text.split(/[.!?]\s/)[0] + '.';
        setSuggestion(firstSentence);
        setCachedResponse(cacheKey, firstSentence);
      })
      .catch(() => {
        // Silently fail - this is an optional enhancement
      });

    return () => controller.abort();
  }, [cacheKey, peptideIds]);

  if (!suggestion) return null;

  return (
    <div className="flex items-start gap-2 px-3 py-2 mb-3 rounded-lg bg-neon-cyan/[0.05] border border-neon-cyan/20">
      <svg
        className="w-3.5 h-3.5 text-neon-cyan shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
      <p className="text-[11px] text-neon-cyan/80 leading-snug">
        <span className="font-medium text-neon-cyan">AI suggests:</span>{' '}
        {suggestion}
      </p>
    </div>
  );
}
