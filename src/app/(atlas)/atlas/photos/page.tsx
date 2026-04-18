import type { Metadata } from 'next';
import { PhotosClient } from '@/components/photos/photos-client';

export const metadata: Metadata = {
  title: 'Progress Photos',
  description: 'Track visible changes with date-stamped progress photos and AI-assisted observations.',
};

export default function PhotosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Progress Photos</h1>
        <p className="text-sm text-text-secondary mt-1">
          Upload date-stamped photos. AI compares each upload to your baseline and describes visible
          changes.
        </p>
      </div>

      <PhotosClient />
    </div>
  );
}
