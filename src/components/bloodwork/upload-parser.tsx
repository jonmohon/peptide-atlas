'use client';

/**
 * Bloodwork PDF/image upload + AI parse button.
 * Handles file selection, base64 encoding, and /api/ai/parse-bloodwork call.
 * On success, emits the parsed BloodworkParse so the parent page can pre-fill the add form.
 */

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PremiumGate } from '@/components/auth/premium-gate';
import { cn } from '@/lib/utils';
import type { BloodworkParse } from '@/lib/ai/schemas';

interface Props {
  onParsed: (parsed: BloodworkParse) => void;
}

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

export function BloodworkUploadParser({ onParsed }: Props) {
  return (
    <PremiumGate
      feature="bloodwork_ai"
      fallback={
        <div className="glass rounded-2xl p-5 text-center border border-purple-400/20">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-400/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-foreground">Auto-parse lab PDFs (Pro+)</h3>
          <p className="text-xs text-text-secondary mt-1 mb-3">
            Drop a Quest, LabCorp, or any lab PDF/image. Claude extracts every marker into your
            tracker in seconds, then interprets them in context of your peptides.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30"
          >
            Upgrade to Pro+
          </Link>
        </div>
      }
    >
      <UploadParserInner onParsed={onParsed} />
    </PremiumGate>
  );
}

function UploadParserInner({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setFileName(file.name);

    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file. Use PDF, PNG, JPEG, or WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB.');
      return;
    }

    setParsing(true);
    try {
      const fileBase64 = await fileToBase64(file);
      const res = await fetch('/api/ai/parse-bloodwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64,
          mediaType: file.type,
          fileName: file.name,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Parse failed (${res.status})`);
      }
      const parsed = (await res.json()) as BloodworkParse;
      if (!parsed.markers || parsed.markers.length === 0) {
        throw new Error('No markers found. Is this a lab report?');
      }
      onParsed(parsed);
      setFileName(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed');
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'glass rounded-2xl p-6 text-center cursor-pointer transition-all border-2 border-dashed',
          dragging
            ? 'border-purple-400/60 bg-purple-400/5'
            : 'border-white/[0.1] hover:border-purple-400/40 hover:bg-white/[0.02]',
          parsing && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-400/10 flex items-center justify-center">
          {parsing ? (
            <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16V8m0 0l-4 4m4-4l4 4m-4 12a10 10 0 110-20 10 10 0 010 20z"
              />
            </svg>
          )}
        </div>
        <div className="text-sm font-semibold text-foreground">
          {parsing
            ? `Parsing ${fileName ?? 'file'}...`
            : 'Drop a lab PDF, or click to upload'}
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Quest, LabCorp, or any scan up to 10 MB. Claude extracts every marker automatically.
        </p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}
