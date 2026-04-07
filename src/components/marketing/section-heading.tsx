import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  className?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-12',
        align === 'center' && 'text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-cyan mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
        {heading}
      </h2>
      {subheading && (
        <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          {subheading}
        </p>
      )}
    </div>
  );
}
