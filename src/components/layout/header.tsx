'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AISearchBar } from '@/components/ai/ai-search-bar';

const navLinks = [
  { href: '/', label: 'Body Map' },
  { href: '/peptides', label: 'Peptides' },
  { href: '/stacks', label: 'Stacks' },
  { href: '/effects', label: 'Effects' },
  { href: '/compare', label: 'Compare' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-50 glass shrink-0">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L12 22M2 12L22 12M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-foreground">
              Peptide<span className="text-neon-cyan text-glow-cyan">Atlas</span>
            </span>
          </Link>

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

          {/* AI Search */}
          <AISearchBar className="hidden lg:block w-56" />

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
    </header>
  );
}
