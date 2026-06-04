import { Product } from '../types';

export function toCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

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
