'use client';

/**
 * Client-side gate that checks UserProfile.onboardingCompleted and shows the
 * OnboardingModal on first visit to /atlas. Mounted once in the atlas layout.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getCurrentUser } from 'aws-amplify/auth';
import { dataClient } from '@/lib/amplify-data';
import { OnboardingModal } from './onboarding-modal';

export function OnboardingGate() {
  const [show, setShow] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        await getCurrentUser();
      } catch {
        setChecked(true);
        return;
      }

      try {
        const { data: profiles } = await dataClient.models.UserProfile.list();
        if (cancelled) return;

        let profile: (typeof profiles)[number] | undefined = profiles?.[0];

        if (!profile) {
          const user = await getCurrentUser();
          const { data: created } = await dataClient.models.UserProfile.create({
            email: user.signInDetails?.loginId ?? '',
            name: user.username ?? null,
            tier: 'FREE',
            onboardingCompleted: false,
          });
          if (created) profile = created;
        }

        if (profile && !cancelled) {
          setProfileId(profile.id);
          if (!profile.onboardingCompleted) {
            setShow(true);
          }
        }
      } catch (err) {
        console.error('Onboarding gate check failed:', err);
      } finally {
        if (!cancelled) setChecked(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleComplete(data: { goals: string[]; experienceLevel: string }) {
    if (!profileId) {
      setShow(false);
      return;
    }
    try {
      await dataClient.models.UserProfile.update({
        id: profileId,
        goals: data.goals,
        experienceLevel: data.experienceLevel,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to mark onboarding complete:', err);
    }
    setShow(false);
  }

  if (!checked || !show) return null;

  return (
    <AnimatePresence>
      <OnboardingModal onComplete={handleComplete} />
    </AnimatePresence>
  );
}
