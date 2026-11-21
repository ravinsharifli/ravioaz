// scripts/check-english-toggle.mjs
//
// "İngilis versiya açıqdır / dayandırılıb" qərarı İKİ yerdə yaşayır və onlar UYĞUN olmalıdır:
//   1) lib/features.mjs  → ENGLISH_ENABLED  (sitemap, hreflang, HTML-lər, dil düyməsi, marşrutlar)
//   2) vercel.json       → "redirects"      (server tərəfdə /en → Azərbaycanca daimi yönləndirmə)
// Uyğunsuzluq SEO-nu SƏSSİZCƏ korlayar (məs. sitemap /en verir, amma server /en-i yönləndirir),
// ona görə build bu halda dayanır və nə etməli olduğunu yazır. `npm run build`-in ilk addımıdır.
import { readFileSync, existsSync } from 'fs';
import { ENGLISH_ENABLED } from '../lib/features.mjs';

const root = new URL('../', import.meta.url);
const vercel = JSON.parse(readFileSync(new URL('vercel.json', root), 'utf-8'));

const enRedirects = (vercel.redirects || []).filter(
  (r) => typeof r?.source === 'string' && /^\/en(\/|$)/.test(r.source)
);
const sources = enRedirects.map((r) => r.source);
const problems = [];

if (ENGLISH_ENABLED) {
  if (enRedirects.length) {
    problems.push(
      `lib/features.mjs: ENGLISH_ENABLED = true, amma vercel.json-da /en yönləndirməsi qalıb (${sources.join(', ')}).\n` +
      '     → vercel.json-dakı "redirects" blokundan /en ilə başlayan yönləndirmələri silin.'
    );
  }
} else {
  for (const need of ['/en', '/en/:path*']) {
    if (!sources.includes(need)) {
      problems.push(
        `vercel.json: ENGLISH_ENABLED = false, amma "${need}" yönləndirməsi yoxdur.\n` +
        '     → "redirects" blokuna əlavə edin (README.md → İngilis versiya (/en)).'
      );
    }
  }
  for (const r of enRedirects) {
    if (r.permanent !== true) {
      problems.push(`vercel.json: "${r.source}" yönləndirməsi "permanent": true olmalıdır (Google üçün daimi).`);
    }
    if (typeof r.destination !== 'string' || r.destination.startsWith('/en')) {
      problems.push(`vercel.json: "${r.source}" yönləndirməsinin hədəfi /en olmamalıdır (indi: ${r.destination}).`);
    }
  }
}

// llms.txt (süni intellekt botları üçün) — yalnız xəbərdarlıq, build-i dayandırmır
try {
  const llmsUrl = new URL('public/llms.txt', root);
  const llms = existsSync(llmsUrl) ? readFileSync(llmsUrl, 'utf-8') : '';
  const mentionsEn = llms.includes('https://ravio.az/en');
  if (!ENGLISH_ENABLED && mentionsEn) {
    console.warn('⚠️  public/llms.txt hələ də /en linkini göstərir — İngilis versiya dayandırılıb, həmin sətri silin.');
  }
  if (ENGLISH_ENABLED && !mentionsEn) {
    console.warn('⚠️  public/llms.txt-də İngilis versiya sətri yoxdur — versiyanı açmısınızsa geri qaytarın.');
  }
} catch {
  /* xəbərdarlıq üçündür — oxuna bilməsə build dayanmasın */
}

if (problems.length) {
  console.error('\n❌ İngilis versiya açarı uyğunsuzdur:\n  - ' + problems.join('\n  - ') + '\n');
  process.exit(1);
}
console.log(`✅ İngilis versiya açarı uyğundur (${ENGLISH_ENABLED ? 'AÇIQ' : 'DAYANDIRILIB — /en → AZ yönləndirilir'})`);
