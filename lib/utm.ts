// lib/utm.ts — reklam mənbəyini (UTM) sessiya boyu yadda saxlayır ki, sifariş qeydində
// "bu sifariş hansı kampaniyadan gəldi?" görünsün. Şəxsi məlumat DEYİL.
// İlk toxunuş qaydası: yeni UTM gələndə köhnəni əvəz edir, gəlmirsə əvvəlkini saxlayır.
const KEY = 'ravio_utm';
const FIELDS = ['source', 'medium', 'campaign', 'content', 'term'] as const;

export type UtmData = Partial<Record<(typeof FIELDS)[number], string>>;

export function captureUtm(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: UtmData = {};
    for (const f of FIELDS) {
      const v = params.get(`utm_${f}`);
      if (v) found[f] = v.slice(0, 80);
    }
    // UTM yoxdursa amma Meta/Google reklam klik identifikatoru varsa, mənbəni yenə də qeyd et
    if (!found.source && params.get('fbclid')) { found.source = 'facebook'; found.medium = found.medium || 'paid_or_social'; }
    if (!found.source && params.get('gclid')) { found.source = 'google'; found.medium = found.medium || 'cpc'; }
    if (Object.keys(found).length > 0) sessionStorage.setItem(KEY, JSON.stringify(found));
  } catch {}
}

export function getUtm(): UtmData {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}') as UtmData;
  } catch {
    return {};
  }
}
