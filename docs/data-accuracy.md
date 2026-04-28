# Data Accuracy & Audit Workflow

The peptide catalog at `src/data/peptides.ts` is the source of truth for every AI surface. Inaccurate dose ranges, missed contraindications, or hallucinated PMIDs are real safety issues. This doc describes the tooling and conventions for keeping the catalog honest.

## Confidence model

Every peptide entry has two optional fields on the `Peptide` type:

```ts
type DataConfidence = 'verified' | 'likely' | 'preliminary';

interface Peptide {
  // ...other fields
  lastReviewedAt?: string;     // ISO date
  confidence?: DataConfidence; // defaults to 'preliminary' if absent
}
```

| Value | Meaning | UI badge |
|---|---|---|
| `verified` | Claims cross-checked against PubMed; PMIDs validated; reviewed within 6 months | 🟢 Green "Verified" |
| `likely` | Primary claims sourced; machine-audited by Claude Opus + manual spot-fix; PMIDs verified or removed | 🔵 Blue "Sourced" |
| `preliminary` (default) | Written from general knowledge; needs review | 🟠 Orange "Needs review" |

Mobile's peptide detail surfaces the confidence chip next to the evidence-level chip; "Reviewed Apr 2026" appears below the title when `lastReviewedAt` is set.

## The 5 audit scripts

All scripts live in `scripts/` and are runnable via `tsx`. Each is idempotent and writes a JSON report to `scripts/`.

### 1. `audit-peptides.ts` — Claude Opus accuracy review

```bash
ANTHROPIC_API_KEY=... npx tsx scripts/audit-peptides.ts                 # audit all
ANTHROPIC_API_KEY=... npx tsx scripts/audit-peptides.ts bpc-157 tb-500  # audit specific
ANTHROPIC_API_KEY=... npx tsx scripts/audit-peptides.ts --limit 5       # audit first 5
```

Sends each peptide entry to Claude Opus 4.7 with a structured fact-check prompt. Writes `scripts/peptide-audit.json` with severity-ranked issues per peptide:

```
critical = wrong dose range, fabricated PMID, missed serious contraindication
high     = significant factual error in description, effects, side effects
medium   = claim stronger than evidence supports; inconsistent ratings
low      = wording / typo / minor framing
```

Resume support: re-runs without args use the existing report as a cache; re-runs with explicit IDs always re-audit those.

Cost: ~$1-2 in Opus tokens per full pass over 33 peptides.

### 2. `verify-pmids.ts` — PubMed citation verifier

```bash
npx tsx scripts/verify-pmids.ts                       # verify all
npx tsx scripts/verify-pmids.ts --peptide bpc-157     # verify one
```

Hits NCBI E-utilities (`esummary`) for every PMID cited in `keyStudies`. Confirms the PMID exists and that its real title/year on PubMed matches what we claim. Writes `scripts/pmid-verification.json`:

```
ok        — PMID exists; title+year match
year_off  — PMID exists; year differs by more than 1
title_off — PMID exists; title differs significantly
not_found — PMID returns no record (likely fabricated)
```

Rate-limited to 1 req per 400ms to stay under NCBI's 3 req/sec cap (no API key required).

### 3. `suggest-pmids.ts` — replacement proposer

For each PMID flagged `title_off` or `not_found` by the verifier, queries PubMed by the cited title and proposes the correct PMID. Writes `scripts/pmid-suggestions.json` and a markdown delta `scripts/pmid-suggestions.md`:

```
high_confidence    — ≥70% title overlap, ≤1 year off
medium_confidence  — 40-70% overlap
no_match           — no good replacement (the cited title may itself
                     be hallucinated; remove the citation manually)
```

### 4. `clean-bad-pmids.ts` — automatic citation cleanup

Reads the verifier report, walks `peptides.ts` line-by-line, drops every `keyStudies` entry whose PMID is not `ok`. Idempotent. Run after the verifier to strip fabricated citations:

```bash
npx tsx scripts/clean-bad-pmids.ts
```

The script preserves empty `keyStudies: []` arrays so the schema field stays present (UI handles empty).

### 5. `tag-confidence.ts` — bulk tag entries

Walks `peptides.ts` and adds `lastReviewedAt: today` + `confidence: 'likely'` to every entry that doesn't already have these fields. Run after a manual review pass to mark entries as reviewed:

```bash
npx tsx scripts/tag-confidence.ts
```

The 3 GLP-1 entries already tagged `verified` keep their tag (script only fills missing fields).

## Workflow when adding a new peptide

1. Add the entry to `src/data/peptides.ts` with verified PMIDs from your literature review
2. Set `confidence: 'verified'` and `lastReviewedAt: 'YYYY-MM-DD'`
3. `cp src/data/peptides.ts mobile/data/peptides.ts` (mobile mirrors the source)
4. Run `npx tsx scripts/verify-pmids.ts --peptide <new-id>` to confirm citations
5. Run `npx tsx scripts/audit-peptides.ts <new-id>` for an Opus accuracy review
6. Address any critical/high audit findings before committing

## Workflow when fixing existing peptides

1. Pick a peptide from `peptide-audit.json` with `overallRating: 'issues_found'`
2. Apply the suggested fixes (rating downgrades, missing contraindications, dose corrections)
3. Update `lastReviewedAt: today`; bump `confidence` to `'likely'` if not already
4. `cp src/data/peptides.ts mobile/data/peptides.ts`
5. Re-run `npx tsx scripts/audit-peptides.ts <peptide-id>` to confirm the fixes resolved the flagged issues
6. Commit with a descriptive message naming the peptide and the change

## Current state (2026-04-28)

After the first accuracy sprint:

- **33 peptides** in catalog (was 30; added Semaglutide, Tirzepatide, Retatrutide)
- **8 of 38 PMIDs verify clean** (the 7 on the new GLP-1s + 1 surviving on ipamorelin); 30 fabricated PMIDs were removed
- **3 verified** entries (GLP-1 family); **30 likely** entries; **0 preliminary**
- **219 audit issues** logged; 11 high-impact peptides hand-tightened (BPC-157, MK-677, CJC-1295, AOD-9604, GHK-Cu, Ipamorelin, Melanotan-II, Oxytocin, GHRP-2, GHRP-6, Hexarelin, LL-37, TB-500); remaining medium/low fixes tracked in `peptide-audit.json` for clinical review

## Re-running the audit

After any catalog change, re-run the audit:

```bash
ANTHROPIC_API_KEY=... npx tsx scripts/audit-peptides.ts
npx tsx scripts/verify-pmids.ts
```

The reports update in place. Diff the JSON to see if accuracy improved or regressed.
