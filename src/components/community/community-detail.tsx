'use client';

/**
 * Community protocol detail — loads by slug, shows content, upvote button (one-per-user),
 * comment list + add, and a "Remix this" button that copies into user's SavedProtocol.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type Protocol = Schema['CommunityProtocol']['type'];
type Comment = Schema['CommunityProtocolComment']['type'];

interface Props {
  slug: string;
}

export function CommunityDetail({ slug }: Props) {
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [myUpvoteId, setMyUpvoteId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [remixBusy, setRemixBusy] = useState(false);
  const [remixStatus, setRemixStatus] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [slug]);

  async function load() {
    try {
      const { data: list } = await dataClient.models.CommunityProtocol.list({
        filter: { slug: { eq: slug } },
      });
      const p = list?.[0] ?? null;
      setProtocol(p);

      try {
        const user = await getCurrentUser();
        setCurrentUserId(user.userId);
        setCurrentUsername(user.username ?? null);
      } catch {
        // Not signed in — treat as anonymous viewer
      }

      if (p) {
        const me = await safeUserId();
        const { data: cmts } = await dataClient.models.CommunityProtocolComment.list({
          filter: { protocolId: { eq: p.id } },
          limit: 100,
        });
        setComments(
          (cmts ?? []).sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')),
        );

        const { data: upvotes } = await dataClient.models.CommunityProtocolUpvote.list({
          filter: { protocolId: { eq: p.id } },
          limit: 100,
        });
        const mine = me ? upvotes?.find((u) => u.voterId === me) : undefined;
        setMyUpvoteId(mine?.id ?? null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function safeUserId(): Promise<string | null> {
    try {
      const u = await getCurrentUser();
      return u.userId;
    } catch {
      return null;
    }
  }

  async function toggleUpvote() {
    if (!protocol || !currentUserId) return;

    if (myUpvoteId) {
      try {
        await dataClient.models.CommunityProtocolUpvote.delete({ id: myUpvoteId });
        setMyUpvoteId(null);
        await dataClient.models.CommunityProtocol.update({
          id: protocol.id,
          upvoteCount: Math.max(0, (protocol.upvoteCount ?? 0) - 1),
        });
        setProtocol({ ...protocol, upvoteCount: Math.max(0, (protocol.upvoteCount ?? 0) - 1) });
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const { data: up } = await dataClient.models.CommunityProtocolUpvote.create({
          protocolId: protocol.id,
          voterId: currentUserId,
        });
        if (up) setMyUpvoteId(up.id);
        await dataClient.models.CommunityProtocol.update({
          id: protocol.id,
          upvoteCount: (protocol.upvoteCount ?? 0) + 1,
        });
        setProtocol({ ...protocol, upvoteCount: (protocol.upvoteCount ?? 0) + 1 });
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function addComment() {
    if (!protocol || !currentUserId || !commentText.trim()) return;
    setCommenting(true);
    try {
      const { data: c } = await dataClient.models.CommunityProtocolComment.create({
        protocolId: protocol.id,
        authorId: currentUserId,
        authorName: currentUsername,
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
        flagged: false,
      });
      if (c) setComments((prev) => [...prev, c]);
      setCommentText('');
      await dataClient.models.CommunityProtocol.update({
        id: protocol.id,
        commentCount: (protocol.commentCount ?? 0) + 1,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCommenting(false);
    }
  }

  async function remix() {
    if (!protocol) return;
    setRemixBusy(true);
    setRemixStatus(null);
    try {
      await dataClient.models.SavedProtocol.create({
        name: `Remix of ${protocol.name}`,
        goals: (protocol.goals ?? []).filter(Boolean) as string[],
        experience: protocol.experience,
        content: protocol.content,
      });
      setRemixStatus('Added to your Saved Protocols ✓');
    } catch (err) {
      console.error(err);
      setRemixStatus('Remix failed');
    } finally {
      setRemixBusy(false);
      setTimeout(() => setRemixStatus(null), 4000);
    }
  }

  if (loading) {
    return <div className="glass h-96 rounded-2xl animate-pulse" />;
  }

  if (!protocol) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="text-sm text-text-secondary">Protocol not found.</p>
        <Link
          href="/atlas/community"
          className="inline-block mt-3 text-xs text-neon-cyan hover:underline"
        >
          ← Back to community
        </Link>
      </div>
    );
  }

  const peptideLabels = (protocol.peptideIds ?? [])
    .filter(Boolean)
    .map((id) => peptides.find((p) => p.id === id)?.name ?? id);

  const contentObj = protocol.content as
    | { overview?: string; peptides?: Array<{ name: string; role?: string; dosage?: string; frequency?: string; duration?: string }>; timeline?: Array<{ week: string; milestone: string }>; expectedResults?: string[]; warnings?: string[] }
    | null;

  return (
    <div className="space-y-4">
      <Link href="/atlas/community" className="text-xs text-text-secondary hover:text-neon-cyan">
        ← Back to community
      </Link>

      <div className="glass-bright rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">{protocol.name}</h1>
            <p className="text-xs text-text-secondary mt-1">
              by {protocol.authorName ?? 'Atlas user'} · {protocol.experience}
              {typeof protocol.durationWeeks === 'number' && ` · ${protocol.durationWeeks} weeks`}
            </p>
            {protocol.description && (
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                {protocol.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={toggleUpvote}
              disabled={!currentUserId}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                myUpvoteId
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'bg-white/[0.05] text-text-secondary border border-white/[0.08] hover:bg-white/[0.08]',
                !currentUserId && 'opacity-50 cursor-not-allowed',
              )}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 15L12 8L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              {protocol.upvoteCount ?? 0}
            </button>
            <button
              onClick={remix}
              disabled={remixBusy || !currentUserId}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 disabled:opacity-50"
            >
              {remixStatus ?? (remixBusy ? 'Adding...' : 'Remix')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {(protocol.goals ?? []).filter(Boolean).map((g) => (
            <span
              key={g as string}
              className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
            >
              #{g}
            </span>
          ))}
        </div>
      </div>

      {/* Peptides */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
          Peptides
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {peptideLabels.map((name) => (
            <span
              key={name}
              className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-text-secondary border border-white/[0.06]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      {contentObj && (
        <div className="glass rounded-2xl p-5 space-y-4">
          {contentObj.overview && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Overview
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{contentObj.overview}</p>
            </div>
          )}
          {contentObj.peptides?.length && contentObj.peptides.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Dosing
              </h3>
              <div className="space-y-1.5">
                {contentObj.peptides.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {p.role && <>{p.role} · </>}
                      {p.dosage} {p.frequency && <>· {p.frequency}</>}{' '}
                      {p.duration && <>· {p.duration}</>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {contentObj.timeline && contentObj.timeline.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Timeline
              </h3>
              <ul className="space-y-1 text-xs text-text-secondary">
                {contentObj.timeline.map((t, i) => (
                  <li key={i}>
                    <span className="font-semibold text-foreground">{t.week}</span> — {t.milestone}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {contentObj.expectedResults && contentObj.expectedResults.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Expected results
              </h3>
              <ul className="list-disc pl-4 text-xs text-text-secondary space-y-0.5">
                {contentObj.expectedResults.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {contentObj.warnings && contentObj.warnings.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                Warnings
              </h3>
              <ul className="list-disc pl-4 text-xs text-text-secondary space-y-0.5">
                {contentObj.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Author's journal summary */}
      {protocol.journalSummary && (
        <div className="glass rounded-2xl p-5 border border-neon-green/20">
          <h3 className="text-xs font-semibold text-neon-green uppercase tracking-wider mb-2">
            Author&apos;s journal summary
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {protocol.journalSummary}
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
          Comments ({comments.length})
        </h3>
        {currentUserId && (
          <div className="flex items-start gap-2 mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience or question..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-cyan/50 resize-none"
            />
            <button
              onClick={addComment}
              disabled={commenting || !commentText.trim()}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                commentText.trim() && !commenting
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30'
                  : 'bg-white/[0.04] text-text-secondary cursor-not-allowed',
              )}
            >
              {commenting ? '...' : 'Post'}
            </button>
          </div>
        )}
        {comments.length === 0 ? (
          <p className="text-xs text-text-secondary">Be the first to comment.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg p-3 bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {c.authorName ?? 'Atlas user'}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : ''}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
