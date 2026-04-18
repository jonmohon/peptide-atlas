'use client';

/**
 * Progress photos UI. Upload to S3 via Amplify Storage, record a ProgressPhoto,
 * run /api/ai/photo-observation on the new upload, and render a gallery timeline.
 * Pro+ gated — Pro free-tier tier sees an upgrade prompt.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { dataClient } from '@/lib/amplify-data';
import { PremiumGate } from '@/components/auth/premium-gate';
import { maybeUnlock } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type Photo = Schema['ProgressPhoto']['type'];
type Angle = 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'OTHER';

const ANGLE_LABELS: Record<Angle, string> = {
  FRONT: 'Front',
  BACK: 'Back',
  SIDE_LEFT: 'Left side',
  SIDE_RIGHT: 'Right side',
  OTHER: 'Other',
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function urlFromS3(key: string): Promise<string | null> {
  try {
    const { url } = await getUrl({ path: key, options: { expiresIn: 900 } });
    return url.toString();
  } catch (err) {
    console.error('getUrl failed:', err);
    return null;
  }
}

export function PhotosClient() {
  return (
    <PremiumGate
      feature="journal_photos"
      fallback={
        <div className="glass rounded-2xl p-8 text-center border border-purple-400/20">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-purple-400/10 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground">Progress Photos (Pro+)</h3>
          <p className="text-sm text-text-secondary mt-2 mb-4 max-w-md mx-auto">
            Upload front/back/side photos each month. Claude vision compares each new upload to
            your baseline and writes objective observations of visible changes.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30"
          >
            Upgrade to Pro+
          </Link>
        </div>
      }
    >
      <PhotosInner />
    </PremiumGate>
  );
}

function PhotosInner() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [angle, setAngle] = useState<Angle>('FRONT');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      await getCurrentUser();
    } catch {
      setLoading(false);
      return;
    }
    try {
      const { data } = await dataClient.models.ProgressPhoto.list();
      const sorted = [...(data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
      setPhotos(sorted);

      const entries = await Promise.all(
        sorted.map(async (p) => [p.id, await urlFromS3(p.s3Key)] as const),
      );
      const next: Record<string, string> = {};
      for (const [id, u] of entries) if (u) next[id] = u;
      setUrls(next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFile(file: File) {
    setError(null);
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Use PNG, JPEG, or WEBP.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image exceeds 8 MB.');
      return;
    }

    setUploading(true);
    setProgress(0);
    const today = new Date().toISOString().split('T')[0];

    try {
      const user = await getCurrentUser();
      const ext = file.type.split('/')[1];
      const key = `progress-photos/${user.userId}/${today}-${angle}-${Date.now()}.${ext}`;

      const base64 = await fileToBase64(file);

      await uploadData({
        path: key,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) setProgress(Math.round((transferredBytes / totalBytes) * 100));
          },
        },
      }).result;

      const baseline = photos.find((p) => p.angle === angle);
      let baselineBlock: { base64: string; mediaType: string; date?: string } | null = null;
      if (baseline) {
        try {
          const baselineUrl = await urlFromS3(baseline.s3Key);
          if (baselineUrl) {
            const res = await fetch(baselineUrl);
            const blob = await res.blob();
            const b64 = await fileToBase64(new File([blob], 'baseline', { type: blob.type }));
            baselineBlock = {
              base64: b64,
              mediaType: blob.type,
              date: baseline.date ?? undefined,
            };
          }
        } catch {
          // Baseline load failed — proceed without comparison
        }
      }

      let aiObservation: string | null = null;
      let aiComparison: string | null = null;
      try {
        const res = await fetch('/api/ai/photo-observation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photo: {
              base64,
              mediaType: file.type,
              angle,
              date: today,
            },
            baseline: baselineBlock,
            weight: weight ? Number(weight) : undefined,
            bodyFat: bodyFat ? Number(bodyFat) : undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (baselineBlock) aiComparison = data.observation;
          else aiObservation = data.observation;
        }
      } catch {
        // AI observation is best-effort
      }

      await dataClient.models.ProgressPhoto.create({
        date: today,
        s3Key: key,
        angle,
        weight: weight ? Number(weight) : null,
        bodyFat: bodyFat ? Number(bodyFat) : null,
        notes: notes || null,
        aiObservation,
        aiComparison,
      });
      await maybeUnlock('FIRST_PHOTO');

      setWeight('');
      setBodyFat('');
      setNotes('');
      await load();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function deletePhoto(p: Photo) {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    try {
      await remove({ path: p.s3Key }).catch(() => undefined);
      await dataClient.models.ProgressPhoto.delete({ id: p.id });
      await load();
    } catch (err) {
      console.error(err);
    }
  }

  const selected = selectedId ? photos.find((p) => p.id === selectedId) : null;

  if (loading) {
    return <div className="h-48 glass rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Upload new photo</h2>
        <div className="grid md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Angle</label>
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value as Angle)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
            >
              {(Object.keys(ANGLE_LABELS) as Angle[]).map((a) => (
                <option key={a} value={a} className="bg-[#111827]">
                  {ANGLE_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
              placeholder="optional"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Body fat %</label>
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
              placeholder="optional"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
              placeholder="optional"
            />
          </div>
        </div>

        <label
          className={cn(
            'block rounded-xl p-8 text-center cursor-pointer transition-all border-2 border-dashed',
            uploading
              ? 'border-purple-400/40 bg-purple-400/5 pointer-events-none'
              : 'border-white/[0.1] hover:border-purple-400/40 hover:bg-white/[0.02]',
          )}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          {uploading ? (
            <div>
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <div className="text-xs text-text-secondary">
                Uploading {progress}%... AI observation will appear after upload completes.
              </div>
            </div>
          ) : (
            <div>
              <svg
                className="w-8 h-8 mx-auto mb-2 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-sm font-semibold text-foreground">
                Click or drop an image here
              </div>
              <div className="text-xs text-text-secondary mt-1">PNG / JPEG / WEBP · up to 8 MB</div>
            </div>
          )}
        </label>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Gallery */}
      {photos.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-text-secondary">No photos yet. Upload one to begin.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {photos.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'glass rounded-xl overflow-hidden text-left transition-all',
                selectedId === p.id
                  ? 'ring-1 ring-purple-400/40 shadow-[0_0_15px_rgba(192,132,252,0.12)]'
                  : 'hover:bg-white/[0.04]',
              )}
            >
              {urls[p.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urls[p.id]}
                  alt={`Progress ${p.date}`}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-white/[0.03] animate-pulse" />
              )}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {p.angle && (
                    <span className="text-[10px] text-text-secondary">
                      {ANGLE_LABELS[p.angle as Angle] ?? p.angle}
                    </span>
                  )}
                </div>
                {(p.weight != null || p.bodyFat != null) && (
                  <div className="text-[10px] text-text-secondary mt-0.5">
                    {p.weight != null && `${p.weight} lbs`}
                    {p.weight != null && p.bodyFat != null && ' · '}
                    {p.bodyFat != null && `${p.bodyFat}% BF`}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail */}
      {selected && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {ANGLE_LABELS[selected.angle as Angle] ?? selected.angle}
                {selected.weight != null && ` · ${selected.weight} lbs`}
                {selected.bodyFat != null && ` · ${selected.bodyFat}% BF`}
              </p>
            </div>
            <button
              onClick={() => deletePhoto(selected)}
              className="text-xs text-text-secondary hover:text-red-400"
            >
              Delete
            </button>
          </div>
          {selected.aiComparison && (
            <div className="rounded-xl p-3 bg-purple-400/5 border border-purple-400/20 mb-2">
              <div className="text-[10px] font-semibold text-purple-400 mb-1 uppercase tracking-wider">
                Comparison to baseline
              </div>
              <p className="text-xs text-text-secondary whitespace-pre-wrap">
                {selected.aiComparison}
              </p>
            </div>
          )}
          {selected.aiObservation && (
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">
                Observation
              </div>
              <p className="text-xs text-text-secondary whitespace-pre-wrap">
                {selected.aiObservation}
              </p>
            </div>
          )}
          {selected.notes && (
            <div className="mt-2 text-xs text-text-secondary">
              <span className="font-semibold">Notes:</span> {selected.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
