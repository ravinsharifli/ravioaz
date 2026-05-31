import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { C, F, R } from './tokens';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { client } from './sanityclient';
import { Analytics } from '@vercel/analytics/react';
import { Product, CartItem, ReelPost } from './types';

import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import PWAInstallBanner from './components/PWAInstallBanner';
import CustomerReviews from './components/CustomerReviews';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import Footer from './components/Footer';

// ── Ağır komponentlər lazy load edilir (bundle splitting) ──────────────────────
const ProductModal = React.lazy(() => import('./components/ProductModal'));
const ProductPage  = React.lazy(() => import('./components/ProductPage'));
const CartDrawer   = React.lazy(() => import('./components/CartDrawer'));

// ── Sanity CDN Image Optimizer ─────────────────────────────────────────────────
// Bütün Sanity URL-lərini WebP-yə çevirir, responsive ölçü + keyfiyyət tətbiq edir.
function toWebP(url: string, width: number = 600): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w',    String(width));
    u.searchParams.set('fm',   'webp');
    u.searchParams.set('q',    '80');
    u.searchParams.set('fit',  'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}

const PRODUCTS_QUERY = `*[_type == "product"] | order(bestSellerOrder asc) {
  _id, name, "slug": slug.current, description,
  category->{ name },
  variants[] {
    modelName, colorName, price, discountPrice, stock,
    images[]{ asset->{ url } }
  },
  isPremium, premiumOrder, premiumSize,
  isBestSeller, bestSellerOrder, orderCount,
  hasBulkDiscount, bulkDiscountNote,
  bulkTiers[]{ minQty, maxQty, discountAmount, label },
  allowBoxSelection,
  customBoxOptions[]{ id, name, desc, price, isActive, "imageUrl": image.asset->url },
  coupons[]{ code, discountType, discountValue, minOrderAmount, isActive, description }
}`;

// ── heroSlides ── yeni kampaniya/bayram banner slaydları da buradan çəkilir ───
const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  "metroSchedule": {
    "stations": metroSchedule[]{
      name,
      isActive,
      "daySchedules": daySchedules[]{
        day,
        allDayOpen,
        timeSlots
      }
    }
  },
  "reelPosts": reelPosts[isActive != false]{
    label, title, subtitle, ctaText,
    "imageUrl": image.asset->url,
    "slug": product->slug.current
  },
  "heroSlides": heroSlides[isActive != false]{
    label, title, subtitle, ctaText,
    "imageUrl": image.asset->url
  },
  "reviews": reviews[isActive != false]{
    name, rating, text, date,
    "photoUrl": photo.asset->url,
    productUrl,
    isActive
  }
}`;

// ── Kateqoriya URL köməkçiləri ────────────────────────────────────────────────

/** Azərbaycan mətni → URL slug. Məs: "Qolbaqlar" → "qolbaqlar", "Təsbehlər" → "tesbehler" */
function toCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** URL slug → orijinal kateqoriya adı */
function fromCategorySlug(slug: string, categories: string[]): string | null {
  return categories.find(cat => toCategorySlug(cat) === slug) ?? null;
}

/** Hər kateqoriya üçün SEO məlumatı */
const CATEGORY_SEO: Record<string, { title: string; description: string; h1: string }> = {
  qolbaqlar: {
    title: 'Lazer Yazılı Qolbaqlar — Fərdi Hədiyyə | Ravio Bakı',
    description: 'Bakıda fərdi lazer yazılı qolbaqlar. Ad, tarix, mesaj yazılır. Pulsuz metro çatdırılma, 1–3 iş günündə hazır.',
    h1: 'Lazer Yazılı Qolbaqlar',
  },
  tesbehler: {
    title: 'Fərdi Qravürlü Təsbehlər | Ravio Bakı',
    description: 'Ağac və digər materiallardan lazer qravürlü fərdi təsbehlər. Bakıda özəl hədiyyə mağazası. Pulsuz metro çatdırılma.',
    h1: 'Fərdi Qravürlü Təsbehlər',
  },
  domino: {
    title: 'Hədiyyəlik Domino Dəsti — Lazer Yazılı | Ravio Bakı',
    description: 'Fərdi lazer yazılı domino dəstləri. Korporativ hədiyyə, ad günü üçün ideal. Bakı daxili pulsuz çatdırılma.',
    h1: 'Hədiyyəlik Domino',
  },
  hediyelik_qutular: {
    title: 'Hədiyyəlik Qutular — Premium Qablaşdırma | Ravio Bakı',
    description: 'Ravio premium hədiyyəlik qutular. Lent, köpük yastıq, bağlama + qeyd kartı. Hər hədiyyəni özəl edir.',
    h1: 'Hədiyyəlik Qutular',
  },
};

// ── Sanity data mapper ────────────────────────────────────────────────────────

function mapSanityProduct(raw: any): Product {
  const variants = (raw.variants || []).map((v: any) => ({
    modelName: v.modelName || '',
    colorName: v.colorName || '',
    images: (v.images || []).map((img: any) =>
      img?.asset?.url ? img.asset.url : typeof img === 'string' ? img : ''
    ).filter(Boolean),
    price: v.price ?? 0,
    discountPrice: v.discountPrice ?? undefined,
    stock: v.stock ?? 0,
  }));
  return {
    id: raw._id,
    name: raw.name,
    slug: raw.slug || '',
    category: raw.category?.name || '',
    description: raw.description || '',
    variants,
    isPremium: raw.isPremium || false,
    premiumOrder: raw.premiumOrder,
    premiumSize: raw.premiumSize,
    isBestSeller: raw.isBestSeller || false,
    bestSellerOrder: raw.bestSellerOrder,
    orderCount: raw.orderCount || 0,
    hasBulkDiscount: raw.hasBulkDiscount || false,
    bulkDiscountNote: raw.bulkDiscountNote || '',
    bulkTiers: raw.bulkTiers || [],
    allowBoxSelection: raw.allowBoxSelection !== false,
    customBoxOptions: (raw.customBoxOptions || [])
      .filter((b: any) => b.isActive !== false)
      .map((b: any) => ({
        id: b.id && b.id.trim() ? b.id.trim() : b.name,
        name: b.name,
        desc: b.desc || '',
        price: b.price ?? 0,
        imageUrl: b.imageUrl || null,
      })),
    coupons: (raw.coupons || []).filter((c: any) => c.isActive !== false),
  };
}

export const DEFAULT_METRO: import('./types').MetroSchedule = {
  stations: [
    {
      name: '28 May',
      isActive: true,
      daySchedules: [
        { day: 'Çərşənbə', allDayOpen: false, timeSlots: ['14:00','14:15','14:30','15:00','15:30'] },
        { day: 'Cümə',     allDayOpen: false, timeSlots: ['14:00','14:15','15:00','16:00','17:00'] },
      ],
    },
    {
      name: 'Nərimanov',
      isActive: true,
      daySchedules: [
        { day: 'Çərşənbə axşamı', allDayOpen: false, timeSlots: ['13:00','13:15','13:30','14:00'] },
        { day: 'Şənbə',           allDayOpen: true,  timeSlots: [] },
      ],
    },
  ],
};

export const DEFAULT_BOXES = [
  { id: 'simple',  name: 'Sadə qutu',    price: 0,  desc: 'Standart qablaşdırma', isActive: true, imageUrl: null },
  { id: 'premium', name: 'Orta qutu',    price: 10, desc: 'Lent + köpük yastıq',  isActive: true, imageUrl: null },
  { id: 'gift',    name: 'Premium qutu', price: 17, desc: 'Bağlama + qeyd kartı', isActive: true, imageUrl: null },
];

// ── Unified Hero Carousel ──────────────────────────────────────────────────────
// Real işlər (Sanity reelPosts), kampaniya (Sanity heroSlides)
// və statik tanıtım slaydlarını BİR karuseldə birləşdirir.
// Slayd sayı 10-20+ ola bilər. ≤10 slaydda nöqtə, >10-da sayğac göstərilir.

type HeroSlide = {
  type: 'promo' | 'work' | 'campaign';
  imageUrl?: string;
  label?: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  bg?: string; // yalnız promo slaydlar üçün
  slug?: string; // real işlər üçün məhsul slug-u
};

/** Sabit tanıtım slaydları — hardcoded, həmişə var */
const PROMO_SLIDES: HeroSlide[] = [
  {
    type: 'promo',
    label: '✨ Sizə özəl hazırlanır',
    title: 'Hər hədiyyə, sənin adınla.',
    subtitle: 'Lazer yazılı qolbaq, fərdi təsbeh, domino. Bakıda ödənişsiz çatdırılma.',
    ctaText: 'Kataloqa bax →',
    bg: 'linear-gradient(135deg, #FF6A00 0%, #FF8C42 100%)',
  },
  {
    type: 'promo',
    label: '🚀 Ödənişsiz çatdırılma',
    title: '1–3 iş günündə kapınıza gəlir.',
    subtitle: 'Kuryer pulsuz · Metro görüşü 2.99 ₼ · Azərpoçt 4.99 ₼',
    ctaText: 'Sifarişə başla →',
    bg: 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)',
  },
  {
    type: 'promo',
    label: '✨ Toplu endirim',
    title: '10+ ədəddə xüsusi qiymət.',
    subtitle: 'Məzun lentləri, korporativ hədiyyə — xüsusi endirimlə.',
    ctaText: 'Toplu sifariş →',
    bg: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)',
  },
];

/** Bütün mənbələri birləşdirir: kampaniya → tanıtım → real işlər */
function buildHeroSlides(reelPosts: ReelPost[], heroSlides: any[]): HeroSlide[] {
  const campaigns: HeroSlide[] = (heroSlides || []).map(s => ({
    type: 'campaign' as const,
    imageUrl: s.imageUrl,
    label: s.label,
    title: s.title,
    subtitle: s.subtitle,
    ctaText: s.ctaText || 'Kataloqa bax →',
  }));
  const works: HeroSlide[] = (reelPosts || []).map(p => ({
    type: 'work' as const,
    imageUrl: p.imageUrl,
    label: p.label || '📸 Real iş',
    title: p.title,
    subtitle: p.subtitle,
    ctaText: p.ctaText || 'Məhsula bax →',
    slug: (p as any).slug || '',
  }));
  // Kampaniyalar ən önə gəlir (aktual), sonra tanıtım, sonra portfolio
  return [...campaigns, ...PROMO_SLIDES, ...works];
}

function UnifiedHeroCarousel({
  reelPosts,
  heroSlides: sanityHeroSlides,
  onShopClick,
  onProductClick,
}: {
  reelPosts: ReelPost[];
  heroSlides: any[];
  onShopClick: () => void;
  onProductClick: (slug: string) => void;
}) {
  const slides = useMemo(
    () => buildHeroSlides(reelPosts, sanityHeroSlides),
    [reelPosts, sanityHeroSlides],
  );
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  // Auto-advance: hər 4.5 saniyədə bir növbəti slayd
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  // Slayd yükləndikdə cari indeks diapazonu yoxlayırıq
  const safeIdx = slides.length > 0 ? Math.min(current, slides.length - 1) : 0;
  const slide   = slides[safeIdx];

  if (!slides.length || !slide) return null;

  const arrowBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
  };

  
  return (
    <div
      style={{
        background: '#111111',
        padding: 'clamp(16px, 4vw, 48px) clamp(16px, 5vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {/* ── Ox düymələri — sağ üst ────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1280, margin: '0 auto 16px',
        display: 'flex', justifyContent: 'flex-end', gap: 8,
      }}>
        {slides.length > 10 && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: F.sans, marginRight: 4, alignSelf: 'center' }}>
            {safeIdx + 1} / {slides.length}
          </span>
        )}
        <button
          onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
          aria-label="Əvvəlki slayd"
          style={arrowBtn}
        >‹</button>
        <button
          onClick={() => setCurrent(c => (c + 1) % slides.length)}
          aria-label="Növbəti slayd"
          style={arrowBtn}
        >›</button>
      </div>

      {/* ── Əsas karusel ──────────────────────────────────────────────────── */}
      <div
        className="ravio-reelworks-inner"
        style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 16, overflow: 'hidden' }}
      >
        {/* Əsas kart — şəkil VƏ ya gradient text kart */}
        <div
          key={safeIdx}
          onClick={() => {
            if (slide.type === 'work' && (slide as any).slug) {
              onProductClick((slide as any).slug);
            } else {
              onShopClick();
            }
          }}
          className="ravio-reel-main-img"
          style={{
            flex: '0 0 clamp(200px, 45%, 420px)',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '4/5',
            background: slide.imageUrl ? '#1a1a1a' : (slide.bg || '#FF6A00'),
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'ravio-fadein 0.4s ease',
          }}
        >
          {/* ── Arxa plan ── */}
          {slide.imageUrl ? (
            <img
              src={toWebP(slide.imageUrl, 640)}
              alt={slide.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading={safeIdx === 0 ? 'eager' : 'lazy'}
              fetchPriority={safeIdx === 0 ? 'high' : 'auto'}
            />
          ) : (
            /* Promo / text slayd — dekorativ dairələr */
            <>
              <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: '20px', bottom: '-60px', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: '30px', bottom: '80px', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            </>
          )}

          {/* Şəkil üzərindəki qaranlıq gradient overlay */}
          {slide.imageUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 100%)',
            }} />
          )}

          {/* Sol üst künc etiket (badge) */}
          {slide.label && (
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: slide.imageUrl ? '#111111' : 'rgba(255,255,255,0.2)',
              borderRadius: 100, padding: '5px 12px',
              fontSize: 11, fontWeight: 700, color: '#ffffff',
              fontFamily: F.sans, letterSpacing: 0.3,
            }}>
              {slide.label}
            </div>
          )}

          {/* Alt mətn bloku */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: slide.imageUrl ? '20px 18px' : '28px 24px',
          }}>
            <p style={{
              margin: '0 0 6px',
              fontSize: slide.imageUrl ? 16 : 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 800, color: '#ffffff', fontFamily: F.sans,
              lineHeight: 1.15, letterSpacing: '-0.3px',
              textShadow: slide.imageUrl ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
            }}>
              {slide.title}
            </p>
            {slide.subtitle && (
              <p style={{
                margin: '0 0 14px',
                fontSize: slide.imageUrl ? 12 : 13,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: F.sans, lineHeight: 1.5,
                textShadow: slide.imageUrl ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
              }}>
                {slide.subtitle}
              </p>
            )}
            <div style={{
              display: 'inline-block',
              background: slide.imageUrl ? '#FF6A00' : 'rgba(255,255,255,0.95)',
              color: slide.imageUrl ? '#ffffff' : '#111111',
              borderRadius: 8, padding: '8px 18px',
              fontSize: 12, fontWeight: 700, fontFamily: F.sans,
            }}>
              {slide.ctaText}
            </div>
          </div>
        </div>

        {/* ── Kiçik önizləmə kartları (desktop sağ panel) ── */}
        <div
          className="ravio-reel-thumbs"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 12, overflow: 'hidden' }}
        >
          {slides
            .map((p, i) => ({ p, i }))
            .filter(({ i }) => i !== safeIdx)
            .slice(0, 5)
            .map(({ p, i }) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  flex: 1, borderRadius: 12, overflow: 'hidden',
                  position: 'relative', cursor: 'pointer',
                  background: p.imageUrl ? '#1a1a1a' : (p.bg || '#FF6A00'),
                  border: '2px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'stretch',
                  transition: 'border-color 0.2s',
                  maxHeight: 90,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,106,0,0.5)')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Önizləmə miniatür */}
                {p.imageUrl ? (
                  <img
                    src={toWebP(p.imageUrl, 160)}
                    alt={p.title}
                    style={{ width: 80, height: '100%', objectFit: 'cover', flexShrink: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: 80, flexShrink: 0,
                    background: p.bg || '#FF6A00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {p.type === 'campaign' ? '🎉' : '✨'}
                  </div>
                )}
                <div style={{
                  padding: '10px 14px',
                  display: 'flex', flexDirection: 'column' as const,
                  justifyContent: 'center', overflow: 'hidden',
                }}>
                  {p.label && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, marginBottom: 4, fontFamily: F.sans,
                      color: p.imageUrl ? '#FF6A00' : 'rgba(255,255,255,0.75)',
                    }}>
                      {p.label}
                    </span>
                  )}
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 600, color: '#ffffff',
                    fontFamily: F.sans, lineHeight: 1.35,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {p.title}
                  </p>
                  {p.subtitle && (
                    <p style={{
                      margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)',
                      fontFamily: F.sans,
                      overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis',
                    }}>
                      {p.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Naviqasiya nöqtələri (≤10 slayd) ─────────────────────────────── */}
      {slides.length > 1 && slides.length <= 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`${i + 1}-ci slayd`}
              style={{
                width: i === safeIdx ? 20 : 6, height: 6, borderRadius: 3,
                background: i === safeIdx ? '#FF6A00' : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes ravio-fadein {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Info Strips ────────────────────────────────────────────────────────────────
function InfoStrips() {
  const strips = [
    { icon: '🚚', title: 'Ödənişsiz çatdırılma', desc: 'Bütün sifarişlər' },
    { icon: '⚡', title: '1–3 iş günü', desc: 'Sürətli hazırlıq' },
    { icon: '✍️', title: 'Lazer yazısı', desc: 'Ad, tarix, mesaj' },
    { icon: '🎁', title: 'Hədiyyəlik qutu', desc: 'Fərqli qutu seçimi' },
  ];
  return (
    <div style={{ background: C.white, borderBottom: '1px solid #EDEBE7' }}>
      {/* Desktop: grid, Mobil: horizontal scroll */}
      <div className="ravio-info-strips-wrap">
        {strips.map((s, i) => (
          <div key={s.title} className={`ravio-strip-item ravio-strip-${i}`}>
            <span className="ravio-strip-icon">{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.black, marginBottom: 1, whiteSpace: 'nowrap' }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#888888', fontWeight: 400, whiteSpace: 'nowrap' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .ravio-info-strips-wrap {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ravio-strip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          border-left: 1px solid #EDEBE7;
        }
        .ravio-strip-item:first-child { border-left: none; }
        .ravio-strip-icon { font-size: 22px; flex-shrink: 0; }

        @media (max-width: 640px) {
          .ravio-info-strips-wrap {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
            padding: 0 16px;
            gap: 0;
          }
          .ravio-info-strips-wrap::-webkit-scrollbar { display: none; }
          .ravio-strip-item {
            flex-shrink: 0;
            border-left: none;
            border-right: 1px solid #EDEBE7;
            padding: 10px 14px;
            gap: 8px;
          }
          .ravio-strip-item:last-child { border-right: none; }
          .ravio-strip-icon { font-size: 18px; }
        }
        @media (max-width: 1024px) and (min-width: 641px) {
          .ravio-info-strips-wrap {
            grid-template-columns: repeat(2, 1fr);
          }
          .ravio-strip-0 { border-left: none; border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-1 { border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-2 { border-left: none; }
        }
      `}</style>
    </div>
  );
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, margin: 0, color: C.black }}>404</h1>
        <p style={{ margin: '16px 0 24px', fontSize: 16, color: '#555555' }}>Səhifə tapılmadı.</p>
        <button
          onClick={onHome}
          style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: C.primary, color: C.white, fontWeight: 700, cursor: 'pointer' }}
        >
          Əsas səhifəyə qayıt
        </button>
      </div>
    </div>
  );
}

function getProductPriceRange(product: Product) {
  const variants = product.variants || [];
  if (!variants.length) return { min: 0, max: 0 };
  const prices = variants.map(v => v.discountPrice ?? v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// ── Skeleton yükləmə grid ─────────────────────────────────────────────────────
function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ background: C.white, borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
          <div style={{ aspectRatio: '1/1', background: C.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 10, background: C.bg, borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 14, background: C.bg, borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page Components ───────────────────────────────────────────────────────────

// Kateqoriya sidebar + məhsul grid (həm CategoryPage həm ProductsPage istifadə edir)
function CatalogLayout({
  activeSlug,
  activeCategory,
  categories,
  products,
  filteredProducts,
  loading,
  openProduct,
}: {
  activeSlug: string | null;
  activeCategory: string | null;
  categories: string[];
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {/* Desktop Sidebar */}
      <aside className="r-desktop-nav r-catalog-aside" style={{ flexShrink: 0, width: 200, position: 'sticky', top: 110, maxHeight: 'calc(100vh - 130px)', overflowY: 'auto', paddingRight: 8, scrollbarWidth: 'none' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Kateqoriyalar</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => navigate('/mehsullar')}
            style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: !activeSlug ? C.black : 'transparent', color: !activeSlug ? C.white : '#555555', fontSize: 13, fontWeight: !activeSlug ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: F.sans, transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>Hamısı</span><span style={{ fontSize: 11, opacity: 0.55 }}>{products.length}</span>
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            const slug  = toCategorySlug(cat);
            const sel   = activeSlug === slug;
            return (
              <button
                key={cat}
                onClick={() => navigate(`/mehsullar/${slug}`)}
                style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: sel ? C.black : 'transparent', color: sel ? C.white : '#555555', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: F.sans, transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{cat}</span><span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile pills */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', marginBottom: 20, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }} className="r-mobile-nav">
            <button
              onClick={() => navigate('/mehsullar')}
              style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${!activeSlug ? C.black : C.borderMid}`, background: !activeSlug ? C.black : 'transparent', color: !activeSlug ? C.white : C.textSec, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans }}
            >Hamısı</button>
            {categories.map(cat => {
              const slug = toCategorySlug(cat);
              const sel  = activeSlug === slug;
              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/mehsullar/${slug}`)}
                  style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${sel ? C.black : C.borderMid}`, background: sel ? C.black : 'transparent', color: sel ? C.white : C.textSec, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans }}
                >{cat}</button>
              );
            })}
          </div>
        )}

        {loading ? <LoadingGrid /> : (
          <ProductGrid products={filteredProducts} onAddToCart={openProduct} onViewProduct={openProduct} />
        )}
      </div>
    </div>
  );
}

// ── /mehsullar — bütün məhsullar ──────────────────────────────────────────────
interface ProductsPageProps {
  categories: string[];
  products: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}

function ProductsPage({ categories, products, loading, openProduct }: ProductsPageProps) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px) 64px' }}>
      <Helmet>
        <title>Bütün Məhsullar | Ravio</title>
        <meta name="description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino, giftbox — bütün məhsullarımız. Bakı daxili pulsuz çatdırılma." />
        <link rel="canonical" href="https://ravio.az/mehsullar" />
        <meta property="og:title" content="Bütün Məhsullar | Ravio" />
        <meta property="og:description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino, giftbox — bütün məhsullarımız. Bakı daxili pulsuz çatdırılma." />
        <meta property="og:url" content="https://ravio.az/mehsullar" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: C.black, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Bütün məhsullar
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{products.length} məhsul · Ödənişsiz çatdırılma</p>
      </div>

      <CatalogLayout
        activeSlug={null}
        activeCategory={null}
        categories={categories}
        products={products}
        filteredProducts={products}
        loading={loading}
        openProduct={openProduct}
      />
    </div>
  );
}

// ── /mehsullar/:slug — məhsul səhifəsi VƏ ya kateqoriya səhifəsi ─────────────
interface SlugPageProps {
  selectedProduct: Product | null;
  products: Product[];
  loading: boolean;
  categories: string[];
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setEditingItem: React.Dispatch<React.SetStateAction<CartItem | undefined>>;
  openProduct: (p: Product) => void;
}

function SlugPage({
  selectedProduct,
  products,
  loading,
  categories,
  setActiveCategory,
  setSelectedProduct,
  setEditingItem,
  openProduct,
}: SlugPageProps) {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const isKnownCategory = Boolean(CATEGORY_SEO[slug]);
  const matchedCategory = useMemo(
    () => fromCategorySlug(slug, categories),
    [slug, categories]
  );
  const isCategory = isKnownCategory || (categories.length > 0 && matchedCategory !== null);

  useEffect(() => {
    if (isCategory) {
      setActiveCategory(matchedCategory);
    }
  }, [isCategory, matchedCategory]);

  // ── Kateqoriya Səhifəsi ────────────────────────────────────────────────────
  if (isCategory) {
    const filteredProducts = matchedCategory
      ? products.filter(p => p.category === matchedCategory)
      : [];
    const seo   = CATEGORY_SEO[slug];
    const title = seo?.title || (matchedCategory ? `${matchedCategory} | Ravio` : 'Məhsullar | Ravio');
    const desc  = seo?.description || `${matchedCategory || 'Məhsullar'} — Ravio-da fərdi hazırlanmış hədiyyələr. Bakı daxili pulsuz çatdırılma.`;
    const h1    = seo?.h1 || matchedCategory || slug;
    const canonicalUrl = `https://ravio.az/mehsullar/${slug}`;

    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px) 64px' }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={desc} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title"       content={title} />
          <meta property="og:description" content={desc} />
          <meta property="og:url"         content={canonicalUrl} />
          <meta property="og:type"        content="website" />
          <meta property="og:locale"      content="az_AZ" />
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: h1,
            description: desc,
            url: canonicalUrl,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Ana Səhifə',     item: 'https://ravio.az/' },
                { '@type': 'ListItem', position: 2, name: 'Məhsullar',      item: 'https://ravio.az/mehsullar' },
                { '@type': 'ListItem', position: 3, name: h1,               item: canonicalUrl },
              ],
            },
          })}</script>
        </Helmet>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: C.black, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            {h1}
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
            {loading ? 'Yüklənir...' : `${filteredProducts.length} məhsul · Ödənişsiz çatdırılma`}
          </p>
        </div>

        <CatalogLayout
          activeSlug={slug}
          activeCategory={matchedCategory}
          categories={categories}
          products={products}
          filteredProducts={filteredProducts}
          loading={loading}
          openProduct={openProduct}
        />
      </div>
    );
  }

  // ── Məhsul Tam Səhifəsi ────────────────────────────────────────────────────
  const currentProduct = slug ? products.find(p => p.slug === slug) : null;
  const primaryImage   = currentProduct?.variants?.[0]?.images?.[0] || '';
  const { min, max }   = currentProduct ? getProductPriceRange(currentProduct) : { min: 0, max: 0 };
  const totalStock     = currentProduct
    ? (currentProduct.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
    : 0;
  const productUrl = `https://ravio.az/mehsullar/${slug}`;

  if (!loading && !currentProduct) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px 56px' }}>
        <Helmet>
          <title>Məhsul tapılmadı | Ravio</title>
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href={`https://ravio.az/mehsullar/${slug}`} />
        </Helmet>
        <NotFound onHome={() => navigate('/mehsullar')} />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 56px' }}>
        <LoadingGrid />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentProduct ? `${currentProduct.name} | Ravio` : 'Məhsul | Ravio'}</title>
        <meta
          name="description"
          content={currentProduct
            ? `${currentProduct.name} — fərdi hazırlanmış hədiyyə. Qiymət ${min === max ? `${min} ₼` : `${min}–${max} ₼`}.`
            : 'Fərdi hazırlanmış hədiyyə — Ravio'}
        />
        <meta property="og:type"        content="product" />
        <meta property="og:title"       content={currentProduct ? `${currentProduct.name} | Ravio` : 'Məhsul | Ravio'} />
        <meta property="og:description" content={currentProduct ? (currentProduct.description || `${currentProduct.name} — Ravio`) : 'Məhsul'} />
        <meta property="og:url"         content={productUrl} />
        <meta property="og:locale"      content="az_AZ" />
        {primaryImage && <meta property="og:image" content={primaryImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        {primaryImage && <meta name="twitter:image" content={primaryImage} />}
        <link rel="canonical" href={productUrl} />
        {currentProduct && (() => {
          const allPrices = currentProduct.variants.map(v => v.discountPrice ?? v.price).filter(Boolean);
          const priceMin  = allPrices.length ? Math.min(...allPrices) : min;
          const priceMax  = allPrices.length ? Math.max(...allPrices) : max;
          const allImgs   = currentProduct.variants.flatMap(v => v.images || []).slice(0, 5);
          const avail     = totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
          const productSchema = {
            '@context': 'https://schema.org', '@type': 'Product',
            name: currentProduct.name, image: allImgs,
            description: currentProduct.description || `${currentProduct.name} - Ravio`,
            sku: currentProduct.id, brand: { '@type': 'Brand', name: 'Ravio' },
            offers: priceMin === priceMax
              ? { '@type': 'Offer', url: productUrl, priceCurrency: 'AZN', price: String(priceMin), availability: avail, seller: { '@type': 'Organization', name: 'Ravio' } }
              : { '@type': 'AggregateOffer', url: productUrl, priceCurrency: 'AZN', lowPrice: String(priceMin), highPrice: String(priceMax), offerCount: currentProduct.variants.length, availability: avail, seller: { '@type': 'Organization', name: 'Ravio' } },
          };
          const breadcrumbSchema = {
            '@context': 'https://schema.org', '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ana Səhifə', item: 'https://ravio.az/' },
              { '@type': 'ListItem', position: 2, name: 'Məhsullar',  item: 'https://ravio.az/mehsullar' },
              { '@type': 'ListItem', position: 3, name: currentProduct.name, item: productUrl },
            ],
          };
          return (
            <>
              <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
              <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </>
          );
        })()}
      </Helmet>

      {currentProduct && (
        <Suspense fallback={<div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}><LoadingGrid /></div>}>
          <ProductPage
            product={currentProduct}
            boxes={DEFAULT_BOXES}
            coupons={(currentProduct.coupons || []) as import('./types').Coupon[]}
            onBack={() => navigate('/mehsullar')}
            onAddToCart={(item) => {
              setSelectedProduct(null);
              setEditingItem(undefined);
              (window as any).__ravioAddToCart?.(item);
            }}
          />
        </Suspense>
      )}
    </>
  );
}

// ── Ana Səhifə ────────────────────────────────────────────────────────────────
interface HomePageProps {
  visible: boolean;
  reelPosts: ReelPost[];
  heroSlides: any[];          // Sanity heroSlides (bayram/kampaniya)
  categories: string[];
  filteredProducts: Product[];
  loading: boolean;
  activeCategory: string | null;
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  goToProducts: (cat?: string | null) => void;
  openProduct: (p: Product) => void;
  reviews: any[];
}

function HomePage({
  visible,
  reelPosts,
  heroSlides,
  categories,
  filteredProducts,
  loading,
  activeCategory,
  setActiveCategory,
  goToProducts,
  openProduct,
  reviews,
}: HomePageProps) {
  const navigate = useNavigate();
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <Helmet>
        <title>Ravio — Sizə Özəl Hədiyyələr | Bakı</title>
        <meta name="description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. Hər məhsul sizin üçün özəl hazırlanır. 17₼-dən başlayan qiymətlə, 1–3 iş günündə çatdırılma." />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Ravio — Sizə Özəl Hədiyyələr | Bakı" />
        <meta property="og:description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. 17₼-dən başlayan qiymətlə." />
        <meta property="og:url"         content="https://ravio.az/" />
        <meta property="og:image"       content="https://ravio.az/og-cover.jpg" />
        <meta property="og:locale"      content="az_AZ" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Ravio — Sizə Özəl Hədiyyələr | Bakı" />
        <meta name="twitter:description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. 17₼-dən başlayan qiymətlə." />
        <meta name="twitter:image"       content="https://ravio.az/og-cover.jpg" />
        <link rel="canonical" href="https://ravio.az/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ravio',
          url: 'https://ravio.az',
          logo: 'https://ravio.az/og-cover.jpg',
          description: 'Bakıda fərdi hədiyyələr — lazer yazılı qolbaq, təsbeh, domino, giftbox.',
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'Azerbaijani' },
          areaServed: { '@type': 'Country', name: 'Azerbaijan' },
        })}</script>
      </Helmet>

      {/* ── Vahid Hero Karusel — real işlər + tanıtım + kampaniyalar ────────── */}
      <InfoStrips />
      {/* SEO H1 — Google botu üçün, vizual olaraq gizlidir */}
      <h1 style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}>
        Lazer Yazılı Qolbaq və Fərdi Hədiyyələr Bakıda — Ravio
      </h1>

      <UnifiedHeroCarousel
        reelPosts={reelPosts}
        heroSlides={heroSlides}
        onShopClick={() => goToProducts(null)}
        onProductClick={(slug) => navigate(`/mehsullar/${slug}`)}
      />

      <section id="mehsullar" style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <span style={{
              display: 'inline-block',
              background: '#111111', color: '#ffffff',
              fontSize: 10, fontWeight: 700, letterSpacing: 1.8,
              textTransform: 'uppercase' as const,
              padding: '4px 10px', borderRadius: 6,
              marginBottom: 8,
            }}>Seçilmiş məhsullar</span>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: C.black, margin: 0, letterSpacing: '-0.3px' }}>Məhsullarımız</h2>
          </div>
          <button
            onClick={() => goToProducts(null)}
            style={{ padding: '10px 22px', background: 'transparent', border: '1.5px solid #D5D0C8', borderRadius: 8, fontSize: 13, fontWeight: 600, color: C.black, cursor: 'pointer', fontFamily: F.sans, transition: 'border-color 0.15s, background 0.15s' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.black; }}
          >
            Hamısına bax →
          </button>
        </div>

        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', marginBottom: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}>
            <button onClick={() => setActiveCategory(null)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${!activeCategory ? C.black : C.borderMid}`, background: !activeCategory ? C.black : 'transparent', color: !activeCategory ? C.white : C.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans, whiteSpace: 'nowrap' }}>Hamısı</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${activeCategory === cat ? C.black : C.borderMid}`, background: activeCategory === cat ? C.black : 'transparent', color: activeCategory === cat ? C.white : C.textSec, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans, whiteSpace: 'nowrap' }}>{cat}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: C.white, borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
                <div style={{ aspectRatio: '1/1', background: C.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 10, background: C.bg, borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 14, background: C.bg, borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredProducts.slice(0, 8)} onAddToCart={openProduct} onViewProduct={openProduct} />
        )}

        {!loading && filteredProducts.length > 8 && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button onClick={() => goToProducts(null)} style={{ padding: '14px 40px', background: C.primary, color: C.white, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F.sans, boxShadow: '0 4px 16px rgba(255,106,0,0.3)' }}>
              Daha çox məhsul gör ({filteredProducts.length - 8}+)
            </button>
          </div>
        )}
      </section>

      <section style={{ background: C.black, padding: 'clamp(48px,7vw,96px) clamp(16px,3vw,32px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Necə işləyir</p>
            <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: C.white, margin: 0, letterSpacing: '-0.5px' }}>3 addımda sifariş</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {[
              { n: '01', icon: '🛍️', title: 'Məhsul seç',     desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
              { n: '02', icon: '✍️', title: 'Ad / mesaj yaz',  desc: 'Lazer yazısı üçün istədiyini əlavə et' },
              { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 günə hazırlanır və çatdırılır' },
            ].map((s, i) => (
              <div key={s.n} style={{ background: C.darkCard, padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,32px)', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,106,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 2, marginBottom: 8 }}>{s.n}</div>
                <h3 style={{ fontSize: 'clamp(15px,2vw,18px)', fontWeight: 700, color: C.white, margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.bg }}>
        <CustomerReviews reviews={reviews} />
      </section>
    </div>
  );
}

// ── Main App Shell ─────────────────────────────────────────────────────────────
function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [products, setProducts]               = useState<Product[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem]         = useState<CartItem | undefined>(undefined);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ravio_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen]               = useState(false);
  const [activeCategory, setActiveCategory]   = useState<string | null>(null);
  const [visible, setVisible]                 = useState(false);
  const [settings, setSettings]               = useState<any>(null);

  // Cart dəyişəndə avtomatik yadda saxla
  useEffect(() => {
    try {
      localStorage.setItem('ravio_cart', JSON.stringify(cart));
    } catch {
      console.warn('Cart localStorage-a yazıla bilmədi');
    }
  }, [cart]);

  useEffect(() => {
    client.fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => { setProducts(raw.map(mapSanityProduct)); setLoading(false); })
      .catch(() => setLoading(false));
    client.fetch(SETTINGS_QUERY)
      .then((s: any) => setSettings(s))
      .catch((err) => { console.error('[Sanity] siteSettings yüklənmədi:', err); });
    setTimeout(() => setVisible(true), 60);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const metroSchedule = settings?.metroSchedule || DEFAULT_METRO;
  const boxes         = DEFAULT_BOXES;
  const reelPosts: ReelPost[]  = settings?.reelPosts  || [];
  const heroSlides: any[]      = settings?.heroSlides  || [];
  const reviews: any[]         = settings?.reviews     || [];

  const categories       = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.cartId === item.cartId);
      return idx >= 0 ? prev.map((c, i) => i === idx ? item : c) : [...prev, item];
    });
  };

  // ProductPage-dən cart-a əlavə etmək üçün global bridge
  useEffect(() => {
    (window as any).__ravioAddToCart = (item: CartItem) => {
      handleAddToCart(item);
      setCartOpen(true);
    };
    return () => { delete (window as any).__ravioAddToCart; };
  }, []);

  const handleRemove  = (cartId: string) => setCart(prev => prev.filter(c => c.cartId !== cartId));
  const handleEdit    = (item: CartItem) => {
    const p = products.find(p => p.id === item.productId);
    if (p) { setSelectedProduct(p); setEditingItem(item); }
  };
  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('ravio_cart');
  };
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const openProduct = (p: Product) => {
    if (p.slug) {
      navigate(`/mehsullar/${p.slug}`);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setEditingItem(undefined);
    document.body.style.overflow = '';
  };

  const goToProducts = (cat?: string | null) => {
    if (cat) {
      navigate(`/mehsullar/${toCategorySlug(cat)}`);
    } else {
      setActiveCategory(null);
      navigate('/mehsullar');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.sans, color: C.black }}>
      {/* Skip navigation — klaviatura istifadəçiləri üçün */}
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: -999, left: 0, zIndex: 9999,
          background: C.black, color: C.white,
          padding: '10px 20px', fontWeight: 700, fontSize: 14,
          borderRadius: '0 0 8px 0', textDecoration: 'none',
          fontFamily: F.sans,
        }}
        onFocus={e => { e.currentTarget.style.top = '0'; }}
        onBlur={e => { e.currentTarget.style.top = '-999px'; }}
      >
        Əsas məzmuna keç
      </a>
      <Navbar
        cartCount={cartCount}
        onLogoClick={() => navigate('/')}
        onCartClick={() => setCartOpen(true)}
        onAboutClick={() => navigate('/haqqimizda')}
        onContactClick={() => navigate('/elaqe')}
        onDeliveryClick={() => navigate('/catdirilma')}
        onProductsClick={() => goToProducts(null)}
        products={products}
        onViewProduct={openProduct}
      />

      <main id="main-content">
        <Routes>
          <Route path="/" element={
            <HomePage
              visible={visible}
              reelPosts={reelPosts}
              heroSlides={heroSlides}
              categories={categories}
              filteredProducts={filteredProducts}
              loading={loading}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              goToProducts={goToProducts}
              openProduct={openProduct}
              reviews={reviews}
            />
          } />
          <Route path="/mehsullar"  element={<ProductsPage categories={categories} products={products} loading={loading} openProduct={openProduct} />} />
          <Route path="/mehsullar/:slug" element={
            <SlugPage
              selectedProduct={selectedProduct}
              products={products}
              loading={loading}
              categories={categories}
              setActiveCategory={setActiveCategory}
              setSelectedProduct={setSelectedProduct}
              setEditingItem={setEditingItem}
              openProduct={openProduct}
            />
          } />
          <Route path="/haqqimizda" element={<AboutUs />} />
          <Route path="/elaqe"      element={<Contact />} />
          <Route path="/catdirilma" element={<DeliveryInfo />} />
          <Route path="*"           element={<NotFound onHome={() => navigate('/')} />} />
        </Routes>
      </main>

      <Footer
        onReviewsClick={() => navigate('/')}
        onProductsClick={() => goToProducts(null)}
        onDeliveryClick={() => navigate('/catdirilma')}
        onAboutClick={() => navigate('/haqqimizda')}
        onContactClick={() => navigate('/elaqe')}
      />

      {selectedProduct && (
        <Suspense fallback={null}>
          <ProductModal
            product={selectedProduct}
            initialData={editingItem}
            metroSchedule={metroSchedule}
            boxes={boxes}
            coupons={(selectedProduct.coupons || []) as import('./types').Coupon[]}
            onClose={closeModal}
            onAddToCart={handleAddToCart}
            onOpenCategory={(cat: string) => {
              setSelectedProduct(null);
              setEditingItem(undefined);
              document.body.style.overflow = '';
              navigate(`/mehsullar/${toCategorySlug(cat)}`);
            }}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cart}
          onRemove={handleRemove}
          onEdit={handleEdit}
          onClearCart={handleClearCart}
          onGoToProducts={() => { setCartOpen(false); navigate('/mehsullar'); }}
          metroSchedule={metroSchedule}
          coupons={products.flatMap(p => p.coupons || [])}
        />
      </Suspense>

      <PWAInstallBanner />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; margin: 0; }
        ::selection { background: var(--clr-primary); color: var(--clr-white); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        aside::-webkit-scrollbar { display: none; }
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) { .r-desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .r-mobile-nav { display: none !important; } }
        @media (max-width: 900px) {
          .r-catalog-aside { display: none !important; }
          .r-catalog-main { margin-left: 0 !important; }
        }
        /* ── UnifiedHeroCarousel responsive layout ── */
        @media (max-width: 640px) {
          .ravio-reelworks-inner { flex-direction: column !important; overflow: visible !important; }
          .ravio-reel-main-img   { flex: none !important; width: 100% !important; aspect-ratio: 4/3 !important; }
          .ravio-reel-thumbs     { display: none !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .ravio-reel-main-img { flex: 0 0 52% !important; }
          .ravio-reel-thumbs   { flex: 1 !important; }
        }
        /* ── Tablet: InfoStrips 2 sütuna keçir (768–1024px) ── */
        @media (max-width: 1024px) {
          .ravio-info-strips { grid-template-columns: repeat(2, 1fr) !important; }
          .ravio-strip-0 { border-left: none !important; border-bottom: 1px solid var(--clr-border); }
          .ravio-strip-1 { border-left: 1px solid var(--clr-border) !important; border-bottom: 1px solid var(--clr-border); }
          .ravio-strip-2 { border-left: none !important; }
          .ravio-strip-3 { border-left: 1px solid var(--clr-border) !important; }
        }
        @media (max-width: 640px) {
          body { font-size: 15px; }
          input, select, textarea { font-size: 16px !important; }
          .r-section { padding-left: 16px !important; padding-right: 16px !important; }
          .ravio-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <Analytics />
    </BrowserRouter>
  );
}