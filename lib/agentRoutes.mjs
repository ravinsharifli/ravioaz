// lib/agentRoutes.mjs — middleware.js-in məntiqi (SAF + test oluna bilən; şəbəkə `fetchFn` ilə verilir).
//
// Görəcəyi iş:
//  1) Mövcud olmayan ünvanlara həqiqi HTTP 404 qaytarmaq (əvvəl hər şey 200 + ana səhifə idi → "soft-404").
//     `Accept: text/markdown` istəyənə Markdown xəta mətni (text/markdown), digərlərinə sayt qabığı (React NotFound göstərsin) 404 statusu ilə.
//  2) `Accept: text/markdown` ilə mövcud səhifə istənəndə Markdown versiyanı qaytarmaq (Vary: Accept ilə).
//
// TƏHLÜKƏSİZLİK QAYDASI: şübhə varsa səhifəyə TOXUNMA (null qaytar → sayt əvvəlki kimi işləyir).
// Yəni Sanity cavab verməsə və ya xəta olsa, mövcud davranış qalır. 404 yalnız ünvanın YOXLUĞU təsdiqlənəndə verilir.
import { toCategorySlug } from './slug.mjs';

export const SITE = 'https://ravio.az';
const SANITY_QUERY_URL = 'https://w7scii42.apicdn.sanity.io/v2026-02-09/data/query/production';
const SLUG_TTL_MS = 5 * 60 * 1000;
export const INTERNAL_HEADER = 'x-ravio-internal';

/**
 * Saytın SABİT marşrutları (App.tsx-dəki <Route path>-larla eyni olmalıdır — scripts/agent.test.mjs bunu YOXLAYIR).
 * Yeni səhifə əlavə olunanda həm App.tsx-ə, həm bura yazılmalıdır, yoxsa test qırılır.
 */
export const STATIC_ROUTES = ['/', '/mehsullar', '/haqqimizda', '/catdirilma', '/qaydalar', '/blog', '/elaqe'];
/** Dinamik marşrut prefiksləri → hansı Sanity siyahılarında slug axtarılır */
export const DYNAMIC_PREFIXES = {
  '/mehsullar/': ['product', 'category'],
  '/kime/': ['audience'],
  '/blog/': ['blog'],
};

const SLUG_QUERY = `{
  "product": *[_type == "product" && defined(slug.current)].slug.current,
  "blog": *[_type == "blogPost" && defined(slug.current)].slug.current,
  "audience": *[_type == "audienceCategory" && defined(slug.current)].slug.current,
  "categoryNames": *[_type == "category" && defined(name)].name
}`;

let slugCache = { at: 0, data: null };
export function resetSlugCache() { slugCache = { at: 0, data: null }; }

/** Sanity-dən bütün slug-ları çəkir; uğursuzluqda null (çağıran fail-open edir) */
export async function loadSlugs(fetchFn, now = Date.now()) {
  if (slugCache.data && now - slugCache.at < SLUG_TTL_MS) return slugCache.data;
  try {
    const url = `${SANITY_QUERY_URL}?query=${encodeURIComponent(SLUG_QUERY)}`;
    const res = await fetchFn(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return slugCache.data; // köhnə keş varsa onu işlət, yoxsa null
    const json = await res.json();
    const r = json && json.result;
    if (!r || !Array.isArray(r.product)) return slugCache.data;
    const data = {
      product: new Set(r.product),
      blog: new Set(r.blog || []),
      audience: new Set(r.audience || []),
      category: new Set((r.categoryNames || []).map(toCategorySlug)),
    };
    // Boş məhsul siyahısı = şübhəli cavab, 404 vermək üçün ona güvənmirik
    if (data.product.size === 0) return slugCache.data;
    slugCache = { at: now, data };
    return data;
  } catch {
    return slugCache.data;
  }
}

/** Accept başlığını [{type, q}] siyahısına çevirir */
export function parseAccept(header) {
  return String(header || '')
    .split(',')
    .map((part) => {
      const [type, ...params] = part.trim().split(';');
      let q = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=([0-9.]+)$/i);
        if (m) q = Number(m[1]);
      }
      return { type: type.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((x) => x.type);
}

// Müştəri AÇIQ şəkildə text/markdown istəyir və onu HTML-dən az üstün tutmur? (yalnız "wildcard" Accept HTML deməkdir)
export function prefersMarkdown(acceptHeader) {
  const list = parseAccept(acceptHeader);
  const md = list.find((x) => x.type === 'text/markdown');
  if (!md || md.q <= 0) return false;
  const html = list.find((x) => x.type === 'text/html');
  return !html || md.q >= html.q;
}

function normalizePath(pathname) {
  let p = pathname || '/';
  try { p = decodeURIComponent(p); } catch { /* səhv kodlaşma — olduğu kimi */ }
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/** Middleware-ə aid olmayan yollar (fayllar, API, asset-lər) → null qaytarılır */
export function shouldSkip(path) {
  if (path.startsWith('/api/') || path === '/api') return true;
  if (/^\/(assets|fonts|_md|_vercel|\.well-known|studio|en)(\/|$)/.test(path)) return true;
  const last = path.split('/').pop() || '';
  return last.includes('.'); // sw.js, robots.txt, favicon.ico, şəkillər və s.
}

/** 'valid' | 'missing' | 'unknown' (dinamik yol, amma Sanity əlçatmazdır) */
export function classifyPath(path, slugs) {
  if (STATIC_ROUTES.includes(path)) return 'valid';
  for (const [prefix, kinds] of Object.entries(DYNAMIC_PREFIXES)) {
    if (!path.startsWith(prefix)) continue;
    const slug = path.slice(prefix.length);
    if (!slug || slug.includes('/')) return 'missing';
    if (!slugs) return 'unknown';
    return kinds.some((k) => slugs[k] && slugs[k].has(slug)) ? 'valid' : 'missing';
  }
  return 'missing';
}

export function notFoundMarkdown(path) {
  return [
    '# 404 — Page not found',
    '',
    `The path \`${path}\` does not exist on ravio.az. / \`${path}\` ünvanı ravio.az saytında mövcud deyil.`,
    '',
    'Ravio is an online shop in Baku, Azerbaijan selling personalized laser-engraved gifts. Use these pages instead:',
    '',
    `- Home: ${SITE}/`,
    `- All products: ${SITE}/mehsullar`,
    `- Sitemap: ${SITE}/sitemap.xml`,
    `- Agent guide (llms.txt, includes when to use Ravio): ${SITE}/llms.txt`,
    `- Full product list with prices: ${SITE}/llms-full.txt`,
    '',
  ].join('\n');
}

function minimalNotFoundHtml(path) {
  const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<!doctype html><html lang="az"><head><meta charset="utf-8"><title>404 | Ravio</title><meta name="robots" content="noindex"></head><body><h1>404 — Səhifə tapılmadı</h1><p>${esc(path)} ünvanı mövcud deyil.</p><p><a href="/">Ravio ana səhifə</a> · <a href="/mehsullar">Məhsullar</a> · <a href="/sitemap.xml">Sitemap</a></p></body></html>`;
}

async function internalFetch(fetchFn, origin, pathname, accept) {
  // redirect: 'manual' — qorunan preview və ya yönləndirmə olsa, başqa saytın (məs. Vercel giriş səhifəsi) məzmununu GÖTÜRMƏSİN
  return fetchFn(`${origin}${pathname}`, { headers: { [INTERNAL_HEADER]: '1', accept }, redirect: 'manual' });
}

/**
 * Əsas giriş. Response qaytarırsa — onu istifadəçiyə ver. null qaytarırsa — sorğu əvvəlki kimi davam etsin.
 */
export async function handleAgentRequest(request, deps = {}) {
  const fetchFn = deps.fetchFn || globalThis.fetch;
  const now = deps.now ? deps.now() : Date.now();
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') return null;
  if (request.headers.get(INTERNAL_HEADER)) return null;

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  if (shouldSkip(path)) return null;

  const wantsMd = prefersMarkdown(request.headers.get('accept'));
  const slugs = DYNAMIC_PREFIXES && Object.keys(DYNAMIC_PREFIXES).some((p) => path.startsWith(p))
    ? await loadSlugs(fetchFn, now)
    : null;
  const verdict = classifyPath(path, slugs);
  const bodyFor = (text) => (method === 'HEAD' ? null : text);

  if (verdict === 'unknown') return null; // Sanity əlçatmaz — toxunma

  if (verdict === 'missing') {
    if (wantsMd) {
      return new Response(bodyFor(notFoundMarkdown(path)), {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept',
          'Cache-Control': 'public, max-age=0, s-maxage=300',
          'X-Robots-Tag': 'noindex',
        },
      });
    }
    let html = null;
    try {
      const shell = await internalFetch(fetchFn, url.origin, '/', 'text/html');
      if (shell.ok) {
        const text = await shell.text();
        // Yalnız Ravio-nun öz qabığı qəbul olunur (React NotFound-u göstərsin); başqa məzmun → minimal 404 səhifə
        if (text.includes('data-seo-shell')) html = text;
      }
    } catch { /* aşağıda minimal səhifə */ }
    return new Response(bodyFor(html || minimalNotFoundHtml(path)), {
      status: 404,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        Vary: 'Accept',
        'Cache-Control': 'public, max-age=0, s-maxage=300',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  // verdict === 'valid'
  if (!wantsMd) return null; // HTML — əvvəlki kimi (Vary: Accept middleware.js-də əlavə olunur)

  let md = null;
  try {
    const mdPath = path === '/' ? '/_md/index.md' : `/_md${path}.md`;
    const res = await internalFetch(fetchFn, url.origin, mdPath, 'text/markdown');
    const ctype = res.headers.get('content-type') || '';
    if (res.ok && !ctype.includes('text/html')) md = await res.text();
  } catch { /* aşağıdakı ehtiyat mətn */ }
  if (!md || !md.trim()) {
    md = `# Ravio\n\nThis page is available as HTML at ${SITE}${path === '/' ? '/' : path}.\n\nBu səhifənin HTML versiyası: ${SITE}${path === '/' ? '/' : path}\n\n- Agent guide: ${SITE}/llms.txt\n- Product list: ${SITE}/llms-full.txt\n`;
  }
  return new Response(bodyFor(md), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      Link: `<${SITE}${path === '/' ? '/' : path}>; rel="canonical"`,
      'X-Robots-Tag': 'noindex',
    },
  });
}
