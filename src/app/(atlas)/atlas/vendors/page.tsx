import type { Metadata } from 'next';
import { VendorDirectory } from '@/components/vendors/vendor-directory';

export const metadata: Metadata = {
  title: 'Vendor Directory',
  description:
    'Curated directory of research-peptide vendors with trust ratings, testing status, and peptide availability.',
};

export default function VendorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Vendor Directory</h1>
        <p className="text-sm text-text-secondary mt-1">
          Curated list of research-peptide suppliers. Trust ratings, testing status, and
          peptide availability — not medical endorsements.
        </p>
      </div>

      <VendorDirectory />
    </div>
  );
}
