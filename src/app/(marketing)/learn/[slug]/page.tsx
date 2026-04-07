import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { getPostBySlug, getPostSlugs, getLatestPosts } from '@/lib/blog';
import { mdxComponents } from '@/components/blog/mdx-components';
import { BlogCard } from '@/components/blog/blog-card';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found | PeptideAtlas' };
  return {
    title: `${post.title} | PeptideAtlas`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getLatestPosts(4).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-12">
        {/* Main Article */}
        <article className="max-w-3xl">
          {/* Meta */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/40">
              <span className="rounded-full bg-[#00d4ff]/10 px-3 py-1 text-xs font-medium text-[#00d4ff]">
                {post.category.replace(/-/g, ' ')}
              </span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span>{post.readingTime}</span>
              <span>by {post.author}</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/[0.04] px-2.5 py-1 text-xs text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="prose-dark">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
                },
              }}
            />
          </div>

          {/* Disclaimer */}
          <div className="mt-12 rounded-xl border border-[#ff6b35]/20 bg-[#ff6b35]/[0.04] p-6">
            <h4 className="mb-2 text-sm font-semibold text-[#ff6b35]">
              Medical Disclaimer
            </h4>
            <p className="text-sm leading-relaxed text-white/50">
              This article is for educational and informational purposes only. It
              is not intended as medical advice, diagnosis, or treatment. Always
              consult a qualified healthcare professional before starting any
              peptide protocol or supplement regimen.
            </p>
          </div>
        </article>

        {/* Sidebar TOC (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h4 className="mb-4 text-sm font-semibold text-white/40">
              In This Article
            </h4>
            <p className="text-xs text-white/20">
              Scroll through the article to navigate sections.
            </p>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 text-2xl font-semibold text-white">
            Related Articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
