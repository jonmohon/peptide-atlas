import type { Metadata } from 'next';
import { CommunityDetail } from '@/components/community/community-detail';

export const metadata: Metadata = {
  title: 'Community Protocol',
  description: 'A published peptide protocol from the PeptideAtlas community.',
};

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <CommunityDetail slug={slug} />
    </div>
  );
}
