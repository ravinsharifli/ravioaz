// schemas/slugify.js
// Azərbaycan hərflərini latın hərflərinə çevirən slug (URL) funksiyası.
// Əvvəl EYNİ kod 4 faylda (product, category, audienceCategory, blogPost) ayrı-ayrı yazılmışdı.
//
// DİQQƏT: bu funksiya YALNIZ Sanity Studio-dakı "Generate" düyməsi üçündür.
// Kateqoriya səhifələrinin URL-i (/mehsullar/qolbaqlar) saytda kateqoriya adından
// lib/slug.mjs → toCategorySlug ilə hesablanır. İkisini birləşdirmək olmaz:
// " - " olan adlarda fərqli nəticə verirlər və mövcud URL-lər dəyişərdi.
export function makeSlugify(maxLength) {
  return (input) => {
    const slug = String(input || '')
      .toLowerCase()
      .replace(/ə/g, 'e')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ğ/g, 'g')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return maxLength ? slug.slice(0, maxLength) : slug;
  };
}
