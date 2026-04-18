'use client';

/**
 * Research Digest UI — picks peptides, generates an AI summary from recent PubMed articles,
 * and renders themes + per-article takeaways. Past digests are persisted + browsable.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { peptides } from '@/data/peptides';
import { PremiumGate } from '@/components/auth/premium-gate';
import { cn } from '@/lib/utils';
import type { Schema } from '@/lib/amplify-data';

type Digest = Schema['ResearchDigest']['type'];

interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  abstract: string;
  url: string;
}

interface DigestResult {
  summary: string;
  themes: Array<{ title: string; summary: string; pmids: string[] }>;
  perArticle: Array<{ pmid: string; oneLiner: string }>;
  articles: PubMedArticle[];
}

export function ResearchClient() {
  return (
    <PremiumGate
      feature="research_digest"
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-foreground">Research Digest (Pro+)</h3>
          <p className="text-sm text-text-secondary mt-2 mb-4 max-w-lg mx-auto">
            Each week, Claude pulls recent PubMed papers on the peptides in your protocol and
            distills them at your experience level. Stay current without reading a hundred
            abstracts.
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
      <ResearchInner />
    </PremiumGate>
  );
}

function ResearchInner() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate',
  );
  const [days, setDays] = useState(90);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<DigestResult | null>(null);
  const [past, setPast] = useState<Digest[]>([]);

  const peptidesById = useMemo(
    () => Object.fromEntries(peptides.map((p) => [p.id, p] as const)),
    [],
  );

  useEffect(() => {
    loadProfileAndPast();
  }, []);

  async function loadProfileAndPast() {
    try {
      await getCurrentUser();
    } catch {
      return;
    }
    try {
      const [profileRes, digestsRes] = await Promise.all([
        dataClient.models.UserProfile.list(),
        dataClient.models.ResearchDigest.list(),
      ]);
      const profile = profileRes.data?.[0];
      if (profile?.experienceLevel) {
        const lvl = profile.experienceLevel.toLowerCase();
        if (lvl === 'beginner' || lvl === 'intermediate' || lvl === 'advanced') {
          setExperience(lvl);
        }
      }
      const sorted = (digestsRes.data ?? []).sort((a, b) =>
        (b.generatedAt ?? '').localeCompare(a.generatedAt ?? ''),
      );
      setPast(sorted);
    } catch (err) {
      console.error(err);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generate() {
    if (selected.size === 0) {
      setError('Pick at least one peptide.');
      return;
    }
    setError(null);
    setGenerating(true);
    setCurrent(null);
    try {
      const res = await fetch('/api/ai/research-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peptideIds: Array.from(selected),
          experienceLevel: experience,
          days,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Digest failed (${res.status})`);
      }
      const digest = (await res.json()) as DigestResult;
      setCurrent(digest);

      if (digest.articles.length > 0) {
        await dataClient.models.ResearchDigest.create({
          generatedAt: new Date().toISOString(),
          peptideIds: Array.from(selected),
          experienceLevel: experience,
          summary: digest.summary,
          articles: digest,
          viewed: true,
        });
        loadProfileAndPast();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Digest failed');
    } finally {
      setGenerating(false);
    }
  }

  function loadPast(d: Digest) {
    setCurrent(d.articles as unknown as DigestResult);
    setSelected(new Set((d.peptideIds ?? []).filter(Boolean) as string[]));
    if (d.experienceLevel === 'beginner' || d.experienceLevel === 'intermediate' || d.experienceLevel === 'advanced') {
      setExperience(d.experienceLevel);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Peptides to include
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {peptides.map((p) => (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                  selected.has(p.id)
                    ? 'bg-purple-400/20 text-purple-400 border-purple-400/30'
                    : 'bg-white/[0.03] text-text-secondary border-white/[0.06] hover:bg-white/[0.06]',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Experience level
            </label>
            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value as 'beginner' | 'intermediate' | 'advanced')
              }
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
            >
              <option value="beginner" className="bg-[#111827]">
                Beginner
              </option>
              <option value="intermediate" className="bg-[#111827]">
                Intermediate
              </option>
              <option value="advanced" className="bg-[#111827]">
                Advanced
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Time window</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-sm text-foreground"
            >
              <option value={30} className="bg-[#111827]">
                Last 30 days
              </option>
              <option value={90} className="bg-[#111827]">
                Last 90 days
              </option>
              <option value={180} className="bg-[#111827]">
                Last 6 months
              </option>
              <option value={365} className="bg-[#111827]">
                Last year
              </option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-text-secondary">
            Results cached in your account · takes ~20–40s
          </p>
          <button
            onClick={generate}
            disabled={generating || selected.size === 0}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
              generating || selected.size === 0
                ? 'bg-white/[0.04] text-text-secondary cursor-not-allowed'
                : 'bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30',
            )}
          >
            {generating ? 'Generating...' : 'Generate digest'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Current digest */}
      {current && (
        <div className="space-y-4">
          <div className="glass-bright rounded-2xl p-5 border border-purple-400/20">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
              Summary
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{current.summary}</p>
          </div>

          {current.themes?.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              {current.themes.map((t, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{t.summary}</p>
                  {t.pmids?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.pmids.map((id) => (
                        <a
                          key={id}
                          href={`https://pubmed.ncbi.nlm.nih.gov/${id}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-purple-400 hover:bg-white/[0.08]"
                        >
                          {id}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {current.articles?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                Articles ({current.articles.length})
              </h3>
              <div className="space-y-3">
                {current.articles.map((a) => {
                  const oneLiner =
                    current.perArticle?.find((p) => p.pmid === a.pmid)?.oneLiner ?? null;
                  return (
                    <div
                      key={a.pmid}
                      className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-foreground hover:text-purple-400 transition-colors leading-snug"
                        >
                          {a.title}
                        </a>
                        <span className="text-[10px] text-text-secondary whitespace-nowrap">
                          PMID {a.pmid}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-secondary mt-1">
                        {a.authors.join(', ')} · {a.journal} · {a.year ?? '—'}
                      </div>
                      {oneLiner && (
                        <p className="text-xs text-text-secondary mt-2 italic">↳ {oneLiner}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past digests */}
      {past.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
            Past digests
          </h3>
          <div className="space-y-2">
            {past.slice(0, 20).map((d) => (
              <button
                key={d.id}
                onClick={() => loadPast(d)}
                className="w-full text-left rounded-lg p-3 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {d.generatedAt
                      ? new Date(d.generatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Digest'}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {(d.peptideIds ?? []).filter(Boolean).length} peptides · {d.experienceLevel}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {d.summary}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {((d.peptideIds ?? []).filter(Boolean) as string[]).slice(0, 6).map((pid) => (
                    <span
                      key={pid}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-text-secondary"
                    >
                      {peptidesById[pid]?.name ?? pid}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
