import { ReelPost } from '../../types';
import { PROMO_SLIDES } from '../../constants/defaults';

export type HeroSlide = {
  type: 'promo' | 'work' | 'campaign';
  imageUrl?: string;
  label?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  bg?: string;
  slug?: string;
};

export function buildHeroSlides(reelPosts: ReelPost[], heroSlides: any[]): HeroSlide[] {
  const campaigns: HeroSlide[] = (heroSlides || []).map((s) => ({
    type: 'campaign' as const,
    imageUrl: s.imageUrl,
    label: s.label,
    title: s.title,
    subtitle: s.subtitle,
    ctaText: s.ctaText || 'Kataloqa bax →',
  }));
  const works: HeroSlide[] = (reelPosts || []).map((p) => ({
    type: 'work' as const,
    imageUrl: p.imageUrl,
    label: p.label || '📸 Real iş',
    title: p.title,
    subtitle: p.subtitle,
    ctaText: p.ctaText || 'Məhsula bax →',
    slug: (p as any).slug || '',
  }));
  return [...campaigns, ...PROMO_SLIDES, ...works];
}
