// generate-sitemap.mjs
import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravio.az';
const TODAY    = new Date().toISOString().split('T')[0];

async function generateSitemap() {
  console.log('Sitemap generasiya edilir...');

  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{ "slug": slug.current }`
  );

  console.log(`${products.length} mehsul tapildi`);

  const staticPages = [
    { url: '',             priority: '1.0', changefreq: 'weekly'  },
    { url: '/mehsullar',   priority: '0.9', changefreq: 'weekly'  },
    { url: '/catdirilma',  priority: '0.8', changefreq: 'monthly' },
    { url: '/haqqimizda',  priority: '0.7', changefreq: 'monthly' },
    { url: '/elaqe',       priority: '0.6', changefreq: 'monthly' },
  ];

  const productPages = products.map(p => ({
    url:        `/mehsullar/${p.slug}`,
    priority:   '0.85',
    changefreq: 'weekly',
  }));

  const allPages = [...staticPages, ...productPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');
  console.log(`Sitemap yazildi: ${allPages.length} URL`);
}

generateSitemap().catch(err => {
  console.error('Sitemap xetasi:', err);
  process.exit(1);
});