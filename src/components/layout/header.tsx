'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AISearchBar } from '@/components/ai/ai-search-bar';

const navLinks = [
  { href: '/', label: 'Body Map' },
  { href: '/peptides', label: 'Peptides' },
  { href: '/stacks', label: 'Stack Builder' },
  { href: '/effects', label: 'Effects' },
  { href: '/compare', label: 'Compare' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-medical-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L12 22M2 12L22 12M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground">
              Peptide<span className="text-medical-500">Atlas</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-medical-600 bg-medical-50'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-dim'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* AI Search */}
          <AISearchBar className="hidden lg:block w-64" />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-dim"
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
          <nav className="md:hidden py-2 pb-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-medical-600 bg-medical-50'
                    : 'text-text-secondary hover:text-foreground hover:bg-surface-dim'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
