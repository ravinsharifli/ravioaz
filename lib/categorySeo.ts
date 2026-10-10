// ─────────────────────────────────────────────────────────────────────────────
// Kateqoriya SEO mətnlərinin TƏK mənbəyi: seo-categories.mjs (kökdə).
// Əvvəl eyni mətnlər həm orada, həm burada ayrı-ayrı yazılmışdı və "sinxron saxla"
// qeydi vardı — biri unudulsa, build zamanı prerender olunan başlıq ilə brauzerdə
// Helmet-in qoyduğu başlıq fərqlənirdi. İndi bu fayl həmin siyahıdan avtomatik qurulur;
// yeni kateqoriya əlavə etmək üçün YALNIZ seo-categories.mjs redaktə olunur.
// ─────────────────────────────────────────────────────────────────────────────
import { CATEGORY_PAGES } from '../seo-categories.mjs';

export const CATEGORY_SEO: Record<string, { title: string; description: string; h1: string }> =
  Object.fromEntries(
    CATEGORY_PAGES.map((c) => [c.slug, { title: c.title, description: c.desc, h1: c.h1 }])
  );
