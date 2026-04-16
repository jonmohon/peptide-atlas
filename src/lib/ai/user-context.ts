import { cookies } from 'next/headers';
import { runWithAmplifyServerContext } from '@/lib/amplify-server';
import { getCurrentUser } from 'aws-amplify/auth/server';

/**
 * Builds a personalized context string for AI prompts.
 * Fetches user profile + recent journal data via REST-like approach
 * to avoid server-side GraphQL client complexities.
 *
 * Returns a ~1-2K token block injected into the system prompt.
 */
export async function buildUserContext(userId: string): Promise<string> {
  try {
    // For now, build context from what we can access server-side.
    // The full implementation will use a dedicated API route to fetch user data.
    // This lightweight version just confirms the user exists and returns basic context.

    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!currentUser?.userId) return '';

    // Basic context from Cognito user info
    const sections: string[] = [];
    sections.push(`USER ID: ${currentUser.userId}`);
    if (currentUser.signInDetails?.loginId) {
      sections.push(`Email: ${currentUser.signInDetails.loginId}`);
    }

    // The full user profile (goals, conditions, journal data) is fetched
    // client-side and will be passed as part of the request body to AI endpoints
    // in a future update. For now, this confirms the user identity.

    if (sections.length === 0) return '';
    return `\n--- USER CONTEXT ---\n${sections.join('\n')}\n--- END USER CONTEXT ---\n`;
  } catch {
    return '';
  }
}
