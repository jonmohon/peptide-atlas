'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function CTAButton({ href, children, className }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30',
        'hover:bg-neon-cyan/30 rounded-full px-6 py-3 text-base font-semibold',
        'transition-all glow-pulse inline-flex items-center gap-2',
        className
      )}
    >
      {children}
      <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}
