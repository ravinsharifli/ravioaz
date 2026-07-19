/**
 * Brauzer üçün YÜNGÜL Sanity client.
 *
 * Niyə @sanity/client SDK-sı YOXDUR?
 * Tətbiqdə client-dən YALNIZ `.fetch(query, params)` işlədilir (App.tsx, SlugPage.tsx).
 * Bunun üçün tam SDK lazım deyil — Sanity-nin GROQ HTTP API-sinə birbaşa fetch
 * sorğusu kifayət edir. Bu, bundle-dan ~110 KB JS-i çıxarır (parse+execute vaxtı azalır,
 * TBT düşür), funksionallıqda heç bir dəyişiklik olmadan.
 *
 * DİQQƏT: Bu fayl yalnız BRAUZER tərəfi üçündür. Build skriptləri
 * (inject-seo.mjs, generate-sitemap.mjs) öz `@sanity/client` import-larını saxlayır —
 * onlar Node.js-də işləyir, brauzer bundle-ına düşmür, ona görə həmin paketi
 * package.json-dan SİLMİRİK.
 */

const PROJECT_ID = 'w7scii42';
const DATASET = 'production';
const API_VERSION = '2026-02-09';
const BASE_URL = `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

export const client = {
  fetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(BASE_URL);
    url.searchParams.set('query', query);
    for (const [key, value] of Object.entries(params)) {
      // Sanity GROQ HTTP API parametrləri "$ad=JSON-dəyər" formatında gözləyir
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    }

    return fetch(url.toString())
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Sanity API xətası: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => data.result as T);
  },
};