'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/layout/logo';
import { UserMenu } from '@/components/auth/user-menu';
import { SignInModal } from '@/components/auth/sign-in-modal';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/faq', label: 'FAQ' },
  { href: '/pricing', label: 'Pricing' },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Logo href="/" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-neon-cyan'
                    : 'text-text-secondary hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop: user menu only (no Launch Atlas — sign-in lives inside UserMenu) */}
            <div className="hidden md:block">
              <UserMenu onSignInClick={() => setSignInOpen(true)} />
            </div>

            {/* Mobile: hamburger only — UserMenu + CTAs live inside the drawer */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.05] text-foreground"
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
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-3">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    'block px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-neon-cyan bg-neon-cyan/10'
                      : 'text-text-secondary hover:text-foreground hover:bg-white/[0.05]'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Account / sign-in CTAs */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link
                href="/auth/signin?mode=signup"
                onClick={closeMobile}
                className="w-full text-center px-4 py-3 rounded-xl bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 text-sm font-semibold"
              >
                Get started — free
              </Link>
              <Link
                href="/auth/signin"
                onClick={closeMobile}
                className="w-full text-center px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.10] hover:bg-white/[0.08] text-sm font-medium text-foreground"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
