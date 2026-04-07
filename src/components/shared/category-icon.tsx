import type { PeptideCategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: PeptideCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryConfig: Record<PeptideCategory, { icon: string; color: string; bg: string }> = {
  'growth-hormone': { icon: 'GH', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'healing-repair': { icon: 'HR', color: 'text-green-600', bg: 'bg-green-50' },
  'cognitive': { icon: 'CG', color: 'text-purple-600', bg: 'bg-purple-50' },
  'metabolic': { icon: 'MT', color: 'text-amber-600', bg: 'bg-amber-50' },
  'immune': { icon: 'IM', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'sexual-health': { icon: 'SH', color: 'text-pink-600', bg: 'bg-pink-50' },
  'longevity': { icon: 'LG', color: 'text-teal-600', bg: 'bg-teal-50' },
  'sleep-recovery': { icon: 'SR', color: 'text-blue-600', bg: 'bg-blue-50' },
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
