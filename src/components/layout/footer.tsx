import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-surface-dim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-neon-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2L12 22M2 12L22 12M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-bold text-foreground">
                Peptide<span className="text-neon-cyan">Atlas</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              Interactive peptide education platform. Explore how peptides affect the body through our visual atlas.
            </p>
          </div>

          {/* Atlas Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Atlas</h3>
            <ul className="space-y-2">
              <li><Link href="/atlas" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Body Map</Link></li>
              <li><Link href="/atlas/peptides" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Peptide Database</Link></li>
              <li><Link href="/atlas/stacks" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Stack Builder</Link></li>
              <li><Link href="/atlas/effects" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Effects Explorer</Link></li>
              <li><Link href="/atlas/compare" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Compare Peptides</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/learn" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Learn</Link></li>
              <li><Link href="/about" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">About</Link></li>
              <li><Link href="/glossary" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">Glossary</Link></li>
              <li><Link href="/faq" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Disclaimer</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This website is for educational and informational purposes only. The content is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} PeptideAtlas. For educational purposes only.
        </div>
      </div>
    </footer>
  );
}
