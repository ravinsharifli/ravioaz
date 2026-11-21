// generate-llms.mjs — build zamanı public/llms-full.txt yaradır (bütün məhsullar: ad, qiymət, link).
// Niyə: llms.txt əl ilə yazılır və köhnələ bilir; bu fayl isə Sanity-dən HƏR build-də təzələnir.
// Təhlükəsizlik: xəta olarsa build DAYANMIR, köhnə fayl qalır (AI faylı uğurunuza mane olmasın).
import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { buildLlmsFull } from './lib/llmsFull.mjs';

const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

async function main() {
  const products = await client.fetch(
    `*[_type == "product" && defined(slug.current) && defined(name)]{
      name,
      "slug": slug.current,
      "category": category->name,
      "prices": variants[]{ "p": coalesce(discountPrice, price) }.p,
      "desc": seoDescription
    }`,
  );
  if (!Array.isArray(products) || products.length === 0) {
    throw new Error('Sanity 0 məhsul qaytardı — llms-full.txt yazılmadı, köhnə fayl saxlanıldı');
  }
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync('public/llms-full.txt', buildLlmsFull(products, today), 'utf-8');
  console.log(`✅ llms-full.txt yazıldı: ${products.length} məhsul`);
}

main().catch((err) => {
  console.warn('⚠️  llms-full.txt generasiya olunmadı (build davam edir):', err?.message || err);
  process.exit(0);
});
