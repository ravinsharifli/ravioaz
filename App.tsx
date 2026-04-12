import React, { useState, useEffect } from 'react';
import { client } from './sanityclient';
import { Product, CartItem, AppView } from './types';

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
  _id, name, description,
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
  metroSchedule,
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

const DEFAULT_METRO = {
  stations: ['28 May', 'Həzi Aslanov', 'Nərimanov', 'İçərişəhər', 'Memar Əcəmi'],
  days: ['Çərşənbə axşamı', 'Cümə axşamı'],
  times: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
};

const DEFAULT_BOXES = [
  { id: 'simple',  name: 'Sadə qutu',    price: 0,  desc: 'Standart qablaşdırma', isActive: true, imageUrl: null },
  { id: 'premium', name: 'Orta qutu',    price: 10, desc: 'Lent + köpük yastıq',  isActive: true, imageUrl: null },
  { id: 'gift',    name: 'Premium qutu', price: 17, desc: 'Bağlama + qeyd kartı', isActive: true, imageUrl: null },
];

export { DEFAULT_METRO, DEFAULT_BOXES };

// ── Hero Banner Component ──────────────────────────────────────────────────────
function HeroBanner({ onShopClick }: { onShopClick: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: '✨ Sizə özəl hazırlanır',
      title: 'Hər hədiyyə,\nsənin adınla.',
      titleAccent: 'sənin adınla.',
      desc: 'Lazer yazılı qolbaq, fərdi təsbeh, domino və daha çoxu. 17 ₼-dən başlayır.',
      bg: 'linear-gradient(135deg, #FF6A00 0%, #FF8C42 100%)',
      cta: 'Kataloqa bax →',
    },
    {
      badge: '🚀 Ödənişsiz çatdırılma',
      title: '1–3 iş günündə\nkapınıza gəlir.',
      titleAccent: 'kapınıza gəlir.',
      desc: 'Metro görüşü ödənişsizdir. Kuryer xidməti Bakı + Abşeron ərazisi üçün 4.99 ₼.',
      bg: 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)',
      cta: 'Sifarişə başla →',
    },
    {
      badge: '✨ Toplu endirim',
      title: '10+ ədəddə\nxüsusi qiymət.',
      titleAccent: 'xüsusi qiymət.',
      desc: 'Məzun lentləri, korporativ hədiyyə, sinif sifarişi — 3 AZN/ədəddən.',
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
      borderRadius: 0,
      padding: 'clamp(32px, 6vw, 64px) clamp(20px, 5vw, 48px)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 'clamp(220px, 35vw, 340px)',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', right: '-60px', top: '-60px',
        width: 260, height: 260, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: '40px', bottom: '-80px',
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 620 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 20,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', letterSpacing: 0.3 }}>
              {slide.badge}
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.15, letterSpacing: '-1px',
            margin: '0 0 16px',
            whiteSpace: 'pre-line',
          }}>
            {slide.title.replace(slide.titleAccent, '')}
            <span style={{ opacity: 0.75 }}>{slide.titleAccent}</span>
          </h2>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(13px, 2vw, 16px)',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.65, margin: '0 0 28px',
            fontWeight: 400, maxWidth: 460,
          }}>
            {slide.desc}
          </p>

          {/* CTA */}
          <button
            onClick={onShopClick}
            style={{
              padding: 'clamp(12px,2vw,15px) clamp(24px,4vw,36px)',
              background: '#FFFFFF',
              color: '#111111',
              border: 'none', borderRadius: 10,
              fontSize: 'clamp(13px,1.5vw,15px)', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          >
            {slide.cta}
          </button>
        </div>

        {/* Slide dots */}
        <div style={{
          display: 'flex', gap: 8, marginTop: 32,
          alignItems: 'center',
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i === currentSlide ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Info Strips (mini banners below hero) ──────────────────────────────────────
function InfoStrips() {
  const strips = [
    { icon: '🚚', title: 'Ödənişsiz çatdırılma', desc: 'Bakı daxilindəki bütün sifarişlər' },
    { icon: '⚡', title: '1–3 iş günü', desc: 'Sürətli hazırlıq və çatdırılma' },
    { icon: '✍️', title: 'Lazer yazısı', desc: 'İstədiyin ad, tarix, mesaj' },
    { icon: '💬', title: 'WhatsApp dəstək', desc: 'Hər sualın üçün hazırıq' },
  ];
  return (
    <div style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #EDEBE7',
      padding: '0 clamp(16px, 4vw, 32px)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 0,
      }}>
        {strips.map((s, i) => (
          <div key={s.title} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 'clamp(14px, 2vw, 20px) 16px',
            borderLeft: i > 0 ? '1px solid #EDEBE7' : 'none',
          }}>
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

export default function App() {
  const [products, setProducts]               = useState<Product[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [view, setView]                       = useState<AppView>('home');
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
  const openProduct = (p: Product) => { setSelectedProduct(p); setEditingItem(undefined); };
  const goToProducts = (cat?: string | null) => {
    setView('products' as AppView);
    if (cat !== undefined) setActiveCategory(cat);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'Inter', sans-serif", color: '#111111' }}>
      <Navbar
        cartCount={cartCount}
        onLogoClick={() => setView('home')}
        onCartClick={() => setCartOpen(true)}
        onAboutClick={() => setView('about')}
        onContactClick={() => setView('contact')}
        onDeliveryClick={() => setView('delivery')}
        onProductsClick={() => goToProducts(null)}
        products={products}
        onViewProduct={openProduct}
      />

      <main>
        {/* ── HOME ── */}
        {view === 'home' && (
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            {/* HERO BANNER — slider */}
            <HeroBanner onShopClick={() => goToProducts(null)} />

            {/* INFO STRIPS */}
            <InfoStrips />

            {/* PRODUCTS SECTION */}
            <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,32px)' }}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>
                    Kataloq
                  </p>
                  <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: '#111111', margin: 0, letterSpacing: '-0.3px' }}>
                    Məhsullarımız
                  </h2>
                </div>
                <button
                  onClick={() => goToProducts(null)}
                  style={{
                    padding: '10px 22px', background: 'transparent',
                    border: '1.5px solid #D5D0C8', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, color: '#111111',
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6A00'; e.currentTarget.style.color = '#FF6A00'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D5D0C8'; e.currentTarget.style.color = '#111111'; }}
                >
                  Hamısına bax →
                </button>
              </div>

              {/* Category pills (mobile-friendly) */}
              {categories.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  <button onClick={() => setActiveCategory(null)} style={{
                    padding: '7px 16px', borderRadius: 100, flexShrink: 0,
                    border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`,
                    background: !activeCategory ? '#111111' : 'transparent',
                    color: !activeCategory ? '#FFFFFF' : '#666666',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
                  }}>Hamısı</button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                      padding: '7px 16px', borderRadius: 100, flexShrink: 0,
                      border: `1.5px solid ${activeCategory === cat ? '#111111' : '#D5D0C8'}`,
                      background: activeCategory === cat ? '#111111' : 'transparent',
                      color: activeCategory === cat ? '#FFFFFF' : '#666666',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
                    }}>{cat}</button>
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
                <ProductGrid
                  products={filteredProducts.slice(0, 8)}
                  onAddToCart={openProduct}
                  onViewProduct={openProduct}
                />
              )}

              {!loading && filteredProducts.length > 8 && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    onClick={() => goToProducts(null)}
                    style={{
                      padding: '14px 40px', background: '#FF6A00', color: '#FFFFFF',
                      border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      boxShadow: '0 4px 16px rgba(255,106,0,0.3)',
                    }}
                  >
                    Daha çox məhsul gör ({filteredProducts.length - 8}+)
                  </button>
                </div>
              )}
            </section>

            {/* HOW IT WORKS */}
            <section style={{ background: '#111111', padding: 'clamp(48px,7vw,96px) clamp(16px,3vw,32px)' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px' }}>
                    Necə işləyir
                  </p>
                  <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                    3 addımda sifariş
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
                  {[
                    { n: '01', icon: '🛍️', title: 'Məhsul seç',     desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
                    { n: '02', icon: '✍️', title: 'Ad / mesaj yaz',  desc: 'Lazer yazısı üçün istədiyini əlavə et' },
                    { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 iş günündə hazır. Metro görüşü ödənişsizdir.' },
                  ].map((s, i) => (
                    <div key={s.n} style={{
                      background: '#1A1A1A', padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,32px)',
                      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
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
        )}

        {/* ── PRODUCTS VIEW ── */}
        {(view as string) === 'products' && (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,32px) 64px' }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

              {/* SIDEBAR — desktop only */}
              <aside
                className="r-desktop-nav"
                style={{
                  flexShrink: 0,
                  width: 200,
                  position: 'sticky',
                  top: 110,
                  maxHeight: 'calc(100vh - 130px)',
                  overflowY: 'auto',
                  paddingRight: 8,
                  scrollbarWidth: 'none',
                }}
              >
                <p style={{
                  fontSize: 10, fontWeight: 700, color: '#FF6A00',
                  letterSpacing: 1.5, textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}>Kateqoriyalar</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                      padding: '10px 12px', borderRadius: 8, border: 'none',
                      background: !activeCategory ? '#111111' : 'transparent',
                      color: !activeCategory ? '#FFFFFF' : '#555555',
                      fontSize: 13, fontWeight: !activeCategory ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                    onMouseEnter={e => { if (activeCategory) { e.currentTarget.style.background = '#F5F2EC'; e.currentTarget.style.color = '#111111'; } }}
                    onMouseLeave={e => { if (activeCategory) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555555'; } }}
                  >
                    <span>Hamısı</span>
                    <span style={{ fontSize: 11, opacity: 0.55 }}>{products.length}</span>
                  </button>

                  {categories.map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    const sel   = activeCategory === cat;
                    return (
                      <button key={cat} onClick={() => setActiveCategory(cat)}
                        style={{
                          padding: '10px 12px', borderRadius: 8, border: 'none',
                          background: sel ? '#111111' : 'transparent',
                          color: sel ? '#FFFFFF' : '#555555',
                          fontSize: 13, fontWeight: sel ? 600 : 400,
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'all 0.15s',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                        onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = '#F5F2EC'; e.currentTarget.style.color = '#111111'; } }}
                        onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555555'; } }}
                      >
                        <span>{cat}</span>
                        <span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              {/* MAIN content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{
                    fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800,
                    color: '#111111', margin: '0 0 4px', letterSpacing: '-0.3px',
                  }}>
                    {activeCategory || 'Bütün məhsullar'}
                  </h2>
                  <p style={{ fontSize: 13, color: '#AAAAAA', margin: 0 }}>
                    {filteredProducts.length} məhsul · Ödənişsiz çatdırılma
                  </p>
                </div>

                {/* Mobile pills */}
                {categories.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', marginBottom: 20, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }} className="r-mobile-nav">
                    <button onClick={() => setActiveCategory(null)} style={{
                      padding: '7px 16px', borderRadius: 100, flexShrink: 0,
                      border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`,
                      background: !activeCategory ? '#111111' : 'transparent',
                      color: !activeCategory ? '#FFFFFF' : '#666666',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}>Hamısı</button>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                        padding: '7px 16px', borderRadius: 100, flexShrink: 0,
                        border: `1.5px solid ${activeCategory === cat ? '#111111' : '#D5D0C8'}`,
                        background: activeCategory === cat ? '#111111' : 'transparent',
                        color: activeCategory === cat ? '#FFFFFF' : '#666666',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                      }}>{cat}</button>
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
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={openProduct}
                    onViewProduct={openProduct}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'about'    && <AboutUs />}
        {view === 'contact'  && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
      </main>

      <Footer
        onReviewsClick={() => setView('home')}
        onProductsClick={() => goToProducts(null)}
        onDeliveryClick={() => setView('delivery')}
        onAboutClick={() => setView('about')}
        onContactClick={() => setView('contact')}
      />

      <a href="https://wa.me/994519831483?text=Salam%2C%20sifaris%20etmek%20isteyirem"
        target="_blank" rel="noreferrer"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#25D366', color: '#FFFFFF',
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: 24, zIndex: 999,
          boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >💬</a>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          metroSchedule={metroSchedule}
          boxes={boxes}
          onClose={() => { setSelectedProduct(null); setEditingItem(undefined); }}
          onAddToCart={handleAddToCart}
          onOpenCategory={cat => {
            setSelectedProduct(null); setEditingItem(undefined);
            setActiveCategory(cat); setView('products' as AppView);
          }}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={handleRemove}
        onEdit={handleEdit}
        onGoToProducts={() => { setCartOpen(false); setView('products' as AppView); }}
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

        @media (max-width: 768px) {
          .r-desktop-nav { display: none !important; }
          .r-mobile-nav  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .r-mobile-nav { display: none !important; }
        }

        /* Mobile padding fixes */
        @media (max-width: 480px) {
          main section, main > div { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </div>
  );
}