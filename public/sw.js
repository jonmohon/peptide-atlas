/**
 * PeptideAtlas Service Worker.
 * Handles install-for-home-screen, scheduled local dose reminders, and future web-push payloads.
 */

const CACHE_NAME = 'peptide-atlas-v1';
const APP_SHELL = ['/', '/atlas', '/manifest.json', '/icons/icon-192.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((res) => res ?? new Response('Offline', { status: 503 })),
    ),
  );
});

// Future: web-push listener
self.addEventListener('push', (event) => {
  let data = { title: 'PeptideAtlas', body: 'Time for your dose' };
  try {
    if (event.data) data = event.data.json();
  } catch {
    // Ignore parse error — use default
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: data.tag ?? 'atlas-reminder',
      data: { url: data.url ?? '/atlas' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/atlas';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});

// Scheduled local notifications: client posts { type: 'SCHEDULE', id, title, body, at } messages
const scheduled = new Map();
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'SCHEDULE') {
    const delay = Math.max(0, new Date(msg.at).getTime() - Date.now());
    const existing = scheduled.get(msg.id);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      self.registration.showNotification(msg.title, {
        body: msg.body,
        icon: '/icons/icon-192.svg',
        tag: msg.id,
        data: { url: msg.url ?? '/atlas' },
      });
      scheduled.delete(msg.id);
    }, delay);
    scheduled.set(msg.id, t);
  } else if (msg.type === 'CLEAR') {
    const t = scheduled.get(msg.id);
    if (t) clearTimeout(t);
    scheduled.delete(msg.id);
  } else if (msg.type === 'CLEAR_ALL') {
    for (const t of scheduled.values()) clearTimeout(t);
    scheduled.clear();
  }
});
