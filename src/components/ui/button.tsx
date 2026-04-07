'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 active:bg-neon-cyan/40 shadow-[0_0_10px_rgba(0,212,255,0.15)]':
            variant === 'primary',
          'bg-white/[0.05] text-foreground border border-white/[0.08] hover:bg-white/[0.08] active:bg-white/[0.12]':
            variant === 'secondary',
          'text-text-secondary hover:text-foreground hover:bg-white/[0.05]':
            variant === 'ghost',
          'border border-white/[0.1] text-text-secondary hover:text-foreground hover:border-neon-cyan/30 hover:bg-neon-cyan/[0.05]':
            variant === 'outline',
        },
        {
          'text-sm px-3 py-1.5': size === 'sm',
          'text-sm px-4 py-2': size === 'md',
          'text-base px-6 py-2.5': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
