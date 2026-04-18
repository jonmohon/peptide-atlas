'use client';

/**
 * Grid of the user's unlocked achievements, mixed with locked achievements
 * shown as silhouettes so users see what's coming.
 */

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/amplify-data';
import { ACHIEVEMENTS, type AchievementCode } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type Achievement = Schema['Achievement']['type'];

export function AchievementsList() {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataClient.models.Achievement.list()
      .then(({ data }) => setUnlocked(data ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const unlockedCodes = new Set(unlocked.map((a) => a.code));
  const allCodes = Object.keys(ACHIEVEMENTS) as AchievementCode[];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass h-24 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {allCodes.map((code) => {
        const def = ACHIEVEMENTS[code];
        const isUnlocked = unlockedCodes.has(code);
        return (
          <div
            key={code}
            className={cn(
              'rounded-xl p-3 border transition-all',
              isUnlocked
                ? 'glass border-neon-green/30 shadow-[0_0_15px_rgba(0,255,159,0.1)]'
                : 'glass border-white/[0.04] opacity-50',
            )}
          >
            <div className="text-2xl mb-1">{isUnlocked ? def.iconKey : '🔒'}</div>
            <div
              className={cn(
                'text-xs font-semibold',
                isUnlocked ? 'text-foreground' : 'text-text-secondary',
              )}
            >
              {def.title}
            </div>
            <div className="text-[10px] text-text-secondary mt-0.5 leading-snug">
              {def.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
