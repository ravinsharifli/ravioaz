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

export default function App() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [view, setView]                   = useState<AppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem]     = useState<CartItem | undefined>(undefined);
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen]           = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visible, setVisible]             = useState(false);

  useEffect(() => {
    client.fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => { setProducts(raw.map(mapSanityProduct)); setLoading(false); })
      .catch(() => setLoading(false));
    setTimeout(() => setVisible(true), 60);
  }, []);

  const categories      = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;
  const bestSellers     = products.filter(p => p.isBestSeller).slice(0, 4);

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
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const openProduct = (p: Product) => { setSelectedProduct(p); setEditingItem(undefined); };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F2EC',
      fontFamily: "'Inter', sans-serif",
      color: '#111111',
    }}>
      <Navbar
        cartCount={cartCount}
        onLogoClick={() => { setView('home'); setActiveCategory(null); }}
        onCartClick={() => setCartOpen(true)}
        onAboutClick={() => setView('about')}
        onContactClick={() => setView('contact')}
        onDeliveryClick={() => setView('delivery')}
        products={products}
        onViewProduct={openProduct}
      />

      <main>
        {view === 'home' && (
          <>
            {/* ═══════════════════════════════════════
                HERO  — F-pattern: top horizontal scan
                Left: headline + sub  |  Right: CTA
            ═══════════════════════════════════════ */}
            <section style={{
              background: '#FFFFFF',
              borderBottom: '1px solid #EDEBE7',
              padding: 'clamp(48px,7vw,80px) 32px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>

                {/* F-pattern top row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 40,
                  flexWrap: 'wrap' as const,
                }}>
                  {/* LEFT — primary scan zone */}
                  <div style={{ flex: '1 1 420px', maxWidth: 600 }}>
                    {/* Campaign pill */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: '#FFF3EC',
                      border: '1px solid #FFD4B8',
                      borderRadius: 100, padding: '6px 14px',
                      marginBottom: 24,
                    }}>
                      <span style={{ fontSize: 14 }}>🎁</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6A00' }}>
                        Lazer yazı ilə fərdi hədiyyə
                      </span>
                    </div>

                    {/* H1 — bold, clear, left */}
                    <h1 style={{
                      fontSize: 'clamp(36px, 5.5vw, 64px)',
                      fontWeight: 800,
                      color: '#111111',
                      lineHeight: 1.1,
                      letterSpacing: '-1.5px',
                      margin: '0 0 20px',
                    }}>
                      Özəl hədiyyə,<br />
                      <span style={{ color: '#FF6A00' }}>yalnız sənin üçün.</span>
                    </h1>

                    {/* Subtext */}
                    <p style={{
                      fontSize: 16, fontWeight: 400,
                      color: '#555555', lineHeight: 1.7,
                      margin: '0 0 36px', maxWidth: 440,
                    }}>
                      Lazer yazılı qolbaq, fərdi təsbeh, domino və daha çoxu.
                      17 ₼-dən başlayan qiymətlə, 1–3 iş günündə hazır.
                    </p>

                    {/* Trust signals — left scan */}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const, marginBottom: 36 }}>
                      {[
                        { icon: '✓', text: '500+ məmnun müştəri' },
                        { icon: '✓', text: 'Bakı çatdırılma 4.99 ₼' },
                        { icon: '✓', text: '1–3 iş günü' },
                      ].map(t => (
                        <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 14 }}>{t.icon}</span>
                          <span style={{ fontSize: 13, color: '#555', fontWeight: 500 }}>{t.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA — orange, clear */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
                      <button
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                          padding: '15px 36px',
                          background: '#FF6A00', color: '#FFFFFF',
                          border: 'none', borderRadius: 10,
                          fontSize: 15, fontWeight: 700,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          transition: 'background 0.15s, transform 0.15s',
                          boxShadow: '0 4px 16px rgba(255,106,0,0.3)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#E55E00'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FF6A00'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        Kataloqa bax →
                      </button>
                      <a href="https://wa.me/994519831483" target="_blank" rel="noreferrer"
                        style={{
                          padding: '15px 28px',
                          background: 'transparent', color: '#111111',
                          border: '1.5px solid #D5D0C8',
                          borderRadius: 10, fontSize: 15, fontWeight: 600,
                          cursor: 'pointer', textDecoration: 'none',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'border-color 0.15s',
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6A00'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#D5D0C8'}
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* RIGHT — stats / social proof */}
                  <div style={{
                    flex: '0 0 auto',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12, maxWidth: 340,
                  }} className="r-desktop-nav">
                    {[
                      { num: '500+', label: 'Müştəri', icon: '😊' },
                      { num: '17 ₼', label: 'dan başlayır', icon: '💰' },
                      { num: '1–3', label: 'gün çatdırılma', icon: '⚡' },
                      { num: '100%', label: 'Özəl dizayn', icon: '✨' },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: '#F5F2EC',
                        borderRadius: 12, padding: '20px 16px',
                        textAlign: 'center' as const,
                        border: '1px solid #EDEBE7',
                      }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#111111', lineHeight: 1 }}>{s.num}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════
                BEST SELLERS strip
            ═══════════════════════════════════════ */}
            {bestSellers.length > 0 && (
              <section style={{ padding: 'clamp(48px,6vw,72px) 32px', background: '#F5F2EC' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' as const, gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 6px' }}>
                        ✦ Ən çox satılanlar
                      </p>
                      <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#111111', margin: 0, letterSpacing: '-0.5px' }}>
                        Populyar məhsullar
                      </h2>
                    </div>
                    <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      style={{
                        background: 'none', border: '1.5px solid #D5D0C8',
                        borderRadius: 8, padding: '9px 20px',
                        fontSize: 13, fontWeight: 600, color: '#111111',
                        cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6A00'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#D5D0C8'}
                    >Hamısına bax →</button>
                  </div>
                  <ProductGrid
                    products={bestSellers}
                    onAddToCart={openProduct}
                    onViewProduct={openProduct}
                  />
                </div>
              </section>
            )}

            {/* ═══════════════════════════════════════
                ALL PRODUCTS — full catalog
            ═══════════════════════════════════════ */}
            <section id="products" style={{ padding: 'clamp(48px,6vw,80px) 32px', background: '#FFFFFF' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                {/* Header + filters */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-end', marginBottom: 32,
                  flexWrap: 'wrap' as const, gap: 16,
                }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 6px' }}>Kataloq</p>
                    <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#111111', margin: 0, letterSpacing: '-0.3px' }}>
                      {activeCategory || 'Bütün məhsullar'}
                      <span style={{ fontWeight: 400, fontSize: 16, color: '#999', marginLeft: 10 }}>
                        ({filteredProducts.length})
                      </span>
                    </h2>
                  </div>

                  {/* Category filters */}
                  {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      <button
                        onClick={() => setActiveCategory(null)}
                        style={{
                          padding: '8px 18px', borderRadius: 100,
                          border: `1.5px solid ${!activeCategory ? '#111111' : '#D5D0C8'}`,
                          background: !activeCategory ? '#111111' : 'transparent',
                          color: !activeCategory ? '#FFFFFF' : '#666666',
                          fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                          transition: 'all 0.15s',
                        }}
                      >Hamısı</button>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          style={{
                            padding: '8px 18px', borderRadius: 100,
                            border: `1.5px solid ${activeCategory === cat ? '#111111' : '#D5D0C8'}`,
                            background: activeCategory === cat ? '#111111' : 'transparent',
                            color: activeCategory === cat ? '#FFFFFF' : '#666666',
                            fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                            transition: 'all 0.15s',
                          }}
                        >{cat}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products grid or skeleton */}
                {loading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 20 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ background: '#FFFFFF', borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
                        <div style={{ aspectRatio: '1/1', background: '#F5F2EC', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                          <div style={{ height: 10, background: '#F5F2EC', borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                          <div style={{ height: 15, background: '#F5F2EC', borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                          <div style={{ height: 20, background: '#F5F2EC', borderRadius: 4, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
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
            </section>

            {/* ═══════════════════════════════════════
                HOW IT WORKS — 4 steps, clean icons
            ═══════════════════════════════════════ */}
            <section style={{ background: '#111111', padding: 'clamp(56px,7vw,96px) 32px' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 12px' }}>Necə işləyir</p>
                  <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
                    3 addımda sifariş
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 2,
                }}>
                  {[
                    { n: '01', icon: '🛍️', title: 'Məhsul seç', desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
                    { n: '02', icon: '✍️', title: 'Ad / mesaj yaz', desc: 'Lazer yazısı üçün mətni WhatsApp-da göndər' },
                    { n: '03', icon: '⚡', title: '1–3 gündə hazır', desc: 'Çatdırılma 4.99 ₼ — qapına gəlir' },
                  ].map((s, i) => (
                    <div key={s.n} style={{
                      background: '#1A1A1A',
                      padding: '40px 32px',
                      borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 12,
                        background: 'rgba(255,106,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, marginBottom: 20,
                      }}>{s.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 2, marginBottom: 10 }}>{s.n}</div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '0 0 10px' }}>{s.title}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0, fontWeight: 400 }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════
                REVIEWS
            ═══════════════════════════════════════ */}
            <section style={{ background: '#F5F2EC' }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {view === 'about'    && <AboutUs />}
        {view === 'contact'  && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
      </main>

      <Footer onReviewsClick={() => setView('reviews' as AppView)} />

      {/* WhatsApp floating CTA */}
      <a
        href="https://wa.me/994519831483?text=Salam%2C%20sifaris%20etmek%20isteyirem"
        target="_blank" rel="noreferrer"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          background: '#25D366', color: '#FFFFFF',
          width: 56, height: 56,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: 24,
          zIndex: 999,
          boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,211,102,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.4)'; }}
      >💬</a>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          onClose={() => { setSelectedProduct(null); setEditingItem(undefined); }}
          onAddToCart={handleAddToCart}
          onOpenCategory={cat => { setSelectedProduct(null); setEditingItem(undefined); setActiveCategory(cat); setView('home'); }}
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={handleRemove}
        onEdit={handleEdit}
        onGoToProducts={() => { setCartOpen(false); setView('home'); }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::selection { background: #FF6A00; color: #FFFFFF; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @media (max-width: 768px) {
          .r-desktop-nav { display: none !important; }
          .r-mobile-nav  { display: flex !important; }
        }
      `}</style>
    </div>
  );
}