import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { BlogPost, BlogPostMeta } from '@/types/blog';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function parseMdxFile(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, '');
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    category: data.category ?? '',
    excerpt: data.excerpt ?? '',
    coverImage: data.coverImage,
    author: data.author ?? 'PeptideAtlas Team',
    tags: data.tags ?? [],
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));

  return files
    .map((f) => {
      const { content: _, ...meta } = parseMdxFile(f);
      return meta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parseMdxFile(`${slug}.mdx`);
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export function getLatestPosts(count: number): BlogPostMeta[] {
  return getAllPosts().slice(0, count);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  getAllPosts().forEach((p) => cats.add(p.category));
  return Array.from(cats).sort();
}
