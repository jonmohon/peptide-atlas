/**
 * PMID verifier — hits NCBI E-utilities to confirm every PMID cited in the
 * peptide catalog actually exists, and that its real title/year match what
 * the catalog claims.
 *
 *   tsx scripts/verify-pmids.ts                # verify every PMID
 *   tsx scripts/verify-pmids.ts --peptide bpc-157
 *
 * Output: scripts/pmid-verification.json with a status per cited study:
 *   ok          — PMID exists; title+year match
 *   year_off    — PMID exists; year differs by more than 1
 *   title_off   — PMID exists; title differs significantly from PubMed's
 *   not_found   — PMID returns no record on PubMed (likely fabricated)
 *   error       — couldn't fetch (network/rate-limit)
 *
 * NCBI rate limit without an API key is ~3 req/sec. We sleep 400ms between
 * requests to stay well under it.
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { peptides } from '../src/data/peptides';

const OUT_FILE = join(__dirname, 'pmid-verification.json');

const args = process.argv.slice(2);
const peptideArg = args.indexOf('--peptide');
const onlyPeptide = peptideArg !== -1 ? args[peptideArg + 1] : null;

type VerifyStatus = 'ok' | 'year_off' | 'title_off' | 'not_found' | 'error';

type VerifyResult = {
  peptideId: string;
  pmid: string;
  cited: { title: string; year: number };
  pubmed?: { title: string; year: number; journal?: string };
  status: VerifyStatus;
  detail?: string;
};

async function fetchPmid(pmid: string): Promise<{ title: string; year: number; journal?: string } | null> {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${encodeURIComponent(pmid)}&retmode=json`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    result?: Record<string, { title?: string; pubdate?: string; fulljournalname?: string; uid?: string }>;
  };
  const record = json.result?.[pmid];
  if (!record || !record.title) return null;
  const yearMatch = record.pubdate?.match(/(\d{4})/);
  return {
    title: record.title,
    year: yearMatch ? parseInt(yearMatch[1], 10) : 0,
    journal: record.fulljournalname,
  };
}

function normalize(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a: string, b: string): number {
  // Token overlap ratio. 1.0 = identical bag-of-words, 0 = disjoint.
  const ta = new Set(normalize(a).split(' ').filter((w) => w.length > 2));
  const tb = new Set(normalize(b).split(' ').filter((w) => w.length > 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const w of ta) if (tb.has(w)) overlap++;
  return overlap / Math.max(ta.size, tb.size);
}

async function main() {
  const target = onlyPeptide ? peptides.filter((p) => p.id === onlyPeptide) : peptides;
  const results: VerifyResult[] = [];

  console.log(`Verifying PMIDs for ${target.length} peptide(s)...`);
  let totalChecked = 0;
  let okCount = 0;
  let issueCount = 0;

  for (const peptide of target) {
    const studies = peptide.keyStudies ?? [];
    for (const study of studies) {
      totalChecked++;
      process.stdout.write(`  ${peptide.id} → PMID ${study.pmid}... `);
      try {
        const pubmed = await fetchPmid(study.pmid);
        if (!pubmed) {
          results.push({
            peptideId: peptide.id,
            pmid: study.pmid,
            cited: { title: study.title, year: study.year },
            status: 'not_found',
            detail: 'PubMed returned no record for this PMID',
          });
          console.log('NOT FOUND');
          issueCount++;
        } else {
          const sim = titleSimilarity(study.title, pubmed.title);
          const yearDiff = Math.abs(pubmed.year - study.year);

          let status: VerifyStatus = 'ok';
          let detail: string | undefined;
          if (yearDiff > 1) {
            status = 'year_off';
            detail = `Cited year ${study.year}, PubMed year ${pubmed.year}`;
          } else if (sim < 0.4) {
            status = 'title_off';
            detail = `Title overlap ${(sim * 100).toFixed(0)}%; PubMed: "${pubmed.title}"`;
          }

          results.push({
            peptideId: peptide.id,
            pmid: study.pmid,
            cited: { title: study.title, year: study.year },
            pubmed,
            status,
            detail,
          });

          if (status === 'ok') {
            okCount++;
            console.log(`OK (${pubmed.year}, ${(sim * 100).toFixed(0)}% title match)`);
          } else {
            issueCount++;
            console.log(`${status.toUpperCase()} — ${detail}`);
          }
        }
      } catch (e) {
        results.push({
          peptideId: peptide.id,
          pmid: study.pmid,
          cited: { title: study.title, year: study.year },
          status: 'error',
          detail: (e as Error).message,
        });
        console.log(`ERROR — ${(e as Error).message}`);
      }
      // Rate limit: NCBI default is 3 req/sec without API key.
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        catalogSize: peptides.length,
        totalChecked,
        ok: okCount,
        issues: issueCount,
        byStatus: {
          ok: results.filter((r) => r.status === 'ok').length,
          year_off: results.filter((r) => r.status === 'year_off').length,
          title_off: results.filter((r) => r.status === 'title_off').length,
          not_found: results.filter((r) => r.status === 'not_found').length,
          error: results.filter((r) => r.status === 'error').length,
        },
        results,
      },
      null,
      2
    )
  );

  console.log('');
  console.log(`Done. Wrote ${OUT_FILE}`);
  console.log(`Checked ${totalChecked} PMIDs: ${okCount} OK, ${issueCount} with issues`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
