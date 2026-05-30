const { createClient } = require('@sanity/client');

// Mövcud Sanity Client konfiqurasiyası bura daxil edilməlidir
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'LAYİHƏ_ID_DAXİL_EDİN',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-01-01',
});

module.exports = async (req, res) => {
  try {
    // Sanity-dən aktiv kateqoriya və məhsul slug-larını çəkirik
    const categories = await client.fetch(`*[_type == "category" && defined(slug.current)].slug.current`);
    const products = await client.fetch(`*[_type == "product" && defined(slug.current)].slug.current`);

    const baseUrl = 'https://ravio.az';
    const currentDate = new Date().toISOString().split('T')[0];

    // 1. Statik Səhifələr
    let xmlItems = [
      `<url><loc>${baseUrl}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${baseUrl}/mehsullar</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
      `<url><loc>${baseUrl}/catdirilma</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      `<url><loc>${baseUrl}/haqqimizda</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      `<url><loc>${baseUrl}/elaqe</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`
    ];

    // 2. Sanity-dən gələn Dinamik Kateqoriyalar (/mehsullar/qolbaqlar və s.)
    categories.forEach(slug => {
      xmlItems.push(`<url><loc>${baseUrl}/mehsullar/${slug}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`);
    });

    // 3. Sanity-dən gələn Dinamik Məhsullar (/mehsullar/sac-ile-tesbeh-8 və s.)
    products.forEach(slug => {
      xmlItems.push(`<url><loc>${baseUrl}/mehsullar/${slug}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`);
    });

    // XML strukturunun birləşdirilməsi
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlItems.join('\n  ')}
</urlset>`;

    // Vercel Edge/Serverless üçün Header tənzimləmələri
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    
    return res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Sitemap Error:', error);
    return res.status(500).send('Sitemap yaradılarkən xəta baş verdi.');
  }
};