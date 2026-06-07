/** Sanity CDN şəkillərini WebP/AVIF + ölçü ilə optimallaşdırır */
export function toWebP(url: string, width: number = 600, quality: number = 80): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}

/** AVIF formatı — daha kiçik fayl (WebP-dən ~30% az) */
export function toAvif(url: string, width: number = 600, quality: number = 75): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('fm', 'avif');
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fit', 'max');
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
