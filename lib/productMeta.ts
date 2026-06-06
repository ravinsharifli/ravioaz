import { Product } from '../types';

const META_MAX = 160;

/** Google / OG üçün məhsul description mətni */
export function getProductMetaDescription(product: Product): string {
  const raw = product.description?.trim();
  if (raw && raw.length >= 20) {
    return raw.length > META_MAX ? `${raw.slice(0, META_MAX - 3)}...` : raw;
  }
  return `${product.name} — Ravio-da fərdi sifarişlə hazırlanır. Bakıda ödənişsiz çatdırılma, 1–3 iş günü.`;
}
