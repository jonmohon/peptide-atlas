import { cn } from '@/lib/utils';

interface BodyLegendProps {
  className?: string;
}

export function BodyLegend({ className }: BodyLegendProps) {
  const levels = [
    { intensity: 1, label: 'Mild', color: 'rgba(0, 212, 255, 0.3)' },
    { intensity: 2, label: 'Low', color: 'rgba(0, 212, 255, 0.45)' },
    { intensity: 3, label: 'Moderate', color: 'rgba(0, 212, 255, 0.6)' },
    { intensity: 4, label: 'Strong', color: 'rgba(255, 107, 53, 0.7)' },
    { intensity: 5, label: 'Primary', color: 'rgba(0, 255, 136, 0.8)' },
  ];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-xs text-text-secondary font-medium">Intensity:</span>
      <div className="flex items-center gap-1.5">
        {levels.map(({ intensity, label, color }) => (
          <div key={intensity} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 4px ${color}`,
              }}
            />
            <span className="text-[10px] text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
