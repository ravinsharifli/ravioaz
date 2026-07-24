/**
 * Sanity CDN şəkillərini ölçü + avtomatik format ilə optimallaşdırır.
 *
 * DİQQƏT (2026-07 düzəlişi): əvvəllər burada `fm=webp` sərt təyin olunurdu.
 * Sanity-nin rəsmi sənədlərinə görə AVIF-i `fm=avif` ilə TƏLƏB ETMƏK OLMUR —
 * AVIF yalnız brauzerin `Accept` header-i vasitəsilə, `auto=format` ilə
 * server tərəfində seçilir (asinxron generasiya olunur, ilk sorğuda WebP/JPEG
 * gələ bilər, keş isindikdən sonra AVIF gəlir). `fm=webp` təyin etsəydik,
 * bu, `auto=format`-ı əvəz edib WebP-ni məcbur edirdi — AVIF dəstəkləyən
 * brauzerlər (əksəriyyət) heç vaxt daha kiçik AVIF variantını almırdı.
 * İndi `fm` təyin OLUNMUR — Sanity CDN sorğunun Accept header-inə görə
 * avtomatik ən optimal formatı seçir (AVIF → WebP → JPEG), köhnə brauzerlər
 * belə həmişə etibarlı fallback alır.
 */
export function toWebP(url: string, width: number = 600, quality: number = 80): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    u.searchParams.set('dpr', '1');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Hero şəkli üçün xüsusi optimallaşdırma (LCP kritik)
 * Lighthouse test 640px genişliyində çalışır, 85% keyfiyyət
 */
export function toHeroWebP(url: string): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', '640');
    u.searchParams.set('q', '85');
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    u.searchParams.set('dpr', '1');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * srcset üçün çoxlu genişlik variantı — brauzer ən uyğununu seçir
 * Nümunə: toSrcSet(url, [320, 640, 960])
 */
export function toSrcSet(url: string, widths: number[] = [320, 640, 960], quality = 80): string {
  return widths
    .map(w => `${toWebP(url, w, quality)} ${w}w`)
    .join(', ');
}

/**
 * Hero üçün srcset — daha az variant, daha sürətli
 */
export function toHeroSrcSet(url: string): string {
  return [320, 640, 900]
    .map(w => `${toWebP(url, w, 85)} ${w}w`)
    .join(', ');
}
