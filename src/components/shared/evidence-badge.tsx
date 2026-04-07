import { cn } from '@/lib/utils';
import type { EvidenceLevel } from '@/types';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  className?: string;
}

const config: Record<EvidenceLevel, { label: string; color: string; bg: string; glow: string }> = {
  strong: {
    label: 'Strong Evidence',
    color: 'text-[#00ff88]',
    bg: 'bg-[#00ff88]/10 border-[#00ff88]/20',
    glow: '0 0 6px rgba(0, 255, 136, 0.2)',
  },
  moderate: {
    label: 'Moderate Evidence',
    color: 'text-[#ff6b35]',
    bg: 'bg-[#ff6b35]/10 border-[#ff6b35]/20',
    glow: '0 0 6px rgba(255, 107, 53, 0.2)',
  },
  emerging: {
    label: 'Emerging Research',
    color: 'text-[#a855f7]',
    bg: 'bg-[#a855f7]/10 border-[#a855f7]/20',
    glow: '0 0 6px rgba(168, 85, 247, 0.2)',
  },
  preclinical: {
    label: 'Preclinical',
    color: 'text-[#64748b]',
    bg: 'bg-[#64748b]/10 border-[#64748b]/20',
    glow: 'none',
  },
};

export function EvidenceBadge({ level, className }: EvidenceBadgeProps) {
  const { label, color, bg, glow } = config[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border',
        color,
        bg,
        className
      )}
      style={{ boxShadow: glow }}
    >
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="6" r="3" />
      </svg>
      {label}
    </span>
  );
}
