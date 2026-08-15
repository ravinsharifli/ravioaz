import { Product } from '../types';
import { localizedProductName, localizedProductDescription } from './productLocale';

const META_MAX = 160;

/** Google / OG üçün məhsul description mətni (dilə görə) */
export function getProductMetaDescription(product: Product, lang: 'az' | 'en' = 'az'): string {
  const raw = localizedProductDescription(product, lang).trim();
  if (raw && raw.length >= 20) {
    return raw.length > META_MAX ? `${raw.slice(0, META_MAX - 3)}...` : raw;
  }
  const name = localizedProductName(product, lang);
  return lang === 'en'
    ? `${name} — made to order, personally for you at Ravio. Free delivery across Azerbaijan, 1–3 business days.`
    : `${name} — Ravio-da fərdi sifarişlə hazırlanır. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günü.`;
}
