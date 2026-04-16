'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { canAccessFeature, type PremiumFeature, type Tier } from '@/types/user';

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumGate({ feature, children, fallback }: PremiumGateProps) {
  const [tier, setTier] = useState<Tier>('FREE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/tier')
      .then((res) => res.json())
      .then((data) => setTier(data.tier ?? 'FREE'))
      .catch(() => setTier('FREE'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (canAccessFeature(tier, feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neon-cyan/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-foreground">Pro Feature</h3>
      <p className="text-xs text-text-secondary mt-1 mb-4">
        Upgrade to unlock this feature and more.
      </p>
      <Link
        href="/pricing"
        className="inline-block px-5 py-2 rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all text-xs font-semibold"
      >
        View Plans
      </Link>
    </div>
  );
}
