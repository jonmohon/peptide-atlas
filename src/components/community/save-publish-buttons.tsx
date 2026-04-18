'use client';

/**
 * Save-to-account and publish-to-community buttons for a generated protocol.
 * Saves into SavedProtocol; when the user chooses to publish, also writes a
 * CommunityProtocol record with a public slug so others can browse it.
 */

import { useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { PremiumGate } from '@/components/auth/premium-gate';
import { slugify } from '@/lib/slug';
import { peptides } from '@/data/peptides';
import { maybeUnlock } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface Props {
  goals: string[];
  experience: string;
  protocolText: string;
}

function extractPeptideIds(text: string): string[] {
  const lower = text.toLowerCase();
  const matches = new Set<string>();
  for (const p of peptides) {
    if (lower.includes(p.name.toLowerCase()) || lower.includes(p.abbreviation.toLowerCase())) {
      matches.add(p.id);
    }
  }
  return Array.from(matches);
}

export function SavePublishButtons({ goals, experience, protocolText }: Props) {
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [protocolName, setProtocolName] = useState(`Protocol: ${goals.join(', ')}`);
  const [description, setDescription] = useState('');

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await dataClient.models.SavedProtocol.create({
        name: protocolName,
        goals,
        experience,
        content: {
          raw: protocolText,
          generatedAt: new Date().toISOString(),
        },
      });
      await maybeUnlock('FIRST_PROTOCOL');
      setStatus('Saved to your protocols ✓');
    } catch {
      setStatus('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 4000);
    }
  }

  async function publish() {
    if (!protocolName.trim()) {
      setStatus('Name required');
      return;
    }
    setPublishing(true);
    setStatus(null);
    try {
      const user = await getCurrentUser();
      const slug = slugify(protocolName);
      const peptideIds = extractPeptideIds(protocolText);
      await dataClient.models.CommunityProtocol.create({
        authorId: user.userId,
        authorName: user.username ?? null,
        name: protocolName.trim(),
        slug,
        description: description.trim() || null,
        goals,
        experience,
        peptideIds,
        content: {
          raw: protocolText,
        },
        upvoteCount: 0,
        commentCount: 0,
        flaggedCount: 0,
        published: true,
        createdAt: new Date().toISOString(),
      });
      setPublishedSlug(slug);
      setStatus('Published ✓');
      await maybeUnlock('FIRST_PUBLISHED_PROTOCOL');
    } catch (err) {
      console.error(err);
      setStatus('Publish failed');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={save}
          disabled={saving}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            saving
              ? 'bg-white/[0.04] text-text-secondary'
              : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30',
          )}
        >
          {saving ? 'Saving...' : 'Save to my protocols'}
        </button>

        <PremiumGate
          feature="community_publish"
          fallback={
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-400/10 text-purple-400 border border-purple-400/20 hover:bg-purple-400/20"
            >
              Publish to community (Pro+)
            </Link>
          }
        >
          {publishedSlug ? (
            <Link
              href={`/atlas/community/${publishedSlug}`}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30"
            >
              View published →
            </Link>
          ) : (
            <button
              onClick={() => setShowPublishForm((v) => !v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30"
            >
              Publish to community
            </button>
          )}
        </PremiumGate>

        {status && <span className="text-xs text-text-secondary">{status}</span>}
      </div>

      {showPublishForm && !publishedSlug && (
        <div className="space-y-3 pt-3 border-t border-white/[0.06]">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Protocol name</label>
            <input
              type="text"
              value={protocolName}
              onChange={(e) => setProtocolName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Description (what worked, why you recommend it)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional. Share context — how long you ran it, what you felt, bloodwork changes..."
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPublishForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={publish}
              disabled={publishing}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30 disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
          <p className="text-[10px] text-text-secondary/70">
            Published protocols are visible to all signed-in Atlas users. Your username appears as
            the author. Don&apos;t include personal info.
          </p>
        </div>
      )}
    </div>
  );
}
