import React, { useState, useEffect } from 'react';
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
  boxes[]{ id, name, desc, price, isActive, "imageUrl": image.asset->url }
}`;

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

// ── Hero Banner ────────────────────────────────────────────────────────────────
function HeroBanner({ onShopClick }: { onShopClick: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: '✨ Sizə özəl hazırlanır',
      title: 'Hər hədiyyə,\nsənin adınla.',
      titleAccent: 'sənin adınla.',
      desc: 'Lazer yazılı qolbaq, fərdi təsbeh, domino və daha çoxu. Sizə özəl hazırlanır.',
      bg: 'linear-gradient(135deg, #FF6A00 0%, #FF8C42 100%)',
      cta: 'Kataloqa bax →',
    },
    {
      badge: '🚀 Ödənişsiz çatdırılma',
      title: '1–3 iş günündə\nkapınıza gəlir.',
      titleAccent: 'kapınıza gəlir.',
      desc: 'Metrodaxili çatdırılma ödənişsizdir. Kuryer xidməti - Bakı,Sumqayıt,Abşeron daxil.',
      bg: 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)',
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
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', letterSpacing: 0.3 }}>{slide.badge}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 16px', whiteSpace: 'pre-line' }}>
            {slide.title.replace(slide.titleAccent, '')}
            <span style={{ opacity: 0.75 }}>{slide.titleAccent}</span>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: '0 0 28px', fontWeight: 400, maxWidth: 460 }}>{slide.desc}</p>
          <button
            onClick={onShopClick}
            style={{ padding: 'clamp(12px,2vw,15px) clamp(24px,4vw,36px)', background: '#FFFFFF', color: '#111111', border: 'none', borderRadius: 10, fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          >{slide.cta}</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 32, alignItems: 'center' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 24 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? '#FFFFFF' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
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
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EDEBE7', padding: '0 clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }} className="ravio-info-strips">
        {strips.map((s, i) => (
          <div key={s.title} className={`ravio-strip-item ravio-strip-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'clamp(14px, 2vw, 20px) 16px', borderLeft: i > 0 ? '1px solid #EDEBE7' : 'none' }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 26px)', flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 700, color: '#111111', marginBottom: 2 }}>{s.title}</div>
              <div style={{ fontSize: 'clamp(10px, 1vw, 12px)', color: '#888888', fontWeight: 400 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App Shell (içindəki bütün state burada) ───────────────────────────────
function AppShell() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [products, setProducts]               = useState<Product[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem]         = useState<CartItem | undefined>(undefined);
  const [cart, setCart]                       = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]               = useState(false);
  const [activeCategory, setActiveCategory]   = useState<string | null>(null);
  const [visible, setVisible]                 = useState(false);
  const [settings, setSettings]               = useState<any>(null);

  useEffect(() => {
    client.fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => { setProducts(raw.map(mapSanityProduct)); setLoading(false); })
      .catch(() => setLoading(false));
    client.fetch(SETTINGS_QUERY)
      .then((s: any) => setSettings(s))
      .catch(() => {});
    setTimeout(() => setVisible(true), 60);
  }, []);

  // URL dəyişdikdə scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const metroSchedule = settings?.metroSchedule || DEFAULT_METRO;
  const boxes = ((settings?.boxes || DEFAULT_BOXES) as any[]).filter(b => b.isActive !== false);

  const categories       = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.cartId === item.cartId);
      return idx >= 0 ? prev.map((c, i) => i === idx ? item : c) : [...prev, item];
    });
  };
  const handleRemove = (cartId: string) => setCart(prev => prev.filter(c => c.cartId !== cartId));
  const handleEdit   = (item: CartItem) => {
    const p = products.find(p => p.id === item.productId);
    if (p) { setSelectedProduct(p); setEditingItem(item); }
  };
  const cartCount  = cart.reduce((s, c) => s + c.quantity, 0);

  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setEditingItem(undefined);
    // məhsulun öz URL-inə keç
    if (p.slug) {
      navigate(`/mehsullar/${p.slug}`);
    }
  };

  const goToProducts = (cat?: string | null) => {
    if (cat !== undefined) setActiveCategory(cat);
    navigate('/mehsullar');
  };

  // URL-dən slug oxuyub məhsulu aç
  function ProductPageHandler() {
    const { slug } = useParams<{ slug: string }>();
    useEffect(() => {
      if (slug && products.length > 0) {
        const found = products.find(p => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
          setEditingItem(undefined);
        }
      }
    }, [slug, products]);
    // məhsullar səhifəsini render et, modal özü açılacaq
    return <ProductsPage />;
  }

  // ── Səhifələr ──────────────────────────────────────────────────────────────
  function HomePage() {
    return (
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <HeroBanner onShopClick={() => goToProducts(null)} />
        <InfoStrips />

        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>Kataloq</p>
              <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: '#111111', margin: 0, letterSpacing: '-0.3px' }}>Məhsullarımız</h2>
            </div>
            <button onClick={() => goToProducts(null)} style={{ padding: '10px 22px', background: 'transparent', border: '1.5px solid #D5D0C8', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#111111', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6A00'; e.currentTarget.style.color = '#FF6A00'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#D5D0C8'; e.currentTarget.style.color = '#111111'; }}>
              Hamısına bax →
            </button>
          </div>

          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', marginBottom: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}>
              <button onClick={() => setActiveCategory(null)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`, background: !activeCategory ? '#111111' : 'transparent', color: !activeCategory ? '#FFFFFF' : '#666666', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>Hamısı</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${activeCategory === cat ? '#111111' : '#D5D0C8'}`, background: activeCategory === cat ? '#111111' : 'transparent', color: activeCategory === cat ? '#FFFFFF' : '#666666', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>{cat}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
                  <div style={{ aspectRatio: '1/1', background: '#F5F2EC', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ height: 10, background: '#F5F2EC', borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ height: 14, background: '#F5F2EC', borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={filteredProducts.slice(0, 8)} onAddToCart={openProduct} onViewProduct={openProduct} />
          )}

          {!loading && filteredProducts.length > 8 && (
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => goToProducts(null)} style={{ padding: '14px 40px', background: '#FF6A00', color: '#FFFFFF', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 16px rgba(255,106,0,0.3)' }}>
                Daha çox məhsul gör ({filteredProducts.length - 8}+)
              </button>
            </div>
          )}
        </section>

        <section style={{ background: '#111111', padding: 'clamp(48px,7vw,96px) clamp(16px,3vw,32px)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Necə işləyir</p>
              <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>3 addımda sifariş</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
              {[
                { n: '01', icon: '🛍️', title: 'Məhsul seç',     desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
                { n: '02', icon: '✍️', title: 'Ad / mesaj yaz',  desc: 'Lazer yazısı üçün istədiyini əlavə et' },
                { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 iş günündə hazır. Metro görüşü ödənişsizdir.' },
              ].map((s, i) => (
                <div key={s.n} style={{ background: '#1A1A1A', padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,32px)', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,106,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 2, marginBottom: 8 }}>{s.n}</div>
                  <h3 style={{ fontSize: 'clamp(15px,2vw,18px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: '#F5F2EC' }}>
          <CustomerReviews />
        </section>
      </div>
    );
  }

  function ProductsPage() {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px) 64px' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <aside className="r-desktop-nav r-catalog-aside" style={{ flexShrink: 0, width: 200, position: 'sticky', top: 110, maxHeight: 'calc(100vh - 130px)', overflowY: 'auto', paddingRight: 8, scrollbarWidth: 'none' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' }}>Kateqoriyalar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => setActiveCategory(null)} style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: !activeCategory ? '#111111' : 'transparent', color: !activeCategory ? '#FFFFFF' : '#555555', fontSize: 13, fontWeight: !activeCategory ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Hamısı</span><span style={{ fontSize: 11, opacity: 0.55 }}>{products.length}</span>
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat).length;
                const sel   = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: sel ? '#111111' : 'transparent', color: sel ? '#FFFFFF' : '#555555', fontSize: 13, fontWeight: sel ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{cat}</span><span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: '#111111', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                {activeCategory || 'Bütün məhsullar'}
              </h1>
              <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0 }}>{filteredProducts.length} məhsul · Ödənişsiz çatdırılma</p>
            </div>

            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', marginBottom: 20, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }} className="r-mobile-nav">
                <button onClick={() => setActiveCategory(null)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`, background: !activeCategory ? '#111111' : 'transparent', color: !activeCategory ? '#FFFFFF' : '#666666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>Hamısı</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '7px 16px', borderRadius: 100, flexShrink: 0, border: `1.5px solid ${activeCategory === cat ? '#111111' : '#D5D0C8'}`, background: activeCategory === cat ? '#111111' : 'transparent', color: activeCategory === cat ? '#FFFFFF' : '#666666', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>{cat}</button>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
                    <div style={{ aspectRatio: '1/1', background: '#F5F2EC', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 10, background: '#F5F2EC', borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ height: 14, background: '#F5F2EC', borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={filteredProducts} onAddToCart={openProduct} onViewProduct={openProduct} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Inter', sans-serif", color: '#111111' }}>
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
          <Route path="/"              element={<HomePage />} />
          <Route path="/mehsullar"     element={<ProductsPage />} />
          <Route path="/mehsullar/:slug" element={<ProductPageHandler />} />
          <Route path="/haqqimizda"    element={<AboutUs />} />
          <Route path="/elaqe"         element={<Contact />} />
          <Route path="/catdirilma"    element={<DeliveryInfo />} />
          {/* Köhnə linklərdən gələnlər üçün yönləndirmə */}
          <Route path="*"              element={<HomePage />} />
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
          onClose={() => {
            setSelectedProduct(null);
            setEditingItem(undefined);
            // Modal bağlananda məhsullar səhifəsinə qayıt
            if (location.pathname.startsWith('/mehsullar/')) {
              navigate('/mehsullar');
            }
          }}
          onAddToCart={handleAddToCart}
          onOpenCategory={cat => {
            setSelectedProduct(null);
            setEditingItem(undefined);
            setActiveCategory(cat);
            navigate('/mehsullar');
          }}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={handleRemove}
        onEdit={handleEdit}
        onGoToProducts={() => { setCartOpen(false); navigate('/mehsullar'); }}
        metroSchedule={metroSchedule}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; margin: 0; }
        ::selection { background: #FF6A00; color: #FFFFFF; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        aside::-webkit-scrollbar { display: none; }
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) { .r-desktop-nav { display: none !important; } }
        @media (min-width: 769px) { .r-mobile-nav { display: none !important; } }
        @media (max-width: 900px) {
          .r-catalog-aside { display: none !important; }
          .r-catalog-main { margin-left: 0 !important; }
        }
        @media (max-width: 640px) {
          body { font-size: 15px; }
          input, select, textarea { font-size: 16px !important; }
          .r-section { padding-left: 16px !important; padding-right: 16px !important; }
          .ravio-info-strips { grid-template-columns: repeat(2, 1fr) !important; }
          .ravio-strip-0 { border-left: none !important; border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-1 { border-left: 1px solid #EDEBE7 !important; border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-2 { border-left: none !important; }
          .ravio-strip-3 { border-left: 1px solid #EDEBE7 !important; }
          .ravio-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}

// ── Root: BrowserRouter burada ─────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}