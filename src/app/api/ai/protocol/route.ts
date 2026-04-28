import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { PROTOCOL_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { auth } from '@/lib/auth';
import { buildUserContext } from '@/lib/ai/user-context';

export const maxDuration = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const { goals, experience, preferences, userContext: clientContext } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  // auth(req) accepts Bearer tokens (mobile) or falls back to cookies (web).
  const session = await auth(req);
  const serverContext = session?.user?.id ? await buildUserContext(session.user.id) : '';
  const fullContext = `${serverContext}${typeof clientContext === 'string' ? clientContext : ''}`;

  const goalsList = Array.isArray(goals) ? goals.join(', ') : (goals ?? '');
  const userTurn = `Generate a personalized peptide protocol for someone with the following profile:
Goals: ${goalsList}
Experience Level: ${experience}
${preferences ? `Preferences: ${preferences}` : ''}

Use the USER PROFILE block above (if present) to personalize — do not re-ask information already known. Provide a detailed, structured protocol recommendation that accounts for their conditions, allergies, active protocol, and recent journal data.`;

  // Use messages instead of prompt because Amplify's compute Lambda streams the
  // messages-based codepath reliably; the prompt-based shortcut was hanging until
  // the 30s hard timeout hit.
  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `${PROTOCOL_SYSTEM_PROMPT}${fullContext}`,
    messages: [{ role: 'user', content: userTurn }],
    maxOutputTokens: 1500,
  });

  return result.toTextStreamResponse({ headers: CORS_HEADERS });
}
