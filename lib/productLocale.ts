import { Product } from '../types';

/**
 * Rəng adları Sanity sxemində qapalı (fixed) siyahıdır — 15 dəyər.
 * Sxem dəyişikliyi tələb etmədən sadə lüğət ilə tərcümə edirik.
 */
const COLOR_NAME_EN: Record<string, string> = {
  'Qara': 'Black',
  'Ağ': 'White',
  'Gümüşü': 'Silver',
  'Qızılı': 'Gold',
  'Qırmızı': 'Red',
  'Mavi': 'Blue',
  'Sarı': 'Yellow',
  'Çəhrayı': 'Pink',
  'Bənövşəyi': 'Purple',
  'Yaşıl': 'Green',
  'Göy (Milyoner)': 'Sky Blue (Millionaire)',
  'Qara - Qızılı': 'Black & Gold',
  'Ağ - Qızılı': 'White & Gold',
  'Ağ - Qara': 'White & Black',
  'Qızılı - Qəhvəyi': 'Gold & Brown',
};

export function localizedColorName(azColorName: string | undefined | null, lang: 'az' | 'en'): string {
  if (!azColorName) return '';
  if (lang === 'en') {
    const translated = COLOR_NAME_EN[azColorName.trim()];
    if (translated) return translated;
  }
  return azColorName;
}

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

/**
 * Kateqoriya adını cari dilə görə qaytarır. `categoryMap` Azərbaycanca adı
 * İngiliscəyə xəritələyir (bax: siteSettings.js → categoryTranslations,
 * App.tsx-də quraşdırılır). Xəritə yoxdursa və ya həmin kateqoriya üçün
 * tərcümə hələ yoxdursa, Azərbaycanca ada geri düşür.
 */
export function localizedCategoryName(
  azName: string,
  lang: 'az' | 'en',
  categoryMap?: Record<string, string>
): string {
  if (lang === 'en' && categoryMap) {
    const translated = categoryMap[azName];
    if (translated && translated.trim()) return translated.trim();
  }
  return azName;
}
