// lib/faqSchema.mjs — FAQPage JSON-LD qurucusu (SAF funksiya, test olunur).
// Qayda: suallar/cavablar səhifədə GÖRÜNƏN mətnlə eyni olmalıdır (Google yalnız görünən FAQ-ı qəbul edir).
export function faqPageSchema(items) {
  const list = (items || []).filter((x) => x && String(x.q || '').trim() && String(x.a || '').trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((x) => ({
      '@type': 'Question',
      name: String(x.q).trim(),
      acceptedAnswer: { '@type': 'Answer', text: String(x.a).trim() },
    })),
  };
}
