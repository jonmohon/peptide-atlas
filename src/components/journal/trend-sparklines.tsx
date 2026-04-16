'use client';

/**
 * 2×2 grid of mini recharts line charts showing 14-day trends for
 * weight, mood, energy, and sleep quality pulled from recent journal entries.
 */

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineData {
  date: string;
  value: number | null;
}

interface TrendSparklineProps {
  label: string;
  data: SparklineData[];
  color: string;
  unit?: string;
  latestValue?: number | null;
}

function Sparkline({ label, data, color, unit, latestValue }: TrendSparklineProps) {
  const validData = data.filter((d) => d.value !== null);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        {latestValue !== null && latestValue !== undefined && (
          <span className="text-sm font-bold" style={{ color }}>
            {latestValue}{unit && <span className="text-xs font-normal text-text-secondary ml-0.5">{unit}</span>}
          </span>
        )}
      </div>
      {validData.length >= 2 ? (
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={validData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1f2e',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e5e7eb',
              }}
              formatter={(value: number) => [`${value}${unit ?? ''}`, label]}
              labelFormatter={(label: string) => label}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-10 flex items-center justify-center text-[10px] text-text-secondary">
          Log more days to see trends
        </div>
      )}
    </div>
  );
}

interface TrendSparklinesProps {
  entries: Array<{
    date: string;
    weight?: number | null;
    mood?: number | null;
    energy?: number | null;
    sleepQuality?: number | null;
  }>;
}

export function TrendSparklines({ entries }: TrendSparklinesProps) {
  const latest = entries[entries.length - 1];

  const metrics = [
    {
      label: 'Weight',
      data: entries.map((e) => ({ date: e.date, value: e.weight ?? null })),
      color: '#00d4ff',
      unit: ' lbs',
      latestValue: latest?.weight,
    },
    {
      label: 'Mood',
      data: entries.map((e) => ({ date: e.date, value: e.mood ?? null })),
      color: '#00ff88',
      unit: '/10',
      latestValue: latest?.mood,
    },
    {
      label: 'Energy',
      data: entries.map((e) => ({ date: e.date, value: e.energy ?? null })),
      color: '#ff6b35',
      unit: '/10',
      latestValue: latest?.energy,
    },
    {
      label: 'Sleep',
      data: entries.map((e) => ({ date: e.date, value: e.sleepQuality ?? null })),
      color: '#a855f7',
      unit: '/10',
      latestValue: latest?.sleepQuality,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((m) => (
        <Sparkline key={m.label} {...m} />
      ))}
    </div>
  );
}
