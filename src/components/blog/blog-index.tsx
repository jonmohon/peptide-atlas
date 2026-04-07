'use client';

import { useState, useMemo } from 'react';
import type { BlogPostMeta } from '@/types/blog';
import { BlogCard } from './blog-card';
import { useChatStore } from '@/stores/use-chat-store';

interface BlogIndexProps {
  posts: BlogPostMeta[];
  categories: string[];
}

export function BlogIndex({ posts, categories }: BlogIndexProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, activeCategory]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white sm:text-5xl">
          Learn
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/50">
          Educational articles on peptides, protocols, safety, and the science
          behind them.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#00d4ff]/40"
        />
      </div>

      {/* AI Suggestion Chips */}
      <div className="mx-auto mb-6 max-w-xl flex flex-wrap justify-center gap-2">
        {[
          'What are the safest peptides for beginners?',
          'Best peptide stack for recovery?',
          'How does BPC-157 compare to TB-500?',
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => useChatStore.getState().openWithText(suggestion)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#00d4ff]/20 bg-[#00d4ff]/[0.05] px-3 py-1.5 text-xs text-[#00d4ff] transition-colors hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/40"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            {suggestion}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
              : 'bg-white/[0.04] text-white/50 hover:text-white/70'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                : 'bg-white/[0.04] text-white/50 hover:text-white/70'
            }`}
          >
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-white/40">
          <p className="text-lg">No articles found.</p>
          <p className="mt-1 text-sm">Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
