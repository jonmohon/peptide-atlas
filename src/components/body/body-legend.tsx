import { cn } from '@/lib/utils';

interface BodyLegendProps {
  className?: string;
}

export function BodyLegend({ className }: BodyLegendProps) {
  const levels = [
    { intensity: 1, label: 'Mild' },
    { intensity: 2, label: 'Low' },
    { intensity: 3, label: 'Moderate' },
    { intensity: 4, label: 'Strong' },
    { intensity: 5, label: 'Primary' },
  ];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs text-text-secondary font-medium">Effect Intensity:</span>
      <div className="flex items-center gap-1.5">
        {levels.map(({ intensity, label }) => (
          <div key={intensity} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: `rgba(0, 102, 204, ${0.15 + intensity * 0.15})`,
              }}
            />
            <span className="text-[10px] text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
