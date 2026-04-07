import { cn } from '@/lib/utils';

interface MedicalDisclaimerProps {
  variant?: 'banner' | 'inline' | 'compact';
  className?: string;
}

export function MedicalDisclaimer({
  variant = 'banner',
  className,
}: MedicalDisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p className={cn('text-[10px] text-amber-700', className)}>
        For educational purposes only. Not medical advice.
      </p>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('bg-amber-50 border border-amber-200 rounded-lg p-3', className)}>
        <p className="text-xs text-amber-800">
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute medical advice. Consult a healthcare professional before using any peptides.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-amber-50 border-b border-amber-200 px-4 py-2', className)}>
      <p className="text-xs text-amber-800 text-center">
        <strong>Disclaimer:</strong> This content is for educational purposes only and does not constitute medical advice. Consult a healthcare professional before using any peptides.
      </p>
    </div>
  );
}
