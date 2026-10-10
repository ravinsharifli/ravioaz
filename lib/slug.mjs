// lib/slug.mjs — kateqoriya adı → URL slug (məs. "Qolbaqlar" → "qolbaqlar").
// Əvvəl EYNİ funksiya 3 yerdə təkrar yazılmışdı (lib/categorySlug.ts, inject-seo.mjs,
// generate-sitemap.mjs). İndi hamısı buradan götürür: brauzer kodu da, build skriptləri də.
// DİQQƏT: qayda dəyişsə, saytdakı bütün kateqoriya URL-ləri dəyişər (Google indeksi pozulur).
export function toCategorySlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
