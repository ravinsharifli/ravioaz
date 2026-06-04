/** Sanity CDN şəkillərini WebP + ölçü ilə optimallaşdırır */
export function toWebP(url: string, width: number = 600): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '80');
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}
