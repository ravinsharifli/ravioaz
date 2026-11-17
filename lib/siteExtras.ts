// lib/siteExtras.ts — ana səhifə/Haqqımızda üçün əlavə Sanity məlumatları (xeyriyyə sayğacı, rəylər).
// Əsas məhsul/ayar sorğularından AYRIDIR ki, ilk yükləməni ağırlaşdırmasın (komponentlər lazy-load olunur).
import { useEffect, useState } from 'react';
import { client } from '../sanityclient';

// ─── Xeyriyyə sayğacı ────────────────────────────────────────────────────────
// Rəqəmləri Studio-da "Sayt tənzimləmələri → 🐾 Xeyriyyə sayğacı" bölməsində SİZ yeniləyirsiniz.
// Məbləğ boş/0 olarsa sayt heç nə göstərmir — uydurma rəqəm yoxdur.
export interface CharityStats {
  totalAmount?: number;
  asOfDate?: string;
  recipient?: string;
  recipientEn?: string;
  note?: string;
  noteEn?: string;
  proofPhotos?: { url: string; caption?: string; captionEn?: string }[];
}

const CHARITY_QUERY = `*[_type == "siteSettings"][0].charityStats{
  totalAmount, asOfDate, recipient, recipientEn, note, noteEn,
  "proofPhotos": proofPhotos[]{ "url": asset->url, caption, captionEn }
}`;

let charityPromise: Promise<CharityStats | null> | null = null;

export function useCharityStats(): CharityStats | null {
  const [stats, setStats] = useState<CharityStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!charityPromise) {
      charityPromise = client.fetch(CHARITY_QUERY).then((r: CharityStats | null) => r ?? null).catch(() => null);
    }
    charityPromise.then((r) => {
      if (!cancelled) setStats(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return stats;
}

// ─── Rəylər (məhsullardakı real rəylərdən) ───────────────────────────────────
export interface RawProductReviews {
  name: string;
  nameEn?: string;
  slug: string;
  reviews: { name: string; rating?: number; text: string; photoUrl?: string }[];
}

const HOME_REVIEWS_QUERY = `*[_type == "product" && count(reviews[isActive != false]) > 0] | order(name asc) {
  name, nameEn, "slug": slug.current,
  "reviews": reviews[isActive != false && defined(name) && defined(text)]{
    name, rating, text, "photoUrl": photo.asset->url
  }
}`;

let reviewsPromise: Promise<RawProductReviews[]> | null = null;

export function fetchHomeReviews(): Promise<RawProductReviews[]> {
  if (!reviewsPromise) {
    reviewsPromise = client.fetch(HOME_REVIEWS_QUERY).then((r: RawProductReviews[] | null) => r ?? []).catch(() => []);
  }
  return reviewsPromise;
}
