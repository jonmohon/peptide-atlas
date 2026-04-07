'use client';

import { cn } from '@/lib/utils';

interface AILoadingSkeletonProps {
  variant: 'protocol' | 'analysis' | 'explanation' | 'compact';
  className?: string;
}

function PulseBar({ width = 'w-full', className }: { width?: string; className?: string }) {
  return (
    <div className={cn('h-3 rounded-md bg-white/[0.06] animate-pulse', width, className)} />
  );
}

export function AILoadingSkeleton({ variant, className }: AILoadingSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <PulseBar width="w-3/4" />
        <PulseBar width="w-1/2" />
      </div>
    );
  }

  if (variant === 'explanation') {
    return (
      <div className={cn('space-y-3', className)}>
        <PulseBar width="w-full" />
        <PulseBar width="w-5/6" />
        <PulseBar width="w-4/5" />
      </div>
    );
  }

  if (variant === 'analysis') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Score bar */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="flex-1">
            <PulseBar width="w-1/3" className="mb-2" />
            <div className="h-2 rounded-full bg-white/[0.06] animate-pulse" />
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-white/[0.06] p-3 space-y-2">
              <PulseBar width="w-2/3" />
              <PulseBar width="w-full" />
              <PulseBar width="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // protocol variant
  return (
    <div className={cn('space-y-5', className)}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <PulseBar width="w-1/3" className="h-4" />
          <PulseBar width="w-full" />
          <PulseBar width="w-5/6" />
          <PulseBar width="w-2/3" />
        </div>
      ))}
    </div>
  );
}
