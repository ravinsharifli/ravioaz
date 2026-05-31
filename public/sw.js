// Ravio Service Worker — PWA offline & cache support
const CACHE_NAME = 'ravio-v1';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/favicon.png',
];

// ─── Install: cache the app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL))
  );
  self.skipWaiting();
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: stale-while-revalidate for same-origin, skip third-party ─────────
const SKIP_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'connect.facebook.net',
  'facebook.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.sanity.io',
  'api.sanity.io',
  'w7scii42.api.sanity.io',
  'va.vercel-scripts.com',
  'vitals.vercel-insights.com',
];

self.addEventListener('fetch', (event) => {
  // Only GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip third-party analytics / CDN / API calls
  if (SKIP_HOSTS.some((h) => url.hostname.includes(h))) return;

  // Stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);

      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: serve cached index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return cache.match('/') || cache.match('/index.html');
          }
          return undefined;
        });

      return cached || fetchPromise;
    })
  );
});