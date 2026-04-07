import Link from 'next/link';
import type { BlogPostMeta } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/learn/${post.slug}`} className="group block">
      <article className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00d4ff]/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)]">
        {/* Category & Reading Time */}
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="rounded-full bg-[#00d4ff]/10 px-3 py-1 text-xs font-medium text-[#00d4ff]">
            {post.category.replace(/-/g, ' ')}
          </span>
          <span className="text-white/40">{post.readingTime}</span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-[#00d4ff]">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-white/50">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Date & Author */}
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-xs text-white/30">
          <span>{post.author}</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </article>
    </Link>
  );
}
