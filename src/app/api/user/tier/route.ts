/**
 * GET /api/user/tier — returns the authenticated user's current tier (FREE/PRO/PRO_PLUS).
 * Unauthenticated requests receive { tier: 'FREE' } rather than an error.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ tier: 'FREE' });
  }
  return NextResponse.json({ tier: session.user.tier });
}
