// generate-sitemap.mjs  — v2  (XML escape düzəldildi + bütün variant şəkilləri)
import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { CATEGORY_PAGES } from './seo-categories.mjs';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravio.az';
const TODAY    = new Date().toISOString().split('T')[0];

// XML-də xüsusi simvolları escape et
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Sanity CDN URL-ni Google Image üçün hazırla
// DÜZƏLTMƏ: & → &amp;  (əvvəl & idi — bu invalid XML yaradırdı!)
function buildImageUrl(url) {
  if (!url) return null;
  return `${url}?w=1200&amp;h=630&amp;fit=crop&amp;auto=format`;
}

async function generateSitemap() {
  console.log('🗺  Sitemap generasiya edilir...');

  // ─── GROQ düzəldildi ──────────────────────────────────────────────────────
  // Əvvəl: variants[0].images[0].asset->url  →  yalnız 1-ci variantın 1-ci şəkli
  // İndi:  variants[].images[0].asset->url   →  HƏR variantın 1-ci şəkli (array)
  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{
      "slug": slug.current,
      "name": name,
      "imageUrls": variants[].images[0].asset->url
    }`
  );

  const validProducts = products.filter(p => p.slug);
  const withImages = validProducts.filter(p =>
    Array.isArray(p.imageUrls) && p.imageUrls.some(Boolean)
  ).length;

  console.log(`✅ ${validProducts.length} məhsul tapıldı`);
  console.log(`🖼  ${withImages} məhsulun şəkli var`);

  // ── Statik səhifələr ───────────────────────────────────────────────────────
  const staticPages = [
    { url: '',             priority: '1.0', changefreq: 'weekly'  },
    { url: '/mehsullar',   priority: '0.9', changefreq: 'weekly'  },
    { url: '/catdirilma',  priority: '0.8', changefreq: 'monthly' },
    { url: '/haqqimizda',  priority: '0.7', changefreq: 'monthly' },
    { url: '/elaqe',       priority: '0.6', changefreq: 'monthly' },
  ];

  const categoryPages = CATEGORY_PAGES.map(cat => ({
    url:        `/mehsullar/${cat.slug}`,
    priority:   '0.9',
    changefreq: 'weekly',
  }));

  const staticXml = staticPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  const categoryXml = categoryPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  // ── Məhsul səhifələri — bütün variantların şəkilləri ──────────────────────
  const productXml = validProducts.map(p => {
    const imageUrls = Array.isArray(p.imageUrls)
      ? p.imageUrls.filter(Boolean)
      : [];

    // Hər şəkil üçün <image:image> teqi (maks 5)
    const imgTags = imageUrls.slice(0, 5).map(url => {
      const imgSrc = buildImageUrl(url);
      if (!imgSrc) return '';
      return `
    <image:image>
      <image:loc>${imgSrc}</image:loc>
      <image:title>${escapeXml(p.name)} | Ravio</image:title>
      <image:caption>Ravio — ${escapeXml(p.name)}</image:caption>
    </image:image>`;
    }).filter(Boolean).join('');

    return `  <url>
    <loc>${BASE_URL}/mehsullar/${p.slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>${imgTags}
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${categoryXml}
${productXml}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');

  const total = staticPages.length + categoryPages.length + validProducts.length;
  console.log(`✅ Sitemap yazıldı: ${total} URL (${withImages} məhsulda şəkil teqi var)`);
}

generateSitemap().catch((err) => {
  console.error('⚠️  Sitemap generasiya uğursuz (build davam edir):', err.message || err);
  process.exit(0);
});
