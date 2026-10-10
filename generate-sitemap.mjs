// generate-sitemap.mjs — v3
// Dəyişikliklər (v2 → v3):
//  • AZ + EN URL-ləri, hər cütdə hreflang (xhtml:link) — İngilis səhifələr Google-a görünür
//  • Məhsulu olmayan kateqoriyalar sitemap-ə düşmür (boş səhifə = zəif siqnal)
//  • <lastmod> yalnız REAL tarixi olan URL-lərə yazılır (məhsul: _updatedAt, blog: publishedAt).
//    Hər build-də "bu gün" yazmaq Google-un lastmod-a inamını azaldır.
import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { toCategorySlug } from './lib/slug.mjs';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

const BASE_URL = 'https://ravio.az';

// XML-də xüsusi simvolları escape et
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Sanity CDN URL-ni Google Image üçün hazırla (& → &amp; — invalid XML olmasın)
function buildImageUrl(url) {
  if (!url) return null;
  return `${url}?w=1200&amp;h=630&amp;fit=crop&amp;auto=format`;
}

// p = Azərbaycanca yol ('' = ana səhifə, '/mehsullar', '/mehsullar/slug' ...)
const locAz = (p) => `${BASE_URL}${p === '' ? '/' : p}`;
const locEn = (p) => `${BASE_URL}${p === '' || p === '/' ? '/en' : `/en${p}`}`;

function altLinks(p) {
  return `
    <xhtml:link rel="alternate" hreflang="az" href="${locAz(p)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${locEn(p)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${locAz(p)}" />`;
}

function urlXml({ loc, p, lastmod, changefreq, priority, extra = '', bilingual = true }) {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${bilingual ? altLinks(p) : ''}${extra}
  </url>`;
}

/** Bir səhifənin AZ və EN URL bloklarını qaytarır (hər ikisi bütün alternativləri göstərir) */
function pairXml({ p, lastmod, changefreq, priority, images = '' }) {
  return [
    urlXml({ loc: locAz(p), p, lastmod, changefreq, priority, extra: images }),
    urlXml({ loc: locEn(p), p, lastmod, changefreq, priority }),
  ].join('\n');
}

async function generateSitemap() {
  console.log('🗺  Sitemap generasiya edilir...');

  // HƏR variantın 1-ci şəkli (array) — Google Image üçün
  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{
      "slug": slug.current,
      "name": name,
      "updatedAt": _updatedAt,
      "imageUrls": variants[].images[0].asset->url
    }`
  );

  const validProducts = products.filter(p => p.slug);
  const withImages = validProducts.filter(p =>
    Array.isArray(p.imageUrls) && p.imageUrls.some(Boolean)
  ).length;

  console.log(`✅ ${validProducts.length} məhsul tapıldı`);
  console.log(`🖼  ${withImages} məhsulun şəkli var`);
  if (validProducts.length === 0) {
    throw new Error('Sanity 0 məhsul qaytardı — boş sitemap yazılmadı, köhnə fayl saxlanıldı');
  }

  // Kateqoriyalar: yalnız ən azı 1 məhsulu olanlar
  const categoryDocs = await client.fetch(
    `*[_type == "category"]{
      name,
      "count": count(*[_type == "product" && references(^._id)])
    }`
  );
  const categorySlugs = categoryDocs
    .filter(c => c?.name && c.count > 0)
    .map(c => toCategorySlug(c.name))
    .filter(Boolean);
  const emptyCats = categoryDocs.filter(c => c?.name && !(c.count > 0)).map(c => c.name);
  console.log(`📂 ${categorySlugs.length} məhsullu kateqoriya` + (emptyCats.length ? ` (boş, çıxarıldı: ${emptyCats.join(', ')})` : ''));

  // "Kimə alırsan?" bölmələri — Sanity-dən dinamik.
  // Heç bir məhsul bağlanmayıb? Sitemap-ə düşmür (boş səhifə Google üçün zəif siqnaldır —
  // kateqoriyalarla eyni qayda). Məhsul bağlayan kimi növbəti build-də avtomatik əlavə olunur.
  const audienceCategories = await client.fetch(
    `*[_type == "audienceCategory" && isActive != false && defined(slug.current)
       && count(*[_type == "product" && references(^._id)]) > 0]{
      "slug": slug.current
    }`
  );
  console.log(`🎯 ${audienceCategories.length} "Kimə alırsan?" bölməsi tapıldı`);

  const blogPosts = await client.fetch(
    `*[_type == "blogPost" && defined(slug.current)]{
      "slug": slug.current,
      publishedAt
    }`
  );
  console.log(`📰 ${blogPosts.length} blog yazısı tapıldı`);

  const blocks = [];

  // Statik səhifələr (AZ + EN)
  const staticPages = [
    { p: '',            priority: '1.0', changefreq: 'weekly'  },
    { p: '/mehsullar',  priority: '0.9', changefreq: 'weekly'  },
    { p: '/catdirilma', priority: '0.8', changefreq: 'monthly' },
    { p: '/haqqimizda', priority: '0.7', changefreq: 'monthly' },
  ];
  for (const sp of staticPages) blocks.push(pairXml(sp));

  // Kateqoriyalar
  for (const slug of categorySlugs) {
    blocks.push(pairXml({ p: `/mehsullar/${slug}`, priority: '0.9', changefreq: 'weekly' }));
  }

  // "Kimə alırsan?"
  for (const a of audienceCategories.filter(a => a.slug)) {
    blocks.push(pairXml({ p: `/kime/${a.slug}`, priority: '0.8', changefreq: 'weekly' }));
  }

  // Blog: siyahı AZ+EN; yazılar yalnız AZ (məzmun Azərbaycancadır)
  blocks.push(pairXml({ p: '/blog', priority: '0.7', changefreq: 'weekly' }));
  for (const b of blogPosts.filter(b => b.slug)) {
    blocks.push(urlXml({
      loc: `${BASE_URL}/blog/${b.slug}`,
      p: `/blog/${b.slug}`,
      lastmod: b.publishedAt ? b.publishedAt.slice(0, 10) : undefined,
      changefreq: 'monthly',
      priority: '0.6',
      bilingual: false,
    }));
  }

  // Məhsullar — bütün variantların şəkilləri (AZ blokunda), real lastmod
  for (const p of validProducts) {
    const imageUrls = Array.isArray(p.imageUrls) ? p.imageUrls.filter(Boolean) : [];
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

    blocks.push(pairXml({
      p: `/mehsullar/${p.slug}`,
      lastmod: p.updatedAt ? p.updatedAt.slice(0, 10) : undefined,
      priority: '0.85',
      changefreq: 'weekly',
      images: imgTags,
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${blocks.join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');

  const total = (xml.match(/<url>/g) || []).length;
  console.log(`✅ Sitemap yazıldı: ${total} URL (AZ+EN, ${withImages} məhsulda şəkil teqi var)`);
}

generateSitemap().catch((err) => {
  // Build dayanmır (köhnə public/sitemap.xml qalır), amma xəta GÖRÜNMƏLİDİR
  console.error('❌ Sitemap generasiya UĞURSUZ — köhnə public/sitemap.xml saxlanıldı:', err.message || err);
  process.exit(0);
});
