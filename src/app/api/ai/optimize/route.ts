import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { STACK_OPTIMIZER_PROMPT } from '@/lib/ai/prompts';
import { stackAnalysisSchema } from '@/lib/ai/schemas';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 20;

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
  const { peptideIds, cycleContext, userContext: clientContext } = (await req.json()) as {
    peptideIds: string[];
    cycleContext?: CycleContext;
    userContext?: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stackPeptides = peptideIds
    .map((id: string) => peptides.find((p) => p.id === id))
    .filter((p): p is (typeof peptides)[number] => !!p);

  const stackDescription = stackPeptides
    .map((p) => `${p.name}: ${p.description} Effects: ${p.effects.join(', ')}`)
    .join('\n');

  const session = await auth();
  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const userContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

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
    system: `${STACK_OPTIMIZER_PROMPT}${userContext}`,
    prompt: `Analyze this peptide stack:\n${stackDescription}${cyclePrompt}`,
    schema: stackAnalysisSchema,
    maxOutputTokens: 1536,
  });

  return new Response(JSON.stringify(result.object), {
    headers: { 'Content-Type': 'application/json' },
  });
}
