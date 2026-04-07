'use client';
import { useState, useRef, useCallback } from 'react';

interface UseStreamingTextResult {
  text: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (url: string, body: Record<string, unknown>) => void;
  reset: () => void;
}

export function useStreamingText(): UseStreamingTextResult {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setText('');
    setIsStreaming(false);
    setError(null);
  }, []);

  const startStream = useCallback(async (url: string, body: Record<string, unknown>) => {
    reset();
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setText(accumulated);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [reset]);

  return { text, isStreaming, error, startStream, reset };
}
