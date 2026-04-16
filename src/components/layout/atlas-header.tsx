'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AISearchBar } from '@/components/ai/ai-search-bar';
import { Logo } from '@/components/layout/logo';
import { UserMenu } from '@/components/auth/user-menu';
import { SignInModal } from '@/components/auth/sign-in-modal';

const navLinks = [
  { href: '/atlas', label: 'Body Map' },
  { href: '/atlas/peptides', label: 'Peptides' },
  { href: '/atlas/stacks', label: 'Stacks' },
  { href: '/atlas/effects', label: 'Effects' },
  { href: '/atlas/compare', label: 'Compare' },
  { href: '/atlas/tools', label: 'Tools' },
  { href: '/atlas/journal', label: 'Journal' },
  { href: '/atlas/notes', label: 'Notes' },
];

export function AtlasHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <header className="relative z-50 glass shrink-0">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Site link + Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-text-secondary hover:text-neon-cyan transition-colors"
            >
              &larr; Site
            </Link>
            <Logo href="/atlas" />
          </div>

          {/* Desktop Nav - pill style */}
          <nav className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-full px-1 py-0.5 border border-white/[0.06]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200',
                  pathname === link.href
                    ? 'text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,212,255,0.15)]'
                    : 'text-text-secondary hover:text-foreground hover:bg-white/[0.05]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* AI Search + User */}
          <div className="flex items-center gap-3">
            <AISearchBar className="hidden lg:block w-56" />
            <UserMenu onSignInClick={() => setSignInOpen(true)} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-2 pb-4 border-t border-white/[0.06]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-neon-cyan bg-neon-cyan/10'
                    : 'text-text-secondary hover:text-foreground hover:bg-white/[0.05]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
