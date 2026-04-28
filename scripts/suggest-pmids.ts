/**
 * For every PMID flagged title_off / not_found by verify-pmids.ts, search
 * PubMed by the cited title and propose the correct PMID. The result is a
 * machine-readable proposals.json + a markdown delta the human can audit
 * before applying.
 *
 *   tsx scripts/suggest-pmids.ts
 *
 * Output: scripts/pmid-suggestions.json + scripts/pmid-suggestions.md
 *
 * Strategy per flagged citation:
 *   1. esearch with the cited title as the query
 *   2. Walk the top 5 results. Score by title-overlap and year proximity to
 *      the cited year. Pick the best.
 *   3. If no result clears a 60% title overlap threshold AND ≤1 year off,
 *      mark as no_match — human will need to handle manually (or remove
 *      the citation).
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const VERIFY_FILE = join(__dirname, 'pmid-verification.json');
const OUT_JSON = join(__dirname, 'pmid-suggestions.json');
const OUT_MD = join(__dirname, 'pmid-suggestions.md');

type VerifyEntry = {
  peptideId: string;
  pmid: string;
  cited: { title: string; year: number };
  pubmed?: { title: string; year: number; journal?: string };
  status: 'ok' | 'year_off' | 'title_off' | 'not_found' | 'error';
  detail?: string;
};

type SearchHit = { pmid: string; title: string; year: number };

type Suggestion = {
  peptideId: string;
  citedPmid: string;
  citedTitle: string;
  citedYear: number;
  status: 'high_confidence' | 'medium_confidence' | 'no_match';
  proposedPmid?: string;
  proposedTitle?: string;
  proposedYear?: number;
  titleOverlap?: number;
  yearDiff?: number;
  candidates?: SearchHit[];
};

function normalize(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a: string, b: string): number {
  const ta = new Set(normalize(a).split(' ').filter((w) => w.length > 2));
  const tb = new Set(normalize(b).split(' ').filter((w) => w.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const w of ta) if (tb.has(w)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

async function esearchByTitle(title: string): Promise<string[]> {
  // Quote the title to encourage phrase matching, drop very short words.
  const cleaned = title.replace(/[^\w\s-]/g, ' ').trim();
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleaned + '[Title]')}&retmax=5&retmode=json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const json = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  return json.esearchresult?.idlist ?? [];
}

async function fetchSummaries(pmids: string[]): Promise<Record<string, SearchHit>> {
  if (pmids.length === 0) return {};
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return {};
  const json = (await res.json()) as {
    result?: Record<string, { title?: string; pubdate?: string; uid?: string }>;
  };
  const out: Record<string, SearchHit> = {};
  for (const id of pmids) {
    const r = json.result?.[id];
    if (!r?.title) continue;
    const yearMatch = r.pubdate?.match(/(\d{4})/);
    out[id] = {
      pmid: id,
      title: r.title,
      year: yearMatch ? parseInt(yearMatch[1], 10) : 0,
    };
  }
  return out;
}

async function suggestFor(entry: VerifyEntry): Promise<Suggestion> {
  const ids = await esearchByTitle(entry.cited.title);
  await sleep(400);
  const summaries = await fetchSummaries(ids);
  await sleep(400);

  const candidates: SearchHit[] = [];
  for (const id of ids) {
    const s = summaries[id];
    if (s) candidates.push(s);
  }

  // Score: title similarity first, year proximity tiebreaker.
  const scored = candidates.map((c) => ({
    ...c,
    sim: titleSimilarity(entry.cited.title, c.title),
    yearDiff: Math.abs(c.year - entry.cited.year),
  }));
  scored.sort((a, b) => {
    if (a.sim !== b.sim) return b.sim - a.sim;
    return a.yearDiff - b.yearDiff;
  });

  const best = scored[0];
  if (!best || best.sim < 0.4) {
    return {
      peptideId: entry.peptideId,
      citedPmid: entry.pmid,
      citedTitle: entry.cited.title,
      citedYear: entry.cited.year,
      status: 'no_match',
      candidates: scored.slice(0, 3),
    };
  }

  const status = best.sim >= 0.7 && best.yearDiff <= 1 ? 'high_confidence' : 'medium_confidence';

  return {
    peptideId: entry.peptideId,
    citedPmid: entry.pmid,
    citedTitle: entry.cited.title,
    citedYear: entry.cited.year,
    status,
    proposedPmid: best.pmid,
    proposedTitle: best.title,
    proposedYear: best.year,
    titleOverlap: Math.round(best.sim * 100) / 100,
    yearDiff: best.yearDiff,
    candidates: scored.slice(0, 3),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const verify = JSON.parse(readFileSync(VERIFY_FILE, 'utf-8')) as { results: VerifyEntry[] };
  const flagged = verify.results.filter((r) => r.status !== 'ok');

  console.log(`Suggesting replacements for ${flagged.length} flagged PMIDs...`);

  const suggestions: Suggestion[] = [];
  let high = 0;
  let medium = 0;
  let none = 0;

  for (const [i, entry] of flagged.entries()) {
    process.stdout.write(`  [${i + 1}/${flagged.length}] ${entry.peptideId} :: PMID ${entry.pmid}... `);
    try {
      const suggestion = await suggestFor(entry);
      suggestions.push(suggestion);
      if (suggestion.status === 'high_confidence') {
        high++;
        console.log(`HIGH → PMID ${suggestion.proposedPmid} (${suggestion.proposedYear}, ${(suggestion.titleOverlap! * 100).toFixed(0)}% match)`);
      } else if (suggestion.status === 'medium_confidence') {
        medium++;
        console.log(`MEDIUM → PMID ${suggestion.proposedPmid} (${(suggestion.titleOverlap! * 100).toFixed(0)}% match)`);
      } else {
        none++;
        console.log('NO MATCH');
      }
    } catch (e) {
      console.log(`ERROR: ${(e as Error).message}`);
      suggestions.push({
        peptideId: entry.peptideId,
        citedPmid: entry.pmid,
        citedTitle: entry.cited.title,
        citedYear: entry.cited.year,
        status: 'no_match',
      });
    }
  }

  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        flagged: flagged.length,
        high_confidence: high,
        medium_confidence: medium,
        no_match: none,
        suggestions,
      },
      null,
      2
    )
  );

  // Markdown summary
  const md: string[] = [`# PMID replacement proposals`, '', `Generated: ${new Date().toISOString()}`, ''];
  md.push(`- ${high} high-confidence replacements (≥70% title overlap, ≤1 year off)`);
  md.push(`- ${medium} medium-confidence (40–70% overlap)`);
  md.push(`- ${none} no good match (manual review or remove citation)`);
  md.push('');

  const byPeptide = new Map<string, Suggestion[]>();
  for (const s of suggestions) {
    const arr = byPeptide.get(s.peptideId) ?? [];
    arr.push(s);
    byPeptide.set(s.peptideId, arr);
  }

  for (const [peptideId, items] of [...byPeptide.entries()].sort()) {
    md.push(`## ${peptideId}`);
    for (const s of items) {
      md.push('');
      md.push(`- **Cited PMID ${s.citedPmid}** (${s.citedYear}) — _${s.citedTitle}_`);
      if (s.status === 'no_match') {
        md.push(`  - **No match found.** Remove or replace manually.`);
      } else {
        md.push(`  - **${s.status === 'high_confidence' ? '✅ HIGH' : '⚠ MEDIUM'}** → PMID ${s.proposedPmid} (${s.proposedYear}, ${(s.titleOverlap! * 100).toFixed(0)}% match)`);
        md.push(`    - PubMed: _${s.proposedTitle}_`);
      }
    }
    md.push('');
  }

  writeFileSync(OUT_MD, md.join('\n'));
  console.log('');
  console.log(`Done. Wrote ${OUT_JSON} and ${OUT_MD}`);
  console.log(`${high} high-confidence, ${medium} medium, ${none} no-match.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
