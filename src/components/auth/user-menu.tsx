'use client';

/**
 * User avatar button with a dropdown menu showing name, email, tier badge,
 * upgrade link, profile nav, and sign-out. Falls back to a "Sign In" button when unauthenticated.
 */

import { useState, useRef, useEffect } from 'react';
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import Link from 'next/link';
import type { Tier } from '@/types/user';

const tierBadge: Record<string, { label: string; className: string }> = {
  FREE: { label: 'Free', className: 'text-text-secondary' },
  PRO: { label: 'Pro', className: 'text-neon-cyan' },
  PRO_PLUS: { label: 'Pro+', className: 'text-neon-green' },
};

interface UserMenuProps {
  onSignInClick: () => void;
}

interface UserState {
  name: string;
  email: string;
  initial: string;
  tier: Tier;
}

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      const attrs = await fetchUserAttributes();

      // Fetch tier from our API
      let tier: Tier = 'FREE';
      try {
        const res = await fetch('/api/user/tier');
        if (res.ok) {
          const data = await res.json();
          tier = data.tier;
        }
      } catch {
        // Default to FREE if API fails
      }

      setUser({
        name: attrs.name ?? attrs.email ?? currentUser.username,
        email: attrs.email ?? '',
        initial: (attrs.name ?? attrs.email ?? currentUser.username)?.[0]?.toUpperCase() ?? '?',
        tier,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="px-4 py-1.5 text-xs font-medium rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all"
      >
        Sign In
      </button>
    );
  }

  const badge = tierBadge[user.tier] ?? tierBadge.FREE;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-white/[0.05] transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center text-xs font-bold text-neon-cyan">
          {user.initial}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-bright rounded-xl border border-white/[0.08] overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
            <span className={`text-xs font-medium ${badge.className}`}>{badge.label}</span>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {user.tier === 'FREE' && (
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-neon-cyan hover:bg-white/[0.05] transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
            <Link
              href="/atlas/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              Profile & AI Settings
            </Link>
            <Link
              href="/atlas/saved"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              Saved Items
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
