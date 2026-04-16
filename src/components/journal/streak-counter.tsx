'use client';

/**
 * Displays the user's current and all-time best consecutive logging streaks
 * with a motivational message based on streak length.
 */

interface StreakCounterProps {
  current: number;
  best: number;
}

export function StreakCounter({ current, best }: StreakCounterProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-neon-green">{current}</div>
          <div className="text-xs text-text-secondary mt-1">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-neon-cyan">{best}</div>
          <div className="text-xs text-text-secondary mt-1">Best Streak</div>
        </div>
      </div>
      {current > 0 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-neon-green">
            {current >= 7 ? 'Amazing consistency!' : current >= 3 ? 'Keep it up!' : 'Building momentum!'}
          </span>
        </div>
      )}
    </div>
  );
}
