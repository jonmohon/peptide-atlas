/**
 * Peptide catalog accuracy audit.
 *
 *   tsx scripts/audit-peptides.ts                    # audit all
 *   tsx scripts/audit-peptides.ts bpc-157 tb-500     # audit specific IDs
 *   tsx scripts/audit-peptides.ts --limit 5          # audit first 5
 *
 * For each peptide, sends the full entry to Claude Opus 4.7 and asks for a
 * structured fact-check. Output is written to scripts/peptide-audit.json
 * with one entry per peptide, severity-ranked issues and an overall rating.
 *
 * Issues are grouped by:
 *   critical — wrong dose range, missed contraindication, fabricated PMID
 *   high     — significant factual error in mechanism / effects / side effects
 *   medium   — claim too strong for cited evidence; ratings inconsistent
 *   low      — typo, formatting, minor wording
 *
 * Requires ANTHROPIC_API_KEY in env.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Anthropic } from '@anthropic-ai/sdk';
import { peptides } from '../src/data/peptides';
import type { Peptide } from '../src/types/peptide';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is required.');
  process.exit(1);
}

const client = new Anthropic({ apiKey });
const MODEL = 'claude-opus-4-7';
const OUT_FILE = join(__dirname, 'peptide-audit.json');

const args = process.argv.slice(2);
const limitArgIdx = args.indexOf('--limit');
const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1] ?? '0', 10) : null;
const explicitIds = args.filter((a) => !a.startsWith('--') && a !== String(limit));

const target: Peptide[] = (() => {
  if (explicitIds.length > 0) {
    return peptides.filter((p) => explicitIds.includes(p.id));
  }
  if (limit && limit > 0) {
    return peptides.slice(0, limit);
  }
  return peptides;
})();

const SYSTEM_PROMPT = `You are a peptide research auditor. You receive a single catalog entry from the Peptide Atlas database and must fact-check it against the published peptide literature you know.

Output ONLY valid JSON matching this exact shape (no commentary, no markdown fences):

{
  "peptideId": string,
  "overallRating": "accurate" | "mostly_accurate" | "issues_found" | "major_concerns",
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "field": string,
      "issue": string,
      "suggestion": string
    }
  ]
}

Severity rubric:
- critical = wrong dose range that could cause harm; fabricated PMID; missed serious contraindication; mechanism described as opposite of reality
- high = significant factual error in description, effects, or side effects; PMID year wrong by more than 1; cited study doesn't say what we claim
- medium = claim stronger than evidence supports (e.g. evidence rating 9 but only preclinical data); inconsistent ratings; missing well-known side effect
- low = wording, typo, missing minor information

Field rubric (use these exact field names):
- "description", "dosing.typicalDose", "dosing.frequency", "dosing.cycleLength", "dosing.route", "halfLifeHours", "evidenceLevel", "ratings.evidence", "ratings.efficacy", "ratings.safety", "effects", "affectedRegions", "sideEffects", "contraindications", "interactions", "keyStudies[N].pmid", "keyStudies[N].title", "keyStudies[N].finding", "timeline"

For PMIDs:
- Verify the format is plausible (8 digits, recent ones can be smaller)
- If you know the actual paper at that PMID, verify the title and year match
- Flag fabricated PMIDs as critical

For dose ranges:
- Cross-check against the established literature for safe + effective dosing
- Flag any range that is dangerous (too high) or sub-therapeutic (too low) as critical or high

Be thorough. If the entry is genuinely accurate, return {issues: []} with overallRating: "accurate".`;

type Issue = {
  severity: 'critical' | 'high' | 'medium' | 'low';
  field: string;
  issue: string;
  suggestion: string;
};

type AuditEntry = {
  peptideId: string;
  overallRating: 'accurate' | 'mostly_accurate' | 'issues_found' | 'major_concerns';
  issues: Issue[];
  auditedAt: string;
  model: string;
};

async function auditOne(peptide: Peptide): Promise<AuditEntry> {
  const userMsg = `Audit this catalog entry:\n\n${JSON.stringify(peptide, null, 2)}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Strip ```json fences if present.
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '').trim();

  const parsed = JSON.parse(cleaned) as Omit<AuditEntry, 'auditedAt' | 'model'>;
  return {
    ...parsed,
    auditedAt: new Date().toISOString(),
    model: MODEL,
  };
}

async function main() {
  console.log(`Auditing ${target.length} peptide${target.length === 1 ? '' : 's'} with ${MODEL}...`);

  // Resume support: load any existing report and skip already-audited entries
  // unless explicit IDs were passed (in which case re-audit those).
  let existing: Record<string, AuditEntry> = {};
  if (existsSync(OUT_FILE) && explicitIds.length === 0) {
    try {
      const raw = readFileSync(OUT_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as { entries: AuditEntry[] };
      existing = Object.fromEntries(parsed.entries.map((e) => [e.peptideId, e]));
    } catch {
      // start fresh
    }
  }

  const results: AuditEntry[] = [];
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const [i, p] of target.entries()) {
    if (existing[p.id] && explicitIds.length === 0) {
      console.log(`  [${i + 1}/${target.length}] ${p.id} — cached`);
      results.push(existing[p.id]);
      continue;
    }
    process.stdout.write(`  [${i + 1}/${target.length}] ${p.id}...`);
    try {
      const audit = await auditOne(p);
      results.push(audit);
      const counts = audit.issues.reduce(
        (acc, x) => {
          acc[x.severity]++;
          return acc;
        },
        { critical: 0, high: 0, medium: 0, low: 0 } as Record<Issue['severity'], number>
      );
      critical += counts.critical;
      high += counts.high;
      medium += counts.medium;
      low += counts.low;
      console.log(
        ` ${audit.overallRating} (${counts.critical}c/${counts.high}h/${counts.medium}m/${counts.low}l)`
      );
    } catch (e) {
      console.log(` FAILED: ${(e as Error).message}`);
      results.push({
        peptideId: p.id,
        overallRating: 'major_concerns',
        issues: [
          {
            severity: 'high',
            field: 'audit',
            issue: `Audit failed: ${(e as Error).message}`,
            suggestion: 'Re-run audit for this peptide.',
          },
        ],
        auditedAt: new Date().toISOString(),
        model: MODEL,
      });
    }
  }

  // Merge with existing entries that weren't re-audited.
  const merged = explicitIds.length === 0
    ? { ...existing, ...Object.fromEntries(results.map((r) => [r.peptideId, r])) }
    : Object.fromEntries(results.map((r) => [r.peptideId, r]));

  const finalEntries = Object.values(merged).sort((a, b) => a.peptideId.localeCompare(b.peptideId));

  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        model: MODEL,
        catalogSize: peptides.length,
        auditedCount: finalEntries.length,
        summary: {
          critical,
          high,
          medium,
          low,
          accurate: finalEntries.filter((e) => e.overallRating === 'accurate').length,
          mostly_accurate: finalEntries.filter((e) => e.overallRating === 'mostly_accurate').length,
          issues_found: finalEntries.filter((e) => e.overallRating === 'issues_found').length,
          major_concerns: finalEntries.filter((e) => e.overallRating === 'major_concerns').length,
        },
        entries: finalEntries,
      },
      null,
      2
    )
  );

  console.log('');
  console.log(`Done. Wrote ${OUT_FILE}`);
  console.log(`Issues this run: ${critical} critical / ${high} high / ${medium} medium / ${low} low`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
