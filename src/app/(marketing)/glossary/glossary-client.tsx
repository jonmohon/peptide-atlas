'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { GlossaryTerm } from '@/data/glossary';

interface GlossaryClientProps {
  terms: GlossaryTerm[];
}

export function GlossaryClient({ terms }: GlossaryClientProps) {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const lettersWithTerms = useMemo(
    () => new Set(terms.map((t) => t.term[0].toUpperCase())),
    [terms],
  );

  const filtered = useMemo(() => {
    return terms.filter((t) => {
      const matchesSearch =
        !search ||
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesLetter =
        !activeLetter || t.term[0].toUpperCase() === activeLetter;
      return matchesSearch && matchesLetter;
    });
  }, [terms, search, activeLetter]);

  const grouped = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
          Glossary
        </h1>
        <p className="text-lg text-white/50">
          Key terms and concepts in the world of peptides.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-6 max-w-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#00d4ff]/40"
        />
      </div>

      {/* A-Z Navigation */}
      <div className="mb-10 flex flex-wrap justify-center gap-1">
        {alphabet.map((letter) => {
          const has = lettersWithTerms.has(letter);
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              disabled={!has}
              onClick={() =>
                setActiveLetter(isActive ? null : letter)
              }
              className={`flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                  : has
                    ? 'text-white/60 hover:bg-white/[0.04] hover:text-white'
                    : 'cursor-default text-white/15'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Terms */}
      {grouped.length > 0 ? (
        <div className="space-y-10">
          {grouped.map(([letter, letterTerms]) => (
            <section key={letter}>
              <h2 className="mb-4 border-b border-white/[0.06] pb-2 text-lg font-semibold text-[#00d4ff]">
                {letter}
              </h2>
              <dl className="space-y-4">
                {letterTerms.map((t) => (
                  <div key={t.term}>
                    <dt className="font-semibold text-white">{t.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-white/50">
                      {t.definition}
                      {t.relatedPeptide && (
                        <>
                          {' '}
                          <Link
                            href={`/atlas/peptides/${t.relatedPeptide}`}
                            className="text-[#00d4ff] hover:underline"
                          >
                            View peptide →
                          </Link>
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-white/40">
          No terms found matching your search.
        </p>
      )}
    </div>
  );
}
