import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { STACK_OPTIMIZER_PROMPT } from '@/lib/ai/prompts';
import { stackAnalysisSchema } from '@/lib/ai/schemas';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';
import { AI_CORS_HEADERS, aiOptions } from '@/lib/ai/cors';
import { badRequest, enforceInputLimits, hardenedSystemPrompt, outputBudget } from '@/lib/ai/safety';

export const maxDuration = 20;
export const OPTIONS = aiOptions;

interface CycleContext {
  durationWeeks: number;
  entries: Array<{
    peptide: string;
    startWeek: number;
    durationWeeks: number;
    pattern: string;
    dose: string;
  }>;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS } }
    );
  }

  const session = await auth(req);
  const tier = session?.user?.tier ?? 'FREE';

  const body = (await req.json()) as {
    peptideIds: string[];
    cycleContext?: CycleContext;
    userContext?: string;
  };
  const { peptideIds, cycleContext, userContext: clientContext } = body;

  const limit = enforceInputLimits(body, tier);
  if (!limit.ok) return badRequest(limit.reason, AI_CORS_HEADERS);

  if (!Array.isArray(peptideIds) || peptideIds.length === 0 || peptideIds.length > 8) {
    return badRequest('peptideIds must be an array of 1–8 catalog IDs', AI_CORS_HEADERS);
  }

  const stackPeptides = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter((p): p is (typeof peptides)[number] => !!p);
  if (stackPeptides.length === 0) {
    return badRequest('No valid catalog peptides supplied', AI_CORS_HEADERS);
  }

  const stackDescription = stackPeptides
    .map((p) => `${p.name}: ${p.description} Effects: ${p.effects.join(', ')}`)
    .join('\n');

  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const cyclePrompt = cycleContext
    ? `\n\nCycle plan (${cycleContext.durationWeeks} weeks total):\n` +
      cycleContext.entries
        .map(
          (e) =>
            `- ${e.peptide}: weeks ${e.startWeek}-${e.startWeek + e.durationWeeks - 1}, pattern ${e.pattern}, dose ${e.dose}`,
        )
        .join('\n') +
      `\n\nFactor in timing, sequencing, and overlap. Call out receptor-desensitization risk, redundant weeks, missed washout periods, and beneficial sequencing. Use week numbers in synergies/issues/suggestions.`
    : '';

  const result = await generateObject({
    model: anthropic('claude-sonnet-4-6'),
    system: hardenedSystemPrompt(STACK_OPTIMIZER_PROMPT, fullContext),
    prompt: `Analyze this peptide stack:\n${stackDescription}${cyclePrompt}`,
    schema: stackAnalysisSchema,
    maxOutputTokens: outputBudget(tier, 1500),
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json', ...AI_CORS_HEADERS },
  });
}
