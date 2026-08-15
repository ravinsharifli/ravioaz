import { Product } from '../types';

/**
 * Məhsulun adını cari dilə görə qaytarır.
 * İngiliscə tərcümə hələ Sanity-də doldurulmayıbsa, Azərbaycanca ada
 * geri düşür (fallback) — beləcə İngiliscə səhifədə boş məhsul adı
 * görünmür və sifariş axını qırılmır.
 */
export function localizedProductName(product: Pick<Product, 'name' | 'nameEn'>, lang: 'az' | 'en'): string {
  if (lang === 'en' && product.nameEn && product.nameEn.trim()) {
    return product.nameEn.trim();
  }
  return product.name;
}

/**
 * Məhsulun təsvirini cari dilə görə qaytarır. Eyni fallback məntiqi.
 */
export function localizedProductDescription(
  product: Pick<Product, 'description' | 'descriptionEn'>,
  lang: 'az' | 'en'
): string {
  if (lang === 'en' && product.descriptionEn && product.descriptionEn.trim()) {
    return product.descriptionEn.trim();
  }
  return product.description || '';
}
