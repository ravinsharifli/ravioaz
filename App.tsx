import React, { useState, useEffect, useRef, useMemo } from 'react';
import { C, F, R } from './tokens';
import { Helmet } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { client } from './sanityclient';
import { Product, CartItem } from './types';

import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CustomerReviews from './components/CustomerReviews';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import Footer from './components/Footer';

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
  allowBoxSelection
}`;

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
  boxes[]{ id, name, desc, price, isActive, "imageUrl": image.asset->url },
  coupons[]{ code, discountType, discountValue, minOrderAmount, isActive, description },
  "reelPosts": reelPosts[isActive != false]{
    label, title, subtitle, ctaText,
    "imageUrl": image.asset->url
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

// ── Real İşlər Karusel Banner ──────────────────────────────────────────────────
function RealWorksBanner({ posts, onShopClick }: { posts: import('./types').ReelPost[]; onShopClick: () => void }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (posts.length <= 1 || isHovered) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % posts.length), 3500);
    return () => clearInterval(t);
  }, [posts.length, isHovered]);

  if (!posts.length) return null;

  const post = posts[current];

  return (
    <div style={{
      background: C.black,
      padding: '48px clamp(16px, 5vw, 48px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: C.primary, fontFamily: F.sans, marginBottom: 6 }}>
            📸 Real İşlər
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, color: C.white, fontFamily: F.sans, letterSpacing: '-0.5px' }}>
            Hazırladığımız işlər
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCurrent(c => (c - 1 + posts.length) % posts.length)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)', color: C.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >‹</button>
          <button
            onClick={() => setCurrent(c => (c + 1) % posts.length)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)', color: C.white, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}
          >›</button>
        </div>
      </div>

      <div className="ravio-reelworks-inner" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 16, overflow: 'hidden' }}>
        <div
          key={post.imageUrl + current}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="ravio-reel-main-img"
          style={{
            flex: '0 0 clamp(200px, 45%, 420px)',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '4/5',
            background: '#1a1a1a',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'ravio-fadein 0.4s ease',
          }}
          onClick={onShopClick}
        >
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          }} />
          {post.label && (
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: C.primary, borderRadius: 100,
              padding: '5px 12px', fontSize: 11, fontWeight: 700, color: C.white,
              fontFamily: F.sans, letterSpacing: 0.3,
            }}>
              {post.label}
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: C.white, fontFamily: F.sans, lineHeight: 1.3 }}>
              {post.title}
            </p>
            {post.subtitle && (
              <p style={{ margin: '0 0 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: F.sans }}>
                {post.subtitle}
              </p>
            )}
            <div style={{
              display: 'inline-block',
              background: C.primary, color: C.white,
              borderRadius: 8, padding: '8px 18px',
              fontSize: 12, fontWeight: 700, fontFamily: F.sans,
            }}>
              {post.ctaText || 'Sifariş et →'}
            </div>
          </div>
        </div>

        <div className="ravio-reel-thumbs" style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 12, overflow: 'hidden' }}>
          {posts
            .map((p, i) => ({ p, i }))
            .filter(({ i }) => i !== current)
            .slice(0, 3)
            .map(({ p, i }) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  flex: 1, borderRadius: 12, overflow: 'hidden',
                  position: 'relative', cursor: 'pointer', background: '#1a1a1a',
                  border: '2px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'stretch',
                  transition: 'border-color 0.2s',
                  maxHeight: 120,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,106,0,0.5)')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    style={{ width: 80, height: '100%', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', overflow: 'hidden' }}>
                  {p.label && (
                    <span style={{ fontSize: 10, color: C.primary, fontWeight: 700, marginBottom: 4, fontFamily: F.sans }}>
                      {p.label}
                    </span>
                  )}
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.white, fontFamily: F.sans, lineHeight: 1.35,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                    {p.title}
                  </p>
                  {p.subtitle && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: F.sans,
                      overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis' }}>
                      {p.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {posts.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
          {posts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                background: i === current ? C.primary : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s',
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

function HeroBanner({ onShopClick }: { onShopClick: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: '✨ Sizə özəl hazırlanır',
      title: 'Hər hədiyyə,\nsənin adınla.',
      titleAccent: 'sənin adınla.',
      desc: 'Lazer yazılı qolbaq, fərdi təsbeh, domino və daha çoxu. Sizə özəl hazırlanır.',
      bg: 'linear-gradient(135deg, var(--clr-primary) 0%, #FF8C42 100%)',
      cta: 'Kataloqa bax →',
    },
    {
      badge: '🚀 Ödənişsiz çatdırılma',
      title: '1–3 iş günündə\nkapınıza gəlir.',
      titleAccent: 'kapınıza gəlir.',
      desc: 'Metrodaxili çatdırılma ödənişsizdir. Kuryer xidməti - Bakı,Sumqayıt,Abşeron daxil.',
      bg: 'linear-gradient(135deg, var(--clr-dark) 0%, #2a2a2a 100%)',
      cta: 'Sifarişə başla →',
    },
    {
      badge: '✨ Toplu endirim',
      title: '10+ ədəddə\nxüsusi qiymət.',
      titleAccent: 'xüsusi qiymət.',
      desc: 'Məzun lentləri, korporativ hədiyyə, sinif sifarişi — xüsusi endirimlə.',
      bg: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)',
      cta: 'Toplu sifariş →',
    },
  ];

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div style={{
      background: slide.bg,
      transition: 'background 0.8s ease',
      padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 48px)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 'clamp(220px, 35vw, 340px)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: '40px', bottom: '-80px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '6px 16px', marginBottom: 20, backdropFilter: 'blur(4px)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.white, letterSpacing: 0.3 }}>{slide.badge}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: C.white, lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 16px', whiteSpace: 'pre-line' }}>
            {slide.title.replace(slide.titleAccent, '')}
            <span style={{ opacity: 0.75 }}>{slide.titleAccent}</span>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: '0 0 28px', fontWeight: 400, maxWidth: 460 }}>{slide.desc}</p>
          <button
            onClick={() => {
              onShopClick();
              try { if (typeof (window as any).trackEvent === 'function') (window as any).trackEvent('hero_cta_clicked', { slide: currentSlide, cta: slide.cta }); } catch(_) {}
            }}
            style={{ padding: 'clamp(12px,2vw,15px) clamp(24px,4vw,36px)', background: C.white, color: C.black, border: 'none', borderRadius: 10, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, cursor: 'pointer', fontFamily: F.sans, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          >{slide.cta}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 32, alignItems: 'center' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 24 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? C.white : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Info Strips ────────────────────────────────────────────────────────────────
function InfoStrips() {
  const strips = [
    { icon: '🚚', title: 'Ödənişsiz çatdırılma', desc: 'Bakı daxilindəki bütün sifarişlər' },
    { icon: '⚡', title: '1–3 iş günü', desc: 'Sürətli hazırlıq və çatdırılma' },
    { icon: '✍️', title: 'Lazer yazısı', desc: 'İstədiyin ad, tarix, mesaj' },
    { icon: '🎁', title: 'Hədiyyəlik qablaşdırma', desc: 'Fərqli qutu seçimi və hədiyyəlik bağlama.' },
  ];
  return (
    <div style={{ background: C.white, borderBottom: '1px solid #EDEBE7', padding: '0 clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }} className="ravio-info-strips">
        {strips.map((s, i) => (
          <div key={s.title} className={`ravio-strip-item ravio-strip-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'clamp(14px, 2vw, 20px) 16px', borderLeft: i > 0 ? '1px solid #EDEBE7' : 'none' }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 26px)', flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 700, color: C.black, marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 'clamp(10px, 1vw, 12px)', color: '#888888', fontWeight: 400 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
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
  activeSlug,      // seçili kateqoriya URL slug-u (null = hamısı)
  activeCategory,  // seçili kateqoriya adı
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
        <link rel="canonical" href="https://ravioaz.vercel.app/mehsullar" />
        <meta property="og:title" content="Bütün Məhsullar | Ravio" />
        <meta property="og:description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino, giftbox — bütün məhsullarımız. Bakı daxili pulsuz çatdırılma." />
        <meta property="og:url" content="https://ravioaz.vercel.app/mehsullar" />
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
// Bu komponent URL slug-un məhsula yoxsa kateqoriyaya aid olduğunu müəyyən edir.
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

  // Slug kateqoriyadırmı? (CATEGORY_SEO-da varsa dərhal müəyyənləşir, əks halda məhsullar yüklənəndə)
  const isKnownCategory = Boolean(CATEGORY_SEO[slug]);
  const matchedCategory = useMemo(
    () => fromCategorySlug(slug, categories),
    [slug, categories]
  );
  const isCategory = isKnownCategory || (categories.length > 0 && matchedCategory !== null);

  // Kateqoriya state-ini sinxronlaşdır
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
    const canonicalUrl = `https://ravioaz.vercel.app/mehsullar/${slug}`;

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
                { '@type': 'ListItem', position: 1, name: 'Ana Səhifə',     item: 'https://ravioaz.vercel.app/' },
                { '@type': 'ListItem', position: 2, name: 'Məhsullar',      item: 'https://ravioaz.vercel.app/mehsullar' },
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

  // ── Məhsul Səhifəsi ────────────────────────────────────────────────────────
  if (selectedProduct) return null;

  const currentProduct = slug ? products.find(p => p.slug === slug) : null;
  const primaryImage   = currentProduct?.variants?.[0]?.images?.[0] || '';
  const { min, max }   = currentProduct ? getProductPriceRange(currentProduct) : { min: 0, max: 0 };
  const totalStock     = currentProduct
    ? (currentProduct.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
    : 0;
  const productUrl = `https://ravioaz.vercel.app/mehsullar/${slug}`;

  if (!loading && !currentProduct) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px 56px' }}>
        <Helmet>
          <title>Məhsul tapılmadı | Ravio</title>
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href={productUrl} />
        </Helmet>
        <NotFound onHome={() => navigate('/mehsullar')} />
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
          const allPrices  = currentProduct.variants.map(v => v.discountPrice ?? v.price).filter(Boolean);
          const priceMin   = allPrices.length ? Math.min(...allPrices) : min;
          const priceMax   = allPrices.length ? Math.max(...allPrices) : max;
          const allImages  = currentProduct.variants.flatMap(v => v.images || []).slice(0, 5);
          const avail      = totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: currentProduct.name,
            image: allImages,
            description: currentProduct.description || `${currentProduct.name} - Ravio`,
            sku: currentProduct.id,
            brand: { '@type': 'Brand', name: 'Ravio' },
            offers: priceMin === priceMax
              ? {
                  '@type': 'Offer',
                  url: productUrl,
                  priceCurrency: 'AZN',
                  price: String(priceMin),
                  availability: avail,
                  seller: { '@type': 'Organization', name: 'Ravio' },
                }
              : {
                  '@type': 'AggregateOffer',
                  url: productUrl,
                  priceCurrency: 'AZN',
                  lowPrice: String(priceMin),
                  highPrice: String(priceMax),
                  offerCount: currentProduct.variants.length,
                  availability: avail,
                  seller: { '@type': 'Organization', name: 'Ravio' },
                },
          };

          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ana Səhifə', item: 'https://ravioaz.vercel.app/' },
              { '@type': 'ListItem', position: 2, name: 'Məhsullar',  item: 'https://ravioaz.vercel.app/mehsullar' },
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

      <style>{`
        .ravio-product-article {
          display: grid;
          grid-template-columns: minmax(280px, 480px) 1fr;
          gap: 24px;
          background: ${C.white};
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #EDEBE7;
        }
        .ravio-product-img {
          width: 100%;
          border-radius: 10px;
          object-fit: cover;
          display: block;
        }
        .ravio-product-order-btn {
          margin-top: 12px;
          padding: 16px 28px;
          background: ${C.primary};
          color: ${C.white};
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          font-size: 16px;
          font-family: ${F.sans};
          width: 100%;
          box-shadow: 0 4px 16px rgba(255,106,0,0.28);
          transition: background 0.15s;
          letter-spacing: 0.2px;
        }
        .ravio-product-order-btn:hover { background: #E55E00; }
        @media (max-width: 680px) {
          .ravio-product-article {
            grid-template-columns: 1fr !important;
            padding: 14px !important;
            gap: 16px !important;
          }
          .ravio-product-img {
            max-height: 300px;
            object-fit: contain;
            background: ${C.bg};
          }
          .ravio-product-page-wrap {
            padding: '20px 12px 48px' !important;
          }
        }
      `}</style>
      <div className="ravio-product-page-wrap" style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 16px 56px' }}>
        {loading && <p style={{ color: C.textSec }}>Yüklənir...</p>}

        {currentProduct && (
          <>
            <div style={{ marginBottom: 16 }}>
              <button
                onClick={() => navigate('/mehsullar')}
                style={{ border: 'none', background: 'transparent', color: C.primary, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 14 }}
              >
                ← Bütün məhsullara qayıt
              </button>
            </div>

            <article className="ravio-product-article">
              <div>
                {primaryImage ? (
                  <img src={primaryImage} alt={currentProduct.name} className="ravio-product-img" />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 10, background: C.bg }} />
                )}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 'clamp(22px,3vw,34px)', color: C.black, lineHeight: 1.25 }}>{currentProduct.name}</h1>
                <p style={{ color: C.textSec, marginTop: 6, marginBottom: 0, fontSize: 13 }}>{currentProduct.category || 'Məhsul'}</p>
                <p style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, margin: '10px 0 4px', color: C.black, letterSpacing: '-0.5px' }}>
                  {min === max ? `${min} ₼` : `${min} ₼ – ${max} ₼`}
                </p>
                <p style={{ color: totalStock > 0 ? C.success : C.error, marginTop: 0, fontWeight: 600, fontSize: 14 }}>
                  {totalStock > 0 ? `✓ Stokda var` : 'Stokda yoxdur'}
                </p>
                <p style={{ lineHeight: 1.7, color: '#333333', marginTop: 10, fontSize: 14 }}>
                  {currentProduct.description || `${currentProduct.name} üçün fərdi yazı əlavə edə bilərsiniz.`}
                </p>
                <button
                  className="ravio-product-order-btn"
                  onClick={() => {
                    setSelectedProduct(currentProduct);
                    setEditingItem(undefined);
                  }}
                >
                  🛒 Sifariş et →
                </button>
              </div>
            </article>
          </>
        )}
      </div>
    </>
  );
}

// ── Ana Səhifə ────────────────────────────────────────────────────────────────
interface HomePageProps {
  visible: boolean;
  reelPosts: import('./types').ReelPost[];
  categories: string[];
  filteredProducts: Product[];
  loading: boolean;
  activeCategory: string | null;
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  goToProducts: (cat?: string | null) => void;
  openProduct: (p: Product) => void;
}

function HomePage({
  visible,
  reelPosts,
  categories,
  filteredProducts,
  loading,
  activeCategory,
  setActiveCategory,
  goToProducts,
  openProduct,
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
        <meta property="og:url"         content="https://ravioaz.vercel.app/" />
        <meta property="og:image"       content="https://ravioaz.vercel.app/og-cover.jpg" />
        <meta property="og:locale"      content="az_AZ" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Ravio — Sizə Özəl Hədiyyələr | Bakı" />
        <meta name="twitter:description" content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. 17₼-dən başlayan qiymətlə." />
        <meta name="twitter:image"       content="https://ravioaz.vercel.app/og-cover.jpg" />
        <link rel="canonical" href="https://ravioaz.vercel.app/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ravio',
          url: 'https://ravioaz.vercel.app',
          logo: 'https://ravioaz.vercel.app/og-cover.jpg',
          description: 'Bakıda fərdi hədiyyələr — lazer yazılı qolbaq, təsbeh, domino, giftbox.',
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'Azerbaijani' },
          areaServed: { '@type': 'Country', name: 'Azerbaijan' },
        })}</script>
      </Helmet>
      <HeroBanner onShopClick={() => goToProducts(null)} />
      {reelPosts.length > 0 && (
        <RealWorksBanner posts={reelPosts} onShopClick={() => goToProducts(null)} />
      )}
      <InfoStrips />

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>Kataloq</p>
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
              { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 iş günündə hazır. Metro görüşü ödənişsizdir.' },
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
        <CustomerReviews />
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

  const isClosingModal = useRef(false);
  // Modal açılmadan əvvəlki path-i yadda saxla — bağlayanda geri qayıt
  const modalReturnPath = useRef('/mehsullar');

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
      .catch(() => {});
    setTimeout(() => setVisible(true), 60);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const metroSchedule = settings?.metroSchedule || DEFAULT_METRO;
  const boxes = ((settings?.boxes || DEFAULT_BOXES) as any[]).filter((b: any) => b.isActive !== false);
  const coupons = (settings?.coupons || []) as import('./types').Coupon[];
  const reelPosts: import('./types').ReelPost[] = settings?.reelPosts || [];

  const categories       = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.cartId === item.cartId);
      return idx >= 0 ? prev.map((c, i) => i === idx ? item : c) : [...prev, item];
    });
  };
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
    isClosingModal.current = false;
    // Cari path-i yadda saxla (kateqoriya səhifəsindən gəlibsə oraya qayıt)
    modalReturnPath.current = location.pathname;
    setSelectedProduct(p);
    setEditingItem(undefined);
    if (p.slug) {
      window.history.pushState(null, '', `/mehsullar/${p.slug}`);
    }
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    isClosingModal.current = true;
    setSelectedProduct(null);
    setEditingItem(undefined);
    document.body.style.overflow = '';
    // Modal açılmadan əvvəlki səhifəyə qayıt (kateqoriya və ya ümumi məhsullar)
    window.history.pushState(null, '', modalReturnPath.current || '/mehsullar');
    setTimeout(() => { isClosingModal.current = false; }, 500);
  };

  // Kateqoriya URL-ə navigate et (string), yoxsa /mehsullar-a qayıt (null/undefined)
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

      <main>
        <Routes>
          <Route path="/"           element={<HomePage visible={visible} reelPosts={reelPosts} categories={categories} filteredProducts={filteredProducts} loading={loading} activeCategory={activeCategory} setActiveCategory={setActiveCategory} goToProducts={goToProducts} openProduct={openProduct} />} />
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
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          metroSchedule={metroSchedule}
          boxes={boxes}
          onClose={closeModal}
          onAddToCart={handleAddToCart}
          onOpenCategory={(cat: string) => {
            isClosingModal.current = true;
            setSelectedProduct(null);
            setEditingItem(undefined);
            document.body.style.overflow = '';
            // Kateqoriya URL-inə navigate et
            navigate(`/mehsullar/${toCategorySlug(cat)}`);
            setTimeout(() => { isClosingModal.current = false; }, 500);
          }}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={handleRemove}
        onEdit={handleEdit}
        onClearCart={handleClearCart}
        onGoToProducts={() => { setCartOpen(false); navigate('/mehsullar'); }}
        metroSchedule={metroSchedule}
        coupons={coupons}
      />

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
        /* ── RealWorksBanner mobile layout ── */
        @media (max-width: 640px) {
          .ravio-reelworks-inner { flex-direction: column !important; overflow: visible !important; }
          .ravio-reel-main-img   { flex: none !important; width: 100% !important; aspect-ratio: 16/9 !important; }
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
    </BrowserRouter>
  );
}