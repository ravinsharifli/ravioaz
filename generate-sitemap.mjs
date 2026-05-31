// generate-sitemap.mjs
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

/** Sanity CDN URL-ini Google Image üçün hazırla */
function imageUrl(url) {
  if (!url) return null;
  return `${url}?w=1200&h=630&fit=crop&auto=format`;
}

async function generateSitemap() {
  console.log('Sitemap generasiya edilir...');

  // Məhsul slug + şəkil + ad birlikdə çək
  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{
      "slug": slug.current,
      "name": name,
      "imageUrl": variants[0].images[0].asset->url
    }`
  );

  console.log(`${products.length} mehsul tapildi`);

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
    name:       cat.title || cat.slug,
    imageUrl:   null,
  }));

  const productPages = products.map(p => ({
    url:        `/mehsullar/${p.slug}`,
    priority:   '0.85',
    changefreq: 'weekly',
    name:       p.name,
    imageUrl:   imageUrl(p.imageUrl),
  }));

  // Static səhifələr üçün image yoxdur — sadə URL bloku
  const staticXml = staticPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  // Kateqoriya səhifələri
  const categoryXml = categoryPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  // Məhsul səhifələri — şəkil teqləri ilə
  const productXml = productPages.map(p => {
    const imageTag = p.imageUrl ? `
    <image:image>
      <image:loc>${p.imageUrl}</image:loc>
      <image:title>${(p.name || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')} | Ravio</image:title>
    </image:image>` : '';
    return `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${imageTag}
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
  const total = staticPages.length + categoryPages.length + productPages.length;
  const withImages = productPages.filter(p => p.imageUrl).length;
  console.log(`Sitemap yazildi: ${total} URL (${withImages} məhsulda şəkil teqi var)`);
}

generateSitemap().catch(err => {
  console.error('Sitemap xetasi:', err);
  process.exit(1);
});
