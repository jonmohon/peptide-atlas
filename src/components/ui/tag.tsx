'use client';

import { cn } from '@/lib/utils';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'medical' | 'accent';
  size?: 'sm' | 'md';
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  size = 'sm',
  active = false,
  onClick,
  className,
}: TagProps) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        {
          'bg-white/[0.05] text-text-secondary border border-white/[0.08]': variant === 'default' && !active,
          'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20': variant === 'medical' && !active,
          'bg-neon-green/10 text-neon-green border border-neon-green/20': variant === 'accent' && !active,
          'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_8px_rgba(0,212,255,0.15)]': active,
          'cursor-pointer hover:border-neon-cyan/40 hover:shadow-[0_0_6px_rgba(0,212,255,0.1)]': !!onClick,
        },
        {
          'text-xs px-2.5 py-0.5': size === 'sm',
          'text-sm px-3 py-1': size === 'md',
        },
        className
      )}
    >
      {children}
    </Component>
  );
}
