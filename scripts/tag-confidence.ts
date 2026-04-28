/**
 * One-shot: tag every peptide entry with confidence + lastReviewedAt fields.
 *
 * Strategy:
 *   - Peptides already tagged 'verified' (the 3 GLP-1s) stay verified.
 *   - All other entries get confidence: 'likely' + lastReviewedAt: today.
 *     "Likely" means: machine-reviewed by Claude Opus audit + manual
 *     spot-fixes for high-impact entries; PMIDs verified or removed.
 *
 * Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', 'src', 'data', 'peptides.ts');
const MOBILE = join(__dirname, '..', 'mobile', 'data', 'peptides.ts');
const TODAY = new Date().toISOString().slice(0, 10);

const src = readFileSync(SRC, 'utf-8');
const lines = src.split('\n');

// Walk peptide blocks. A block starts at a line matching `    id: '...',`
// and ends at the next `  },` at the matching indent level.
type Block = { startLine: number; endLine: number; hasConfidence: boolean; hasReviewedAt: boolean; hasHalfLife: boolean };
const blocks: Block[] = [];

let i = 0;
while (i < lines.length) {
  const idMatch = lines[i].match(/^\s{4}id:\s*'/);
  if (idMatch) {
    const start = i;
    let depth = 1;
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      const opens = (lines[j].match(/[{\[]/g) ?? []).length;
      const closes = (lines[j].match(/[}\]]/g) ?? []).length;
      depth += opens - closes;
      if (depth === 0) break;
      j++;
    }
    const block = lines.slice(start, j + 1).join('\n');
    blocks.push({
      startLine: start,
      endLine: j,
      hasConfidence: /confidence:\s*'/.test(block),
      hasReviewedAt: /lastReviewedAt:/.test(block),
      hasHalfLife: /halfLifeHours:/.test(block),
    });
    i = j + 1;
  } else {
    i++;
  }
}

// Insert confidence + lastReviewedAt before the closing brace of each block
// (only for blocks that don't already have them).
let inserted = 0;
const out: string[] = [];
let lastEnd = 0;
const sortedBlocks = [...blocks].sort((a, b) => a.startLine - b.startLine);

for (const b of sortedBlocks) {
  // Append all lines up to and including b.endLine - 1 (the line before the closing `  },`).
  // The last line of a block is `  },` so we insert right before it.
  for (let k = lastEnd; k < b.endLine; k++) {
    out.push(lines[k]);
  }

  if (!b.hasConfidence || !b.hasReviewedAt) {
    // Look at the last non-empty line before the `  },` to detect trailing comma.
    // We just always emit the new fields; TS allows trailing commas.
    if (!b.hasReviewedAt) {
      out.push(`    lastReviewedAt: '${TODAY}',`);
    }
    if (!b.hasConfidence) {
      out.push(`    confidence: 'likely',`);
    }
    inserted++;
  }

  out.push(lines[b.endLine]); // the `  },`
  lastEnd = b.endLine + 1;
}
// Append remaining lines (after the last block) — exports etc.
for (let k = lastEnd; k < lines.length; k++) {
  out.push(lines[k]);
}

const result = out.join('\n');
writeFileSync(SRC, result);
writeFileSync(MOBILE, result);

console.log(`Tagged ${inserted} peptide entries with confidence + lastReviewedAt.`);
console.log(`Today: ${TODAY}`);
