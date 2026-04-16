'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AISearchBar } from '@/components/ai/ai-search-bar';
import { Logo } from '@/components/layout/logo';
import { UserMenu } from '@/components/auth/user-menu';
import { SignInModal } from '@/components/auth/sign-in-modal';

export function AtlasHeader() {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <header className="relative z-50 glass shrink-0 border-b border-white/[0.06]">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left: Site link + Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-text-secondary hover:text-neon-cyan transition-colors"
            >
              &larr; Site
            </Link>
            <Logo href="/atlas" />
          </div>

          {/* Center: AI Search */}
          <AISearchBar className="hidden sm:block w-72" />

          {/* Right: User */}
          <UserMenu onSignInClick={() => setSignInOpen(true)} />
        </div>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
