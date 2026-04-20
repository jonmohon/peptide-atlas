import type { Metadata } from 'next';
import { stacks } from '@/data/stacks';
import { peptides } from '@/data/peptides';
import { ExecutionWizardClient } from '@/components/stacks/execution-wizard/wizard-client';

export const metadata: Metadata = {
  title: 'Execute Stack',
  description:
    'Turn any stack into an active protocol — reconstitution, syringe pulls, schedule, reminders, and inventory in one guided flow.',
};

interface Props {
  searchParams: Promise<{
    stackId?: string;
    peptides?: string;
  }>;
}

export default async function ExecuteStackPage({ searchParams }: Props) {
  const params = await searchParams;

  let peptideIds: string[] = [];
  let stackSlug: string | null = null;

  if (params.stackId) {
    const stack = stacks.find((s) => s.id === params.stackId || s.slug === params.stackId);
    if (stack) {
      peptideIds = stack.peptides.map((sp) => sp.peptideId).filter(Boolean);
      stackSlug = stack.slug;
    }
  } else if (params.peptides) {
    peptideIds = params.peptides
      .split(',')
      .map((s) => s.trim())
      .filter((id) => peptides.some((p) => p.id === id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Execute this stack</h1>
        <p className="text-sm text-text-secondary mt-1">
          Six steps from &ldquo;I picked these peptides&rdquo; to &ldquo;my protocol is live with
          reminders, cycle, and inventory.&rdquo;
        </p>
      </div>

      <ExecutionWizardClient
        initialStackSlug={stackSlug}
        initialPeptideIds={peptideIds}
      />
    </div>
  );
}
