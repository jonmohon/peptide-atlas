'use client';

/**
 * React hook that aggregates the full AtlasContext client-side.
 * Re-fetches on the `atlas-profile-changed` custom event (fired by
 * updateAtlasProfile and anywhere else data the AI cares about changes).
 */

import { useCallback, useEffect, useState } from 'react';
import { aggregateAtlasContext, EMPTY_ATLAS_CONTEXT } from '@/lib/user-profile/aggregate';
import type { AtlasContext } from '@/lib/user-profile/aggregate';

export function useAtlasContext(): {
  context: AtlasContext;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [context, setContext] = useState<AtlasContext>(EMPTY_ATLAS_CONTEXT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const next = await aggregateAtlasContext();
      setContext(next);
    } catch (err) {
      console.warn('useAtlasContext load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => {
      load();
    };
    window.addEventListener('atlas-profile-changed', handler);
    window.addEventListener('atlas-reminders-changed', handler);
    return () => {
      window.removeEventListener('atlas-profile-changed', handler);
      window.removeEventListener('atlas-reminders-changed', handler);
    };
  }, [load]);

  return { context, loading, refresh: load };
}
