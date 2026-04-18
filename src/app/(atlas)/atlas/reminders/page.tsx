import type { Metadata } from 'next';
import { RemindersClient } from '@/components/reminders/reminders-client';

export const metadata: Metadata = {
  title: 'Reminders',
  description:
    'Schedule peptide dose reminders. Get a push notification when it is time to inject or take your dose.',
};

export default function RemindersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dose Reminders</h1>
        <p className="text-sm text-text-secondary mt-1">
          Never miss a dose. Enable notifications and set reminders that fire on your schedule.
        </p>
      </div>

      <RemindersClient />
    </div>
  );
}
