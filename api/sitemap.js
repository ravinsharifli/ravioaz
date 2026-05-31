const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'w7scii42',
  dataset:   'production',
  useCdn:    true,
  apiVersion: '2026-02-09',
});

const BASE_URL   = 'https://ravio.az';
const CATEGORIES = ['qolbaqlar', 'tesbehler', 'domino', 'hediyelik_qutular'];

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function sanityImageUrl(url) {
  if (!url) return null;
  return `${url}?w=1200&amp;h=630&amp;fit=crop&amp;auto=format`;
}

module.exports = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Məhsul slug + ad + birinci şəkil birlikdə çəkilir
    const products = await client.fetch(
      `*[_type == "product" && defined(slug.current)] | order(bestSellerOrder asc) {
        "slug": slug.current,
        "name": name,
        "imageUrl": variants[0].images[0].asset->url
      }`
    );

    // ── Statik səhifələr ─────────────────────────────────────────────────────
    const staticUrls = [
      { loc: '',            priority: '1.0', changefreq: 'weekly'  },
      { loc: '/mehsullar',  priority: '0.9', changefreq: 'weekly'  },
      { loc: '/catdirilma', priority: '0.8', changefreq: 'monthly' },
      { loc: '/haqqimizda', priority: '0.7', changefreq: 'monthly' },
      { loc: '/elaqe',      priority: '0.6', changefreq: 'monthly' },
    ].map(p => `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

    // ── Kateqoriya səhifələri ────────────────────────────────────────────────
    const categoryUrls = CATEGORIES.map(slug => `  <url>
    <loc>${BASE_URL}/mehsullar/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    // ── Məhsul səhifələri — şəkil teqləri ilə ───────────────────────────────
    const productUrls = products.map(p => {
      const imgUrl = sanityImageUrl(p.imageUrl);
      const imgTag = imgUrl ? `
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapeXml(p.name)} | Ravio</image:title>
    </image:image>` : '';

      return `  <url>
    <loc>${BASE_URL}/mehsullar/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>${imgTag}
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
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
};