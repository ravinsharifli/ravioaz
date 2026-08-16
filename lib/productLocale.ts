import { Product } from '../types';

/**
 * Rəng adları Sanity-də nəzəri cəhətdən 15 sabit seçimdir, amma real datada
 * yazı fərqləri var (böyük/kiçik hərf, boşluq, "mat/parlaq" kimi əlavə sözlər).
 * Ona görə: (1) əvvəlcə tam ifadəni (kiçik hərflə, normallaşdırılmış) axtarırıq,
 * (2) tapılmasa, sözləri ayırıb tək-tək tərcümə edirik ki, yeni/gözlənilməyən
 * kombinasiyalar da tam Azərbaycanca qalmasın.
 */
const COLOR_PHRASE_EN: Record<string, string> = {
  'qara': 'Black',
  'ağ': 'White',
  'gümüşü': 'Silver',
  'gümüş': 'Silver',
  'qızılı': 'Gold',
  'qırmızı': 'Red',
  'mavi': 'Blue',
  'sarı': 'Yellow',
  'çəhrayı': 'Pink',
  'bənövşəyi': 'Purple',
  'yaşıl': 'Green',
  'göy': 'Sky Blue',
  'göy (milyoner)': 'Sky Blue (Millionaire)',
  'göy milyoner': 'Sky Blue (Millionaire)',
  'qara mat': 'Matte Black',
  'qara parlaq': 'Glossy Black',
  'qara - qızılı': 'Black & Gold',
  'ağ - qızılı': 'White & Gold',
  'ağ - qara': 'White & Black',
  'ağ - çəhrayı': 'White & Pink',
  'ağ - gümüşü': 'White & Silver',
  'qara - gümüşü': 'Black & Silver',
  'qızılı - qəhvəyi': 'Gold & Brown',
  'sarı - yaşıl': 'Yellow & Green',
  'tünd - qırmızı': 'Dark Red',
  'mavi - bütün rənglər var': 'Blue — all colors available',
};

/** Tək sözlərin tərcüməsi — lüğətdə tam uyğunluq tapılmayanda son çarə kimi. */
const COLOR_WORD_EN: Record<string, string> = {
  'qara': 'Black',
  'ağ': 'White',
  'gümüşü': 'Silver',
  'gümüş': 'Silver',
  'qızılı': 'Gold',
  'qırmızı': 'Red',
  'mavi': 'Blue',
  'sarı': 'Yellow',
  'çəhrayı': 'Pink',
  'bənövşəyi': 'Purple',
  'yaşıl': 'Green',
  'göy': 'Sky Blue',
  'tünd': 'Dark',
  'mat': 'Matte',
  'parlaq': 'Glossy',
  'qəhvəyi': 'Brown',
  'milyoner': 'Millionaire',
};

function normalizeColorKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function localizedColorName(azColorName: string | undefined | null, lang: 'az' | 'en'): string {
  if (!azColorName) return '';
  const trimmed = azColorName.trim();
  if (lang !== 'en') return trimmed;

  const key = normalizeColorKey(trimmed);
  if (COLOR_PHRASE_EN[key]) return COLOR_PHRASE_EN[key];

  // Söz-səviyyəli fallback: "-" ilə bölünmüş hissələri "&" ilə, daxildəki
  // sözləri boşluqla tərcümə edib birləşdiririk. Tanınmayan söz olduğu kimi qalır.
  const segments = trimmed.split('-').map((seg) => seg.trim()).filter(Boolean);
  if (!segments.length) return trimmed;
  const translatedSegments = segments.map((seg) =>
    seg
      .split(/\s+/)
      .map((word) => {
        const bare = word.replace(/[()]/g, '');
        const en = COLOR_WORD_EN[bare.toLowerCase()];
        if (!en) return word;
        const openParen = word.startsWith('(') ? '(' : '';
        const closeParen = word.endsWith(')') ? ')' : '';
        return `${openParen}${en}${closeParen}`;
      })
      .join(' ')
  );
  return translatedSegments.join(' & ');
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
