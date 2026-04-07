'use client';

import type { StackAnalysis } from '@/lib/ai/schemas';
import { cn } from '@/lib/utils';
import { AILoadingSkeleton } from './ai-loading-skeleton';

interface StackAnalysisPanelProps {
  analysis: StackAnalysis;
  isLoading: boolean;
}

const severityColors: Record<string, string> = {
  low: 'border-yellow-500/30 bg-yellow-500/[0.05] text-yellow-400',
  medium: 'border-orange-500/30 bg-orange-500/[0.05] text-orange-400',
  high: 'border-red-500/30 bg-red-500/[0.05] text-red-400',
};

const typeColors: Record<string, string> = {
  synergistic: 'bg-neon-green/20 text-neon-green border-neon-green/30',
  complementary: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
  neutral: 'bg-white/10 text-text-secondary border-white/20',
  redundant: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  conflicting: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const actionColors: Record<string, string> = {
  add: 'bg-neon-green/20 text-neon-green border-neon-green/30',
  remove: 'bg-red-500/20 text-red-400 border-red-500/30',
  replace: 'bg-[#ff6b35]/20 text-[#ff6b35] border-[#ff6b35]/30',
};

export function StackAnalysisPanel({ analysis, isLoading }: StackAnalysisPanelProps) {
  if (isLoading) {
    return <AILoadingSkeleton variant="analysis" />;
  }

  const scoreColor =
    analysis.overallScore >= 7
      ? 'text-neon-green'
      : analysis.overallScore >= 4
        ? 'text-[#ff6b35]'
        : 'text-red-400';

  const scoreBarColor =
    analysis.overallScore >= 7
      ? 'bg-neon-green'
      : analysis.overallScore >= 4
        ? 'bg-[#ff6b35]'
        : 'bg-red-400';

  return (
    <div className="space-y-4">
      {/* Synergy Score */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className={cn('text-3xl font-bold', scoreColor)}>
            {analysis.overallScore}
          </span>
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">Synergy Score</div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', scoreBarColor)}
                style={{ width: `${analysis.overallScore * 10}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synergies */}
      {analysis.synergies.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4">
          <h4 className="text-sm font-semibold text-neon-cyan mb-3">Synergies</h4>
          <div className="space-y-2">
            {analysis.synergies.map((syn, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 mt-0.5',
                    typeColors[syn.type] || typeColors.neutral
                  )}
                >
                  {syn.type}
                </span>
                <div>
                  <div className="text-xs font-medium text-foreground">
                    {syn.peptideA} + {syn.peptideB}
                  </div>
                  <div className="text-xs text-text-secondary">{syn.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4">
          <h4 className="text-sm font-semibold text-[#ff6b35] mb-3">Potential Issues</h4>
          <div className="space-y-2">
            {analysis.issues.map((issue, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg border p-3 text-xs',
                  severityColors[issue.severity] || severityColors.low
                )}
              >
                <span className="font-semibold uppercase text-[10px] mr-2">
                  {issue.severity}
                </span>
                {issue.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4">
          <h4 className="text-sm font-semibold text-neon-cyan mb-3">Suggestions</h4>
          <div className="space-y-2">
            {analysis.suggestions.map((sug, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0 mt-0.5',
                    actionColors[sug.action] || actionColors.add
                  )}
                >
                  {sug.action}
                </span>
                <div>
                  <div className="text-xs font-medium text-foreground">{sug.peptide}</div>
                  <div className="text-xs text-text-secondary">{sug.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timing Schedule */}
      {analysis.timingSchedule.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-4">
          <h4 className="text-sm font-semibold text-neon-cyan mb-3">Timing Schedule</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-2 pr-3 text-text-secondary font-medium">Peptide</th>
                  <th className="text-left py-2 pr-3 text-text-secondary font-medium">Time</th>
                  <th className="text-center py-2 pr-3 text-text-secondary font-medium">With Food</th>
                  <th className="text-left py-2 text-text-secondary font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {analysis.timingSchedule.map((ts, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-2 pr-3 font-medium text-foreground">{ts.peptide}</td>
                    <td className="py-2 pr-3 text-text-secondary">{ts.timeOfDay}</td>
                    <td className="py-2 pr-3 text-center">
                      {ts.withFood ? (
                        <span className="text-neon-green">Yes</span>
                      ) : (
                        <span className="text-text-secondary">No</span>
                      )}
                    </td>
                    <td className="py-2 text-text-secondary">{ts.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
