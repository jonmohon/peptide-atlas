import { cn } from '@/lib/utils';
import type { EvidenceLevel } from '@/types';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  className?: string;
}

const config: Record<EvidenceLevel, { label: string; color: string; bg: string }> = {
  strong: {
    label: 'Strong Evidence',
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  moderate: {
    label: 'Moderate Evidence',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  emerging: {
    label: 'Emerging Research',
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  preclinical: {
    label: 'Preclinical',
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
  },
};

export function EvidenceBadge({ level, className }: EvidenceBadgeProps) {
  const { label, color, bg } = config[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border',
        color,
        bg,
        className
      )}
    >
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="6" r="3" />
      </svg>
      {label}
    </span>
  );
}
