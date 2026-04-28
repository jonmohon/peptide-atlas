/**
 * Shared CORS headers + OPTIONS handler for the /api/ai/* routes.
 *
 * Mobile (RN) doesn't enforce CORS so these headers aren't strictly required
 * for it, but they also let any browser caller hit the same routes for
 * future web extensions (browser extensions, embeds, etc.).
 */

export const AI_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function aiOptions() {
  return new Response(null, { status: 204, headers: AI_CORS_HEADERS });
}
