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
          'bg-surface-dim text-text-secondary border border-border': variant === 'default' && !active,
          'bg-medical-50 text-medical-600 border border-medical-200': variant === 'medical' && !active,
          'bg-accent-50 text-accent-600 border border-accent-200': variant === 'accent' && !active,
          'bg-medical-500 text-white border border-medical-500': active,
          'cursor-pointer hover:border-medical-400': !!onClick,
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
