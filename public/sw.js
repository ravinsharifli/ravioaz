// Ravio Service Worker v11 — naviqasiya uğursuz olanda ağ ekran əvəzinə keşlənmiş tətbiq qabığı göstərilir
// v11: bir komponent silindi — köhnə keşlənmiş JS faylları təmizlənsin (keş adları v11-ə qaldırıldı).
// v10: Sanity API (apicdn) sorğuları səhvən "şəkil" qaydasına düşürdü (substring uyğunluğu) və heç vaxt
// yenilənməyən cache-first ilə verilirdi → köhnə qiymət/stok görünə bilərdi. İndi dəqiq host müqayisəsi var.
const CACHE_NAME    = 'ravio-v11';
const IMG_CACHE     = 'ravio-img-v11';
const SANITY_CACHE  = 'ravio-sanity-v11';

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
// Sanity MƏLUMAT API-si: <layihə>.api.sanity.io və <layihə>.apicdn.sanity.io (qiymət, stok, kampaniya).
// DİQQƏT: 'apicdn.sanity.io' sətri 'cdn.sanity.io' ilə bitir. Ona görə substring (includes) YOX,
// dəqiq host müqayisəsi istifadə olunur — əks halda API cavabları şəkil kimi həmişəlik keşlənir.
const isSanityApiHost   = (h) => h === 'api.sanity.io'    || h.endsWith('.api.sanity.io')
                              || h === 'apicdn.sanity.io' || h.endsWith('.apicdn.sanity.io');
const isSanityImageHost = (h) => h === 'cdn.sanity.io';

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Analytics — keşlənmir, skip
  if (ANALYTICS_HOSTS.some((h) => url.hostname.includes(h))) return;

  // 1b. Öz saytımızdakı analitika skriptləri — həmişə server-dən təzə gəlsin
  if (url.origin === self.location.origin && (url.pathname === '/meta-pixel.js' || url.pathname === '/ga-init.js')) return;

  // 2. Sanity API sorğuları — network-first, 5s timeout (online olanda HƏMİŞƏ təzə məlumat)
  if (isSanityApiHost(url.hostname)) {
    event.respondWith(networkFirst(event.request, SANITY_CACHE, 5000));
    return;
  }

  // 3. Sanity CDN şəkilləri — cache-first. Şəkil URL-ləri məzmuna görə unikaldır (asset id),
  // şəkil dəyişəndə URL də dəyişir — ona görə uzunmüddətli keş təhlükəsizdir.
  if (isSanityImageHost(url.hostname)) {
    event.respondWith(cacheFirst(event.request, IMG_CACHE));
    return;
  }

  // 4. Font faylları (öz domenimizdə) — cache-first, uzunmüddətli
  if (url.origin === self.location.origin && url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  // 5a. Naviqasiya sorğuları (səhifə açılışı) və index.html — HƏMİŞƏ network-first.
  // Səbəb: index.html hər deploy-da dəyişən hash-lənmiş JS fayllarına (məs. ProductPage-XXXX.js)
  // istinad edir. Bu sənəd köhnə keşdən verilsə, brauzer artıq mövcud olmayan köhnə hash-li
  // fayl axtarır → "ağ ekran" məhz bura görə yaranır. Offline zaman üçün yenə cache-ə fallback var.
  if (url.origin === self.location.origin &&
      (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html')) {
    event.respondWith(networkFirst(event.request, CACHE_NAME, 4000));
    return;
  }

  // 5b. Digər eyni-mənşəli fayllar (hash-lənmiş JS/CSS) — stale-while-revalidate təhlükəsizdir,
  // çünki hər build-də fayl adı (hash) dəyişir, köhnə versiya ilə qarışıqlıq yaranmır.
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
    if (cached) return cached;
    // Naviqasiya sorğusu (səhifə açılışı) uğursuz oldusa və BU URL keşdə yoxdursa, boş 503
    // (ağ ekran) əvəzinə keşlənmiş tətbiq qabığını ("/") veririk — React marşrutu URL-ə görə
    // özü açır. Zəif mobil şəbəkədə 4 saniyəlik timeout-dan sonra istifadəçi itmir.
    if (request.mode === 'navigate') {
      const shell = await caches.match('/');
      if (shell) return shell;
    }
    return new Response('', { status: 503 });
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