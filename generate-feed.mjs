// generate-feed.mjs — build zamanı public/google-feed.xml yaradır (Google Merchant Center üçün məhsul feed-i).
// Təhlükəsizlik (generate-llms.mjs kimi): xəta olarsa build DAYANMIR, köhnə fayl qalır.
import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { buildMerchantFeed } from './lib/merchantFeed.mjs';

const client = createClient({ projectId: 'w7scii42', dataset: 'production', useCdn: true, apiVersion: '2026-02-09' });

async function main() {
  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current) && defined(name)]{
      name,
      "slug": slug.current,
      description,
      seoDescription,
      "category": category->name,
      "imageUrl": variants[0].images[0].asset->url,
      "price": variants[0].price,
      "discountPrice": variants[0].discountPrice,
      "inStock": count(variants[inStock != false]) > 0
    }`,
  );
  if (!Array.isArray(products) || products.length === 0) throw new Error('Sanity 0 məhsul qaytardı — feed yazılmadı, köhnə fayl saxlanıldı');
  const { xml, included, skipped, skippedBrand } = buildMerchantFeed(products);
  if (included === 0) throw new Error('Feed-ə heç bir məhsul düşmədi — yazılmadı');
  writeFileSync('public/google-feed.xml', xml, 'utf-8');
  console.log(`✅ google-feed.xml yazıldı: ${included} məhsul${skipped.length ? `, ${skipped.length} atlandı (qiymət/şəkil yoxdur)` : ''}${skippedBrand.length ? `, ${skippedBrand.length} atlandı (marka adı: ${skippedBrand.join(', ')})` : ''}`);
}

main().catch((err) => {
  console.warn('⚠️  google-feed.xml generasiya olunmadı (build davam edir):', err?.message || err);
  process.exit(0);
});
