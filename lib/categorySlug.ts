import { Product } from '../types';
import { toCategorySlug } from './slug.mjs';

// Bu funksiya build skriptləri ilə ORTAQDIR (lib/slug.mjs) — burada təkrar yazma.
export { toCategorySlug };

export function fromCategorySlug(slug: string, categories: string[]): string | null {
  return categories.find((cat) => toCategorySlug(cat) === slug) ?? null;
}

export function normalizeSlug(s?: string): string {
  return decodeURIComponent((s || '').trim()).toLowerCase();
}

export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  const needle = normalizeSlug(slug);
  return products.find((p) => normalizeSlug(p.slug) === needle);
}
