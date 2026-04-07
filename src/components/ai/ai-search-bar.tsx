'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { peptides } from '@/data/peptides';

interface SearchResult {
  peptideId: string;
  relevanceScore: number;
  explanation: string;
}

export function AISearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      // Local fuzzy search first (always)
      const localResults = peptides
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.fullName.toLowerCase().includes(q.toLowerCase()) ||
            p.effects.some((e) => e.includes(q.toLowerCase())) ||
            p.description.toLowerCase().includes(q.toLowerCase())
        )
        .map((p) => ({
          peptideId: p.id,
          relevanceScore: p.name.toLowerCase().includes(q.toLowerCase()) ? 10 : 7,
          explanation: p.description.substring(0, 80) + '...',
        }))
        .slice(0, 6);

      setResults(localResults);
      setIsOpen(true);

      // If natural language query (contains spaces, question mark), try AI search
      if (useAI && (q.includes(' ') || q.includes('?'))) {
        setIsSearching(true);
        try {
          const res = await fetch('/api/ai/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q }),
          });
          if (res.ok) {
            const data = await res.json();
            setResults(data.results?.slice(0, 6) ?? localResults);
          }
        } catch {
          // Fall back to local results
        } finally {
          setIsSearching(false);
        }
      }
    },
    [useAI]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search peptides or ask a question..."
          className="w-full pl-10 pr-20 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 transition-all placeholder:text-text-secondary"
        />
        <button
          onClick={() => setUseAI(!useAI)}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors',
            useAI
              ? 'bg-medical-500 text-white'
              : 'bg-surface-dim text-text-secondary hover:bg-medical-50'
          )}
        >
          AI {useAI ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg py-1 max-h-80 overflow-y-auto">
          {isSearching && (
            <div className="px-3 py-2 text-xs text-medical-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-medical-500 border-t-transparent rounded-full animate-spin" />
              Searching with AI...
            </div>
          )}
          {results.map((result) => {
            const peptide = peptides.find((p) => p.id === result.peptideId);
            if (!peptide) return null;
            return (
              <a
                key={result.peptideId}
                href={`/peptides/${peptide.slug}`}
                className="block px-3 py-2.5 hover:bg-surface-dim transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{peptide.name}</span>
                  <span className="text-[10px] text-text-secondary capitalize px-1.5 py-0.5 bg-surface-dim rounded">
                    {peptide.category.replace(/-/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                  {result.explanation}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
