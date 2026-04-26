import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravioaz.vercel.app';

const STATIC_PAGES = [
  { loc: '/',            changefreq: 'weekly',  priority: '1.0' },
  { loc: '/mehsullar',   changefreq: 'weekly',  priority: '0.9' },
  { loc: '/catdirilma',  changefreq: 'monthly', priority: '0.8' },
  { loc: '/haqqimizda',  changefreq: 'monthly', priority: '0.7' },
  { loc: '/elaqe',       changefreq: 'monthly', priority: '0.7' },
];

export default async function handler(req, res) {
  try {
    const products = await client.fetch(
      `*[_type == "product" && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt
      }`
    );

    const today = new Date().toISOString().split('T')[0];

    const staticUrls = STATIC_PAGES.map(
      (p) => `
  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    ).join('');

    const productUrls = products.map((p) => {
      const lastmod = p._updatedAt
        ? p._updatedAt.split('T')[0]
        : today;
      return `
  <url>
    <loc>${BASE_URL}/mehsullar/${p.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${productUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Sitemap yaradılarkən xəta baş verdi.');
  }
}