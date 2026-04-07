'use client';

import { motion } from 'framer-motion';
import type { Peptide } from '@/types';
import { cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/shared/category-icon';
import { EvidenceBadge } from '@/components/shared/evidence-badge';
import { IntensityIndicator } from '@/components/shared/intensity-indicator';
import { Tag } from '@/components/ui/tag';

interface PeptideCardProps {
  peptide: Peptide;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function PeptideCard({
  peptide,
  isSelected = false,
  onClick,
  compact = false,
  className,
}: PeptideCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border transition-all duration-200',
        onClick && 'cursor-pointer',
        isSelected
          ? 'border-neon-cyan/40 bg-neon-cyan/[0.06] shadow-[0_0_15px_rgba(0,212,255,0.1)]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-neon-cyan/20 hover:bg-white/[0.04] hover:shadow-[0_0_10px_rgba(0,212,255,0.05)]',
        className
      )}
    >
      <div className={cn('p-4', compact && 'p-3')}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <CategoryIcon category={peptide.category} size={compact ? 'sm' : 'md'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-semibold truncate text-foreground', compact ? 'text-sm' : 'text-base')}>
                {peptide.name}
              </h3>
              <EvidenceBadge level={peptide.evidenceLevel} />
            </div>
            {!compact && (
              <p className="text-xs text-text-secondary mt-0.5">{peptide.fullName}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-text-secondary mt-2 line-clamp-2">
            {peptide.description}
          </p>
        )}

        {/* Effects tags */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {peptide.effects.slice(0, compact ? 3 : 5).map((effect) => (
            <Tag key={effect} size="sm">
              {effect.replace(/-/g, ' ')}
            </Tag>
          ))}
          {peptide.effects.length > (compact ? 3 : 5) && (
            <Tag size="sm" variant="medical">
              +{peptide.effects.length - (compact ? 3 : 5)}
            </Tag>
          )}
        </div>

        {/* Ratings preview */}
        {!compact && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-secondary uppercase tracking-wide">Efficacy</span>
              <IntensityIndicator intensity={Math.round(peptide.ratings.efficacy / 2)} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-secondary uppercase tracking-wide">Safety</span>
              <IntensityIndicator intensity={Math.round(peptide.ratings.safety / 2)} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
