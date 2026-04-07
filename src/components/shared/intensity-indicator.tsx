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
            i < intensity
              ? 'bg-neon-cyan shadow-[0_0_4px_rgba(0,212,255,0.4)]'
              : 'bg-white/[0.08]'
          )}
        />
      ))}
    </div>
  );
}
