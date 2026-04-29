'use client';

/**
 * Mobile-aware shell for the (atlas) layout. Owns the mobile-drawer-open
 * state so AtlasHeader's hamburger and AtlasSidebar's drawer animation
 * stay in sync. On md+ screens the sidebar is always visible (its existing
 * collapse-to-icons behavior takes over there); on mobile it's a slide-in
 * drawer with a backdrop, closed by tapping the backdrop or any nav link.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AtlasHeader } from './atlas-header';
import { AtlasSidebar } from './atlas-sidebar';

export function AtlasShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes — covers nav-link taps inside.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AtlasHeader onMenuToggle={() => setDrawerOpen((v) => !v)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop (mobile only, when drawer is open) */}
        {drawerOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="md:hidden fixed inset-0 top-12 z-30 bg-black/60 backdrop-blur-sm"
          />
        )}

        <AtlasSidebar
          drawerOpen={drawerOpen}
          onCloseDrawer={() => setDrawerOpen(false)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
