import type { Metadata } from 'next';
import { InventoryClient } from '@/components/inventory/inventory-client';

export const metadata: Metadata = {
  title: 'Inventory',
  description:
    'Your on-hand peptide vials — reconstitution status, expiry tracking, and reorder shortcuts.',
};

export default function InventoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm text-text-secondary mt-1">
          What&apos;s on your shelf. Reconstituted vials are flagged with remaining shelf life.
        </p>
      </div>

      <InventoryClient />
    </div>
  );
}
