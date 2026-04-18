'use client';

/**
 * Registers /sw.js on mount. No-op in development or unsupported browsers.
 * Keep this file tiny — it runs on every page load.
 */

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('SW registration failed:', err);
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);

    return () => {
      window.removeEventListener('load', register);
    };
  }, []);

  return null;
}
