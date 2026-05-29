// api/sitemap.js — Vercel Serverless Function
// Sanity-dən canlı məlumat alaraq sitemap yaradır

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravio.az';

const STATIC_PAGES = [
  { url: '',             priority: '1.0', changefreq: 'weekly'  },
  { url: '/mehsullar',   priority: '0.9', changefreq: 'weekly'  },
  { url: '/catdirilma',  priority: '0.8', changefreq: 'monthly' },
  { url: '/haqqimizda',  priority: '0.7', changefreq: 'monthly' },
  { url: '/elaqe',       priority: '0.6', changefreq: 'monthly' },
];

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Sanity-dən bütün aktiv məhsulları gətirir
    const products = await client.fetch(
      `*[_type == "product" && defined(slug.current)]{ "slug": slug.current, _updatedAt }`
    );

    const productPages = products.map(p => ({
      url:        `/mehsullar/${p.slug}`,
      priority:   '0.85',
      changefreq: 'weekly',
      lastmod:    p._updatedAt ? p._updatedAt.split('T')[0] : today,
    }));

    const allPages = [
      ...STATIC_PAGES.map(p => ({ ...p, lastmod: today })),
      ...productPages,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // 1 saatlıq cache — məhsullar tez-tez dəyişirsə azaldın
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);

  } catch (err) {
    console.error('Sitemap xətası:', err);
    res.status(500).send('Sitemap yaradılarkən xəta baş verdi');
  }
}