/**
 * Slug helpers for shareable URLs. Keeps non-ASCII out, truncates to ~50 chars,
 * appends a short random suffix for uniqueness.
 */

export function slugify(text: string, maxBaseLen = 48): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxBaseLen) || 'protocol';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
