import { cn } from '@/lib/utils';

interface IntensityIndicatorProps {
  intensity: number;
  max?: number;
  className?: string;
}

export function IntensityIndicator({
  intensity,
  max = 5,
  className,
}: IntensityIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={cn(
            'w-2 h-2 rounded-full transition-colors',
            i < intensity ? 'bg-medical-500' : 'bg-border'
          )}
        />
      ))}
    </div>
  );
}
