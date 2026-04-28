/**
 * One-shot cleanup: removes fabricated PMID citations from peptides.ts.
 *
 * Reads scripts/pmid-verification.json, builds a set of bad PMIDs, then
 * scans peptides.ts line-by-line and drops any keyStudies entry whose
 * pmid is in the bad set. If a peptide ends up with an empty keyStudies
 * array, the array stays as `keyStudies: [],` so the schema field is
 * preserved (UI handles empty arrays).
 *
 * Usage: tsx scripts/clean-bad-pmids.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'src', 'data', 'peptides.ts');
const VERIFY = join(__dirname, 'pmid-verification.json');
const MOBILE = join(__dirname, '..', 'mobile', 'data', 'peptides.ts');

type VerifyResult = {
  results: Array<{ pmid: string; status: string }>;
};

const verify = JSON.parse(readFileSync(VERIFY, 'utf-8')) as VerifyResult;
const badPmids = new Set(
  verify.results.filter((r) => r.status !== 'ok').map((r) => r.pmid)
);

console.log(`Found ${badPmids.size} bad PMIDs to remove.`);

const src = readFileSync(SRC, 'utf-8');
const lines = src.split('\n');
const cleaned: string[] = [];
let removed = 0;

for (const line of lines) {
  // Match a single keyStudies entry line: `      { pmid: 'XXXXXXXX', ... },`
  const m = line.match(/^\s*\{\s*pmid:\s*'([^']+)'/);
  if (m && badPmids.has(m[1])) {
    removed++;
    continue;
  }
  cleaned.push(line);
}

writeFileSync(SRC, cleaned.join('\n'));
writeFileSync(MOBILE, cleaned.join('\n'));

console.log(`Removed ${removed} fabricated study citations.`);
console.log('Wrote cleaned file to:');
console.log(`  ${SRC}`);
console.log(`  ${MOBILE}`);
