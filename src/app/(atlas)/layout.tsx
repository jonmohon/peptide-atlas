import { redirect } from 'next/navigation';
import { AtlasShell } from '@/components/layout/atlas-shell';
import { OnboardingGate } from '@/components/onboarding/onboarding-gate';
import { isAuthenticated } from '@/lib/auth';

/**
 * Server-side auth gate for the entire atlas section. Every route nested under
 * (atlas) — dashboard, journal, peptides, body-map, stacks, compare, etc — is
 * protected and requires a signed-in Cognito session.
 *
 * Anonymous users hitting any /atlas/* URL get redirected to /auth/signin with
 * the original URL preserved in `?next=` so they land back where they were
 * heading after login.
 */
export default async function AtlasLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAuthenticated();
  if (!ok) {
    redirect('/auth/signin?next=/atlas');
  }

  return (
    <AtlasShell>
      {children}
      <OnboardingGate />
    </AtlasShell>
  );
}
