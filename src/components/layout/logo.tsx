import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  href?: string;
}

export function Logo({ className, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2 shrink-0', className)}>
      <div className="w-7 h-7 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
        <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2L12 22M2 12L22 12M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-sm font-bold text-foreground">
        Peptide<span className="text-neon-cyan text-glow-cyan">Atlas</span>
      </span>
    </Link>
  );
}
