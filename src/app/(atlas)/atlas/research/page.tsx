import type { Metadata } from 'next';
import { ResearchClient } from '@/components/research/research-client';

export const metadata: Metadata = {
  title: 'Research Digest',
  description:
    'Weekly AI-curated PubMed research on the peptides in your protocol, summarized at your experience level.',
};

export default function ResearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Research Digest</h1>
        <p className="text-sm text-text-secondary mt-1">
          Fresh findings from PubMed on the peptides you care about, summarized at your level.
        </p>
      </div>

      <ResearchClient />
    </div>
  );
}
