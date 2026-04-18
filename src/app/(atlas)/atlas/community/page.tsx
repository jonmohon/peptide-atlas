import type { Metadata } from 'next';
import { CommunityBrowse } from '@/components/community/community-browse';

export const metadata: Metadata = {
  title: 'Community Protocols',
  description:
    'Browse real peptide protocols published by the PeptideAtlas community. Filter by goal, upvote what works, remix the best.',
};

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Community Protocols</h1>
        <p className="text-sm text-text-secondary mt-1">
          Real protocols published by Atlas users. Upvote what works, remix the best.
        </p>
      </div>

      <CommunityBrowse />
    </div>
  );
}
