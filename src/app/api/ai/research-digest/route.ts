/**
 * Generates a research digest for peptides in the user's active protocol.
 * Queries PubMed for the last ~90 days, sends titles + abstracts to Claude
 * for a lay/expert-level summary, persists a ResearchDigest record. Pro+ only.
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { peptides } from '@/data/peptides';
import { fetchRecentArticlesForPeptides, type PubMedArticle } from '@/lib/pubmed';
import { auth } from '@/lib/auth';

export const maxDuration = 60;

const digestSchema = z.object({
  summary: z.string().describe('One-paragraph overview of the most notable recent findings'),
  themes: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        pmids: z.array(z.string()).describe('PubMed IDs supporting this theme'),
      }),
    )
    .describe('2–4 themes that emerge across the recent articles'),
  perArticle: z
    .array(
      z.object({
        pmid: z.string(),
        oneLiner: z
          .string()
          .describe('One sentence describing what this article found, at the user level'),
      }),
    )
    .describe('One takeaway per article in the set'),
});

function levelInstructions(level: string): string {
  if (level === 'advanced') {
    return `Audience: experienced user. Use technical vocabulary (mechanism of action, pharmacokinetics, receptor dynamics). Cite effect sizes and study design where reported. Keep it dense.`;
  }
  if (level === 'intermediate') {
    return `Audience: familiar with peptides. Use moderate technical terms but explain jargon briefly. Balance mechanism with practical implications.`;
  }
  return `Audience: new to peptides. Avoid jargon or define it inline. Frame findings in terms of practical relevance ("this suggests X works better when Y").`;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Sign in required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json().catch(() => ({}));
  const peptideIds: string[] = Array.isArray(body.peptideIds) ? body.peptideIds : [];
  const experienceLevel: string = body.experienceLevel ?? 'intermediate';
  const daysWindow: number = body.days ?? 90;

  const resolved = peptideIds
    .map((id) => peptides.find((p) => p.id === id))
    .filter((p): p is (typeof peptides)[number] => !!p);

  if (resolved.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid peptideIds' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const searchTerms = resolved.flatMap((p) => [p.name, p.fullName].filter(Boolean) as string[]);
  let articles: PubMedArticle[] = [];
  try {
    articles = await fetchRecentArticlesForPeptides(searchTerms, daysWindow, 4);
  } catch (err) {
    console.error('PubMed fetch failed:', err);
  }

  if (articles.length === 0) {
    return new Response(
      JSON.stringify({
        summary: `No new PubMed articles in the last ${daysWindow} days for: ${resolved.map((p) => p.name).join(', ')}. Try a longer time window.`,
        themes: [],
        perArticle: [],
        articles: [],
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  const articleBlock = articles
    .map(
      (a) =>
        `[PMID ${a.pmid}] (${a.year ?? '—'}) ${a.title}\nJournal: ${a.journal}\nAuthors: ${a.authors.join(', ') || '—'}\nAbstract: ${a.abstract || '(no abstract)'}\n`,
    )
    .join('\n');

  const system = `You are PeptideAtlas Research Digest. Summarize recent peptide research for a user.
${levelInstructions(experienceLevel)}

Rules:
1. Only reference what's in the provided articles. Do not hallucinate findings.
2. Prefer specific results (doses, percentages, study sizes) when reported.
3. If an article is preclinical (in-vitro or rodent), say so.
4. Group 2–4 emerging themes. Not every article needs to fit — skip weak/off-topic ones.
5. Each perArticle entry should be one sentence, actionable and grounded.`;

  const userPrompt = `Peptides in focus: ${resolved.map((p) => p.name).join(', ')}.

Recent articles (last ${daysWindow} days):
${articleBlock}

Generate a summary, emerging themes, and per-article one-liners.`;

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system,
    prompt: userPrompt,
    schema: digestSchema,
    maxOutputTokens: 2048,
  });

  return new Response(
    JSON.stringify({
      ...result.object,
      articles,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
