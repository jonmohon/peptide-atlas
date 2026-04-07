import type { PeptideCategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: PeptideCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryConfig: Record<PeptideCategory, { icon: string; color: string; bg: string }> = {
  'growth-hormone': { icon: 'GH', color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10 border border-[#a78bfa]/20' },
  'healing-repair': { icon: 'HR', color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10 border border-[#00ff88]/20' },
  'cognitive': { icon: 'CG', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10 border border-[#a855f7]/20' },
  'metabolic': { icon: 'MT', color: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]/10 border border-[#ff6b35]/20' },
  'immune': { icon: 'IM', color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10 border border-[#00d4ff]/20' },
  'sexual-health': { icon: 'SH', color: 'text-[#f472b6]', bg: 'bg-[#f472b6]/10 border border-[#f472b6]/20' },
  'longevity': { icon: 'LG', color: 'text-[#2dd4bf]', bg: 'bg-[#2dd4bf]/10 border border-[#2dd4bf]/20' },
  'sleep-recovery': { icon: 'SR', color: 'text-[#60a5fa]', bg: 'bg-[#60a5fa]/10 border border-[#60a5fa]/20' },
};

export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const { icon, color, bg } = categoryConfig[category];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-bold',
        color,
        bg,
        {
          'w-6 h-6 text-[10px]': size === 'sm',
          'w-8 h-8 text-xs': size === 'md',
          'w-10 h-10 text-sm': size === 'lg',
        },
        className
      )}
    >
      {icon}
    </div>
  );
}
