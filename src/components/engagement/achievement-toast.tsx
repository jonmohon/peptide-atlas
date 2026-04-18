'use client';

/**
 * Listens for 'atlas-achievement' custom events and displays a temporary toast
 * when a new achievement is unlocked. Mounted once at the root layout level.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Toast {
  id: number;
  title: string;
  description: string;
  iconKey: string;
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let nextId = 1;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        title: string;
        description: string;
        iconKey: string;
      };
      const id = nextId++;
      setToasts((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    };
    window.addEventListener('atlas-achievement', handler);
    return () => window.removeEventListener('atlas-achievement', handler);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass-bright rounded-xl px-4 py-3 border border-neon-green/30 shadow-[0_0_25px_rgba(0,255,159,0.18)] max-w-xs pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{t.iconKey}</div>
              <div>
                <div className="text-[10px] font-semibold text-neon-green uppercase tracking-wider">
                  Achievement unlocked
                </div>
                <div className="text-sm font-semibold text-foreground">{t.title}</div>
                <div className="text-xs text-text-secondary">{t.description}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
