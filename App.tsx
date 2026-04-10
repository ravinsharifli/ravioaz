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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | undefined>(undefined);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    client.fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => { setProducts(raw.map(mapSanityProduct)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory ? products.filter(p => p.category === activeCategory) : products;

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.cartId === item.cartId);
      return idx >= 0 ? prev.map((c, i) => i === idx ? item : c) : [...prev, item];
    });
  };

  const handleRemove = (cartId: string) => setCart(prev => prev.filter(c => c.cartId !== cartId));
  const handleEdit = (item: CartItem) => {
    const product = products.find(p => p.id === item.productId);
    if (product) { setSelectedProduct(product); setEditingItem(item); }
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar
        cartCount={cartCount}
        onLogoClick={() => { setView('home'); setActiveCategory(null); }}
        onCartClick={() => setCartOpen(true)}
        onAboutClick={() => setView('about')}
        onContactClick={() => setView('contact')}
        onDeliveryClick={() => setView('delivery')}
        products={products}
        onViewProduct={p => { setSelectedProduct(p); setEditingItem(undefined); }}
      />

      <main>
        {view === 'home' && (
          <>
            {/* ── HERO ── */}
            <section style={{
              background: '#1A1714',
              minHeight: '88vh',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background pattern */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%),
                                  radial-gradient(circle at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)`,
              }} />

              <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', width: '100%', position: 'relative' }}>
                <div style={{ maxWidth: 620 }}>
                  {/* Eyebrow */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    marginBottom: 28,
                  }}>
                    <span style={{ display: 'block', width: 32, height: 1, background: '#C9A84C' }} />
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: '#C9A84C',
                      letterSpacing: 3, textTransform: 'uppercase',
                    }}>Özəl hədiyyələr</span>
                  </div>

                  {/* Heading */}
                  <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(44px, 7vw, 82px)',
                    fontWeight: 400,
                    color: '#FAF7F2',
                    lineHeight: 1.05,
                    margin: '0 0 24px',
                    letterSpacing: '-1px',
                  }}>
                    Hər hədiyyənin<br />
                    <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>hekayəsi</em> var
                  </h1>

                  {/* Subtext */}
                  <p style={{
                    fontSize: 16, color: 'rgba(250,247,242,0.55)',
                    lineHeight: 1.7, margin: '0 0 40px',
                    fontWeight: 300, maxWidth: 460,
                  }}>
                    Lazer yazı, fərdi təsbeh, polad qolbaq və domino.
                    Yalnız sənin üçün, yalnız bir dəfə.
                  </p>

                  {/* CTAs */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { const el = document.getElementById('products'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                      style={{
                        padding: '15px 32px', borderRadius: 12,
                        background: '#C9A84C', border: 'none',
                        color: '#1A1714', fontSize: 14,
                        fontWeight: 600, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: '0.3px',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Məhsullara bax
                    </button>
                    
                      href="https://wa.me/994519831483"
                      target="_blank" rel="noreferrer"
                      style={{
                        padding: '15px 32px', borderRadius: 12,
                        background: 'transparent',
                        border: '1px solid rgba(250,247,242,0.2)',
                        color: '#FAF7F2', fontSize: 14,
                        fontWeight: 500, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        textDecoration: 'none', letterSpacing: '0.3px',
                        transition: 'border-color 0.2s',
                        display: 'inline-block',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(250,247,242,0.2)'}
                    >
                      WhatsApp ilə yaz
                    </a>
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex', gap: 40, marginTop: 72,
                  borderTop: '1px solid rgba(250,247,242,0.08)',
                  paddingTop: 32, flexWrap: 'wrap',
                }}>
                  {[
                    { num: '500+', label: 'Məmnun müştəri' },
                    { num: '3', label: 'İş günündə hazır' },
                    { num: '17₼', label: 'dan başlayan qiymət' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 32, fontWeight: 600,
                        color: '#C9A84C', lineHeight: 1,
                      }}>{s.num}</div>
                      <div style={{ fontSize: 12, color: 'rgba(250,247,242,0.4)', marginTop: 4, fontWeight: 300 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── PRODUCTS ── */}
            <section id="products" style={{ padding: 'clamp(56px,7vw,96px) 24px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Section header */}
                <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontSize: 10, fontWeight: 500, color: '#C9A84C',
                      letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
                    }}>
                      <span style={{ width: 20, height: 1, background: '#C9A84C', display: 'block' }} />
                      Kataloq
                    </div>
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(28px,4vw,44px)',
                      fontWeight: 400, color: '#1A1714', margin: 0,
                      letterSpacing: '-0.5px',
                    }}>
                      {activeCategory || 'Bütün məhsullar'}
                    </h2>
                  </div>

                  {/* Category pills */}
                  {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setActiveCategory(null)}
                        style={{
                          padding: '8px 18px', borderRadius: 100,
                          border: `1px solid ${!activeCategory ? '#1A1714' : '#E8E2D9'}`,
                          background: !activeCategory ? '#1A1714' : 'transparent',
                          color: !activeCategory ? '#FAF7F2' : '#8C7F77',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'all 0.2s',
                        }}
                      >
                        Hamısı
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          style={{
                            padding: '8px 18px', borderRadius: 100,
                            border: `1px solid ${activeCategory === cat ? '#1A1714' : '#E8E2D9'}`,
                            background: activeCategory === cat ? '#1A1714' : 'transparent',
                            color: activeCategory === cat ? '#FAF7F2' : '#8C7F77',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            transition: 'all 0.2s',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Loading */}
                {loading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ aspectRatio: '1/1', background: '#F0EAE0', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ height: 12, background: '#F0EAE0', borderRadius: 6, width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                          <div style={{ height: 16, background: '#F0EAE0', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={p => { setSelectedProduct(p); setEditingItem(undefined); }}
                    onViewProduct={p => { setSelectedProduct(p); setEditingItem(undefined); }}
                  />
                )}
              </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ background: '#1A1714', padding: 'clamp(56px,7vw,96px) 24px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 56 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    fontSize: 10, fontWeight: 500, color: '#C9A84C',
                    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16,
                  }}>
                    <span style={{ width: 24, height: 1, background: '#C9A84C', display: 'block' }} />
                    Necə işləyir
                    <span style={{ width: 24, height: 1, background: '#C9A84C', display: 'block' }} />
                  </div>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(28px,4vw,44px)',
                    fontWeight: 400, color: '#FAF7F2', margin: 0,
                  }}>
                    Sadə, sürətli, <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>şəxsi</em>
                  </h2>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 2,
                }}>
                  {[
                    { num: '01', title: 'Məhsul seç', desc: 'Kataloqdan istədiyini tap, variant seç' },
                    { num: '02', title: 'Fərdiləşdir', desc: 'Ad, tarix, mesaj — nə istəyirsənsə' },
                    { num: '03', title: 'Biz hazırlayırıq', desc: 'Lazer yazı ilə 1–3 iş günündə' },
                    { num: '04', title: 'Qapına gəlir', desc: 'Bakı daxili çatdırılma 4.99₼' },
                  ].map((s, i) => (
                    <div key={s.num} style={{
                      padding: '36px 28px',
                      borderLeft: i > 0 ? '1px solid rgba(250,247,242,0.06)' : 'none',
                    }}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 56, fontWeight: 400,
                        color: 'rgba(201,168,76,0.15)', lineHeight: 1,
                        marginBottom: 20,
                      }}>{s.num}</div>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22, fontWeight: 400,
                        color: '#FAF7F2', margin: '0 0 10px',
                      }}>{s.title}</h3>
                      <p style={{
                        fontSize: 13, color: 'rgba(250,247,242,0.4)',
                        lineHeight: 1.7, margin: 0, fontWeight: 300,
                      }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── REVIEWS ── */}
            <section style={{ background: '#FAF7F2' }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {view === 'about' && <AboutUs />}
        {view === 'contact' && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
      </main>

      <Footer onReviewsClick={() => setView('reviews' as AppView)} />

      {/* WhatsApp float */}
      
        href="https://wa.me/994519831483?text=Salam%2C%20sifariş%20vermək%20istəyirəm"
        target="_blank" rel="noreferrer"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52,
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: 24,
          zIndex: 999, boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </a>

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}