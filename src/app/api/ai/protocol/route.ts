import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { PROTOCOL_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { goals, experience, preferences, userContext: clientContext } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const session = await auth();
  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const prompt = `Generate a personalized peptide protocol for someone with the following profile:
Goals: ${goals.join(', ')}
Experience Level: ${experience}
${preferences ? `Preferences: ${preferences}` : ''}

Use the USER PROFILE block above (if present) to personalize — do not re-ask information already known. Provide a detailed, structured protocol recommendation that accounts for their conditions, allergies, active protocol, and recent journal data.`;

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${PROTOCOL_SYSTEM_PROMPT}${fullContext}`,
    prompt,
    maxOutputTokens: 2048,
  });

  return result.toTextStreamResponse();
}
