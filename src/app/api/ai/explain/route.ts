import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { MECHANISM_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { peptides } from '@/data/peptides';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 20;

export async function POST(req: Request) {
  const { peptideId, level = 'intermediate' } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const peptide = peptides.find((p) => p.id === peptideId);
  if (!peptide) {
    return new Response(
      JSON.stringify({ error: 'Peptide not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const prompt = `Explain the mechanism of action for ${peptide.name} (${peptide.fullName}).
Knowledge level: ${level}
Peptide details: ${peptide.description}
Effects: ${peptide.effects.join(', ')}
Affected regions: ${peptide.affectedRegions.map((r) => r.regionId).join(', ')}`;

  const session = await auth();
  const userContext = session?.user?.id ? await buildUserContext(session.user.id) : '';

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${MECHANISM_SYSTEM_PROMPT}${userContext}`,
    prompt,
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
