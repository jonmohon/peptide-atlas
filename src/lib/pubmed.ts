/**
 * Thin PubMed E-utilities wrapper. Searches recent articles by peptide name,
 * then fetches titles + abstracts to feed into Claude for lay/expert summarization.
 * No API key required for low-volume use.
 */

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const FETCH_TIMEOUT_MS = 10000;

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  abstract: string;
  url: string;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function searchPubMed(query: string, days = 90, max = 10): Promise<string[]> {
  const url =
    `${BASE}/esearch.fcgi?db=pubmed&retmode=json` +
    `&term=${encodeURIComponent(`${query}[Title/Abstract]`)}` +
    `&reldate=${days}&datetype=pdat&retmax=${max}&sort=pub+date`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const data = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  return data.esearchresult?.idlist ?? [];
}

function parseFetchText(text: string): PubMedArticle[] {
  const records = text.split(/\n\n(?=PMID- )/);
  return records
    .map((block) => parseRecord(block))
    .filter((a): a is PubMedArticle => a !== null);
}

function parseRecord(block: string): PubMedArticle | null {
  const lines = block.split(/\n/);
  const fields: Record<string, string[]> = {};
  let currentTag = '';
  for (const line of lines) {
    const match = line.match(/^([A-Z]{2,4})\s?-\s(.*)$/);
    if (match) {
      currentTag = match[1];
      if (!fields[currentTag]) fields[currentTag] = [];
      fields[currentTag].push(match[2]);
    } else if (line.startsWith('      ') && currentTag) {
      const last = fields[currentTag];
      if (last.length > 0) last[last.length - 1] += ' ' + line.trim();
    }
  }

  const pmid = fields.PMID?.[0];
  if (!pmid) return null;

  const title = fields.TI?.join(' ').trim() || 'Untitled';
  const abstract = fields.AB?.join('\n').trim() || '';
  const journal = fields.JT?.[0] ?? fields.TA?.[0] ?? '';
  const authors = (fields.AU ?? []).slice(0, 3);
  const yearRaw = fields.DP?.[0] ?? fields.EDAT?.[0] ?? '';
  const yearMatch = yearRaw.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : null;

  return {
    pmid,
    title,
    authors,
    journal,
    year,
    abstract,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
  };
}

export async function fetchPubMedArticles(pmids: string[]): Promise<PubMedArticle[]> {
  if (pmids.length === 0) return [];
  const url =
    `${BASE}/efetch.fcgi?db=pubmed` +
    `&id=${pmids.join(',')}` +
    `&retmode=text&rettype=medline`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return [];
  const text = await res.text();
  return parseFetchText(text);
}

export async function fetchRecentArticlesForPeptides(
  peptideNames: string[],
  days = 90,
  maxPerPeptide = 4,
): Promise<PubMedArticle[]> {
  const seen = new Set<string>();
  const results: PubMedArticle[] = [];

  for (const name of peptideNames) {
    const pmids = await searchPubMed(name, days, maxPerPeptide);
    const fresh = pmids.filter((p) => !seen.has(p));
    fresh.forEach((p) => seen.add(p));
    if (fresh.length === 0) continue;
    const articles = await fetchPubMedArticles(fresh);
    results.push(...articles);
  }

  return results;
}
