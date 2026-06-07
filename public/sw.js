// Ravio Service Worker v3 — performance optimized
const CACHE_NAME    = 'ravio-v3';
const IMG_CACHE     = 'ravio-img-v3';
const SANITY_CACHE  = 'ravio-sanity-v3';

const STATIC_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/favicon.ico',
  '/favicon.png',
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_SHELL))
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const KEEP = [CACHE_NAME, IMG_CACHE, SANITY_CACHE];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
const ANALYTICS_HOSTS = [
  'googletagmanager.com', 'google-analytics.com', 'analytics.google.com',
  'connect.facebook.net', 'facebook.com',
  'va.vercel-scripts.com', 'vitals.vercel-insights.com',
];
const SANITY_API_HOSTS = ['api.sanity.io', 'w7scii42.api.sanity.io'];

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Analytics — keşlənmir, skip
  if (ANALYTICS_HOSTS.some((h) => url.hostname.includes(h))) return;

  // 2. Sanity API sorğuları — network-first, 5s timeout
  if (SANITY_API_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(networkFirst(event.request, SANITY_CACHE, 5000));
    return;
  }

  // 3. Sanity CDN şəkilləri — cache-first, 7 gün
  if (url.hostname.includes('cdn.sanity.io')) {
    event.respondWith(cacheFirst(event.request, IMG_CACHE));
    return;
  }

  // 4. Google Fonts — cache-first
  if (url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  // 5. App shell (same-origin JS/CSS/HTML) — stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event.request, CACHE_NAME));
    return;
  }
});

// ─── Strategies ──────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const fresh = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);
    if (fresh.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((fresh) => {
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => cached);
  return cached || fetchPromise;
}
