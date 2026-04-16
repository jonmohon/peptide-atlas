import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ tier: 'FREE' });
  }
  return NextResponse.json({ tier: session.user.tier });
}
