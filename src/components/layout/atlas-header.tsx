'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AISearchBar } from '@/components/ai/ai-search-bar';
import { Logo } from '@/components/layout/logo';
import { UserMenu } from '@/components/auth/user-menu';
import { SignInModal } from '@/components/auth/sign-in-modal';

interface AtlasHeaderProps {
  onMenuToggle?: () => void;
}

export function AtlasHeader({ onMenuToggle }: AtlasHeaderProps) {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <header className="relative z-50 glass shrink-0 border-b border-white/[0.06]">
      <div className="max-w-full mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 gap-2">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onMenuToggle}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/[0.05] text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link
              href="/"
              className="hidden md:inline text-xs text-text-secondary hover:text-neon-cyan transition-colors"
            >
              &larr; Site
            </Link>
            <Logo href="/atlas" />
          </div>

          {/* Center: AI Search (sm+) */}
          <AISearchBar className="hidden sm:block w-72" />

          {/* Right: User */}
          <UserMenu onSignInClick={() => setSignInOpen(true)} />
        </div>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
