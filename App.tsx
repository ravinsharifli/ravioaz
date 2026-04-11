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
  bulkTiers[]{ minQty, maxQty, discountAmount, label }
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
          <>
            <section style={{
              background: '#FFFFFF',
              borderBottom: '1px solid #EDEBE7',
              padding: 'clamp(48px,7vw,80px) 32px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' as const }}>
                  {/* LEFT */}
                  <div style={{ flex: '1 1 420px', maxWidth: 580 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: '#FFF3EC', border: '1px solid #FFD4B8',
                      borderRadius: 100, padding: '6px 14px', marginBottom: 24,
                    }}>
                      <span style={{ fontSize: 14 }}>✨</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6A00' }}>
                        Hər hədiyyə, hər duyğu — yalnız sənin üçün
                      </span>
                    </div>

                    <h1 style={{
                      fontSize: 'clamp(36px,5.5vw,64px)',
                      fontWeight: 800, color: '#111111',
                      lineHeight: 1.1, letterSpacing: '-1.5px',
                      margin: '0 0 20px',
                    }}>
                      Keyfiyyətli hədiyyə,<br />
                      <span style={{ color: '#FF6A00' }}>rahat sifariş.</span>
                    </h1>

                    <p style={{ fontSize: 16, fontWeight: 400, color: '#555555', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 440 }}>
                      Lazer yazılı qolbaq, fərdi təsbeh, domino və daha çoxu.
                      17 ₼-dən başlayan qiymətlə, 1–3 iş günündə hazır.
                    </p>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, marginBottom: 32 }}>
                      {['✓ Ödənişsiz çatdırılma', '✓ 500+ müştəri', '✓ 1–3 iş günü'].map(t => (
                        <span key={t} style={{ fontSize: 13, color: '#555555', fontWeight: 500 }}>{t}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                      <button
                        onClick={() => goToProducts(null)}
                        style={{
                          padding: '15px 36px', background: '#FF6A00', color: '#FFFFFF',
                          border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          boxShadow: '0 4px 16px rgba(255,106,0,0.3)',
                          transition: 'background 0.15s, transform 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#E55E00'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FF6A00'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >Kataloqa bax →</button>
                      <a href="https://wa.me/994519831483" target="_blank" rel="noreferrer"
                        style={{
                          padding: '15px 28px', background: 'transparent', color: '#111111',
                          border: '1.5px solid #D5D0C8', borderRadius: 10, fontSize: 15, fontWeight: 600,
                          cursor: 'pointer', textDecoration: 'none', fontFamily: "'Inter', sans-serif",
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6A00'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#D5D0C8'}
                      >💬 WhatsApp</a>
                    </div>
                  </div>

                  {/* RIGHT stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 300, flex: '0 0 auto' }} className="r-desktop-nav">
                    {[
                      { num: '500+', label: 'Müştəri',     icon: '😊' },
                      { num: '17 ₼', label: 'dan başlayır', icon: '💰' },
                      { num: '1–3',  label: 'gün',          icon: '⚡' },
                      { num: '100%', label: 'Özəl dizayn',  icon: '✨' },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: '#F5F2EC', borderRadius: 12,
                        padding: '20px 16px', textAlign: 'center' as const,
                        border: '1px solid #EDEBE7',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#111111', lineHeight: 1 }}>{s.num}</div>
                        <div style={{ fontSize: 11, color: '#888888', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section style={{ background: '#111111', padding: 'clamp(56px,7vw,96px) 32px' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 12px' }}>
                    Necə işləyir
                  </p>
                  <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                    3 addımda sifariş
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  {[
                    { n: '01', icon: '🛍️', title: 'Məhsul seç',     desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
                    { n: '02', icon: '✍️', title: 'Ad / mesaj yaz',  desc: 'Lazer yazısı üçün istədiyini əlavə et' },
                    { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 iş günündə hazır, ödənişsiz çatdırılır' },
                  ].map((s, i) => (
                    <div key={s.n} style={{
                      background: '#1A1A1A', padding: '40px 32px',
                      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,106,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{s.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 2, marginBottom: 10 }}>{s.n}</div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px' }}>{s.title}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ background: '#F5F2EC' }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {/* ── PRODUCTS VIEW ── */}
        {(view as string) === 'products' && (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px 64px' }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

              {/* SIDEBAR — sticky, scrollable inside */}
              <aside
                className="r-desktop-nav"
                style={{
                  flexShrink: 0,
                  width: 200,
                  position: 'sticky',
                  top: 110,
                  maxHeight: 'calc(100vh - 130px)',
                  overflowY: 'auto' as const,
                  paddingRight: 8,
                  /* Hide scrollbar visually but keep functionality */
                  scrollbarWidth: 'none' as const,
                }}
              >
                <p style={{
                  fontSize: 10, fontWeight: 700, color: '#FF6A00',
                  letterSpacing: 1.5, textTransform: 'uppercase' as const,
                  margin: '0 0 12px',
                }}>Kateqoriyalar</p>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                  {/* All */}
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                      padding: '10px 12px', borderRadius: 8, border: 'none',
                      background: !activeCategory ? '#111111' : 'transparent',
                      color: !activeCategory ? '#FFFFFF' : '#555555',
                      fontSize: 13, fontWeight: !activeCategory ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left' as const,
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
                          cursor: 'pointer', textAlign: 'left' as const,
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
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{
                    fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800,
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
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 }} className="r-mobile-nav">
                    <button onClick={() => setActiveCategory(null)} style={{
                      padding: '7px 16px', borderRadius: 100,
                      border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`,
                      background: !activeCategory ? '#111111' : 'transparent',
                      color: !activeCategory ? '#FFFFFF' : '#666666',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}>Hamısı</button>
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                        padding: '7px 16px', borderRadius: 100,
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
                        <div style={{ aspectRatio: '1/1', background: '#F5F2EC', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
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

      <Footer onReviewsClick={() => setView('home')} />

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
        body { -webkit-font-smoothing: antialiased; }
        ::selection { background: #FF6A00; color: #FFFFFF; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        aside::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) {
          .r-desktop-nav { display: none !important; }
          .r-mobile-nav  { display: flex !important; }
        }
        @media (min-width: 769px) {
          .r-mobile-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}