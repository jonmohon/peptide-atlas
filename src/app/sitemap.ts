import type { MetadataRoute } from 'next';
import { getPostSlugs } from '@/lib/blog';
import { peptides } from '@/data/peptides';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://peptideatlas.ai';

  const staticPages = [
    '',
    '/learn',
    '/about',
    '/glossary',
    '/faq',
    '/privacy',
    '/terms',
    '/atlas',
  ];

  const peptidePages = peptides.map((p) => `/atlas/peptides/${p.slug}`);
  const blogPages = getPostSlugs().map((s) => `/learn/${s}`);

  return [...staticPages, ...peptidePages, ...blogPages].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
}
