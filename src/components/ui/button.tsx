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
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-medical-500 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-medical-500 text-white hover:bg-medical-600 active:bg-medical-700 shadow-sm':
            variant === 'primary',
          'bg-surface-dim text-foreground hover:bg-border active:bg-border/80':
            variant === 'secondary',
          'text-text-secondary hover:text-foreground hover:bg-surface-dim':
            variant === 'ghost',
          'border border-border text-foreground hover:bg-surface-dim':
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
