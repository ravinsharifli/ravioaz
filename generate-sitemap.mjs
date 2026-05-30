/**
 * generate-snap-urls.mjs
 * 
 * Bu script build zamanı Sanity-dən bütün məhsul slug-larını çəkir
 * və package.json-dakı reactSnap.include siyahısını yeniləyir.
 * 
 * İstifadə: node generate-snap-urls.mjs
 * (build skriptinə əlavə et: "node generate-snap-urls.mjs && node generate-sitemap.mjs && vite build")
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'fs';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

async function updateSnapUrls() {
  console.log('📦 Sanity-dən məhsul URL-ləri çəkilir...');

  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{ "slug": slug.current }`
  );

  console.log(`✅ ${products.length} məhsul tapıldı`);

  const staticUrls = [
    '/',
    '/mehsullar',
    '/haqqimizda',
    '/elaqe',
    '/catdirilma',
  ];

  const productUrls = products.map(p => `/mehsullar/${p.slug}`);
  const allUrls = [...staticUrls, ...productUrls];

  // package.json-u oxu
  const pkgPath = './package.json';
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  // reactSnap.include-u yenilə
  pkg.reactSnap.include = allUrls;

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`✅ package.json yeniləndi — ${allUrls.length} URL react-snap-a əlavə edildi`);
  console.log('   Məhsul URL-ləri:', productUrls.slice(0, 5), productUrls.length > 5 ? `... +${productUrls.length - 5} daha` : '');
}

updateSnapUrls().catch(err => {
  console.error('❌ URL generasiya xətası:', err);
  process.exit(1);
});
