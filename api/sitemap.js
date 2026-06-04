// api/sitemap.js — Vercel serverless (ESM)
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravio.az';
const CATEGORIES = ['qolbaqlar', 'tesbehler', 'domino', 'hediyelik_qutular'];

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildImageUrl(url) {
  if (!url) return null;
  return `${url}?w=1200&h=630&fit=crop&auto=format`;
}

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const products = await client.fetch(
      `*[_type == "product" && defined(slug.current)] | order(bestSellerOrder asc) {
        "slug": slug.current,
        "name": name,
        "imageUrls": variants[].images[0].asset->url
      }`
    );

    const staticUrls = [
      { loc: '', priority: '1.0', changefreq: 'weekly' },
      { loc: '/mehsullar', priority: '0.9', changefreq: 'weekly' },
      { loc: '/catdirilma', priority: '0.8', changefreq: 'monthly' },
      { loc: '/haqqimizda', priority: '0.7', changefreq: 'monthly' },
      { loc: '/elaqe', priority: '0.6', changefreq: 'monthly' },
    ]
      .map(
        (p) => `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
      )
      .join('\n');

    const categoryUrls = CATEGORIES.map(
      (slug) => `  <url>
    <loc>${BASE_URL}/mehsullar/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    ).join('\n');

    const productUrls = products
      .map((p) => {
        const imageUrls = Array.isArray(p.imageUrls) ? p.imageUrls.filter(Boolean) : [];
        const imgTags = imageUrls
          .slice(0, 5)
          .map((url) => {
            const imgSrc = buildImageUrl(url);
            if (!imgSrc) return '';
            return `
    <image:image>
      <image:loc>${imgSrc}</image:loc>
      <image:title>${escapeXml(p.name)} | Ravio</image:title>
      <image:caption>Ravio — ${escapeXml(p.name)}</image:caption>
    </image:image>`;
          })
          .filter(Boolean)
          .join('');

        return `  <url>
    <loc>${BASE_URL}/mehsullar/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>${imgTags}
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
${productUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[Sitemap] Xəta:', err);
    return res.status(500).send('Sitemap yaradılarkən xəta baş verdi.');
  }
}
