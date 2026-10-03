import { Product } from '../types';
import { localizedProductName, localizedProductDescription } from './productLocale';

const META_MAX = 160;

/** Google / OG üçün məhsul description mətni (dilə görə) */
export function getProductMetaDescription(product: Product, lang: 'az' | 'en' = 'az'): string {
  // Sanity-də 🔍 Qısa təsvir doldurulubsa, əvvəlcə o işlənir
  if (lang === 'az' && product.seoDescription && product.seoDescription.trim().length >= 20) {
    const seo = product.seoDescription.trim();
    return seo.length > META_MAX ? `${seo.slice(0, META_MAX - 3)}...` : seo;
  }
  const raw = localizedProductDescription(product, lang).trim();
  if (raw && raw.length >= 20) {
    return raw.length > META_MAX ? `${raw.slice(0, META_MAX - 3)}...` : raw;
  }
  const name = localizedProductName(product, lang);
  return lang === 'en'
    ? `${name} — made to order, personally for you at Ravio. Free delivery across Azerbaijan, 1–3 business days.`
    : `${name} — Ravio-da fərdi sifarişlə hazırlanır. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günü.`;
}

/** Google-da görünən başlıq (Sanity-də 🔍 Qısa başlıq doldurulubsa, o işlənir) */
export function getProductSeoTitle(product: Product, lang: 'az' | 'en' = 'az'): string {
  if (lang === 'az' && product.seoTitle && product.seoTitle.trim()) {
    return product.seoTitle.trim();
  }
  const name = localizedProductName(product, lang);
  const clean = name.replace(/\s*\|\s*Ravio\s*$/i, '').trim();
  return `${clean} | Ravio`;
}

/** Səhifədə H1 kimi görünən başlıq (Sanity-də 📝 Uzun başlıq doldurulubsa, o işlənir) */
export function getProductH1(product: Product, lang: 'az' | 'en' = 'az'): string {
  if (lang === 'az' && product.h1Override && product.h1Override.trim()) {
    return product.h1Override.trim();
  }
  return localizedProductName(product, lang);
}
