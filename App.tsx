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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    client.fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => { setProducts(raw.map(mapSanityProduct)); setLoading(false); })
      .catch(() => setLoading(false));
    setTimeout(() => setVisible(true), 80);
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
    <div style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: "'Jost', sans-serif", color: '#1B2A4A' }}>

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
            {/* HERO */}
            <section style={{
              background: '#1B2A4A',
              minHeight: '92vh',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  radial-gradient(ellipse 80% 60% at 70% 50%, rgba(184,149,42,0.07) 0%, transparent 70%),
                  radial-gradient(ellipse 40% 40% at 5% 85%, rgba(184,149,42,0.04) 0%, transparent 60%)
                `,
              }} />
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 2,
                background: 'linear-gradient(to bottom, transparent 0%, #B8952A 25%, #B8952A 75%, transparent 100%)',
              }} />

              <div style={{
                maxWidth: 1200, margin: '0 auto',
                padding: '80px 48px', width: '100%',
                position: 'relative',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.9s ease, transform 0.9s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
                  <div style={{ width: 36, height: 1, background: '#B8952A' }} />
                  <span style={{
                    fontSize: 10, letterSpacing: 4,
                    textTransform: 'uppercase' as const,
                    color: '#B8952A', fontWeight: 600,
                  }}>Fərdi hədiyyələr · Bakı</span>
                </div>

                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(52px, 9vw, 104px)',
                  fontWeight: 700,
                  color: '#F5F0E8',
                  lineHeight: 0.95,
                  margin: '0 0 8px',
                  letterSpacing: '-2px',
                }}>Hər hədiyyə</h1>

                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(52px, 9vw, 104px)',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#B8952A',
                  lineHeight: 1.05,
                  margin: '0 0 44px',
                  letterSpacing: '-1px',
                }}>danışır.</h1>

                <p style={{
                  fontSize: 16, fontWeight: 300,
                  color: 'rgba(245,240,232,0.55)',
                  lineHeight: 1.8,
                  margin: '0 0 52px',
                  maxWidth: 460,
                }}>
                  Lazer yazı, fərdi təsbeh, polad qolbaq, domino —
                  hər biri yalnız sənin üçün hazırlanır.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                  <button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                      padding: '15px 42px',
                      background: '#B8952A', color: '#F5F0E8',
                      border: 'none', borderRadius: 3,
                      fontSize: 11, fontWeight: 600,
                      letterSpacing: 2.5, textTransform: 'uppercase' as const,
                      cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                      transition: 'background 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#9E7E23'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#B8952A'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >Kataloqa bax</button>

                  <a
                    href="https://wa.me/994519831483"
                    target="_blank" rel="noreferrer"
                    style={{
                      padding: '15px 42px',
                      background: 'transparent',
                      color: 'rgba(245,240,232,0.75)',
                      border: '1px solid rgba(245,240,232,0.2)',
                      borderRadius: 3,
                      fontSize: 11, fontWeight: 500,
                      letterSpacing: 2.5, textTransform: 'uppercase' as const,
                      cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                      textDecoration: 'none', display: 'inline-block',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8952A'; e.currentTarget.style.color = '#F5F0E8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.2)'; e.currentTarget.style.color = 'rgba(245,240,232,0.75)'; }}
                  >WhatsApp</a>
                </div>

                <div style={{
                  display: 'flex', gap: 0, marginTop: 80,
                  borderTop: '1px solid rgba(245,240,232,0.07)',
                  paddingTop: 40, flexWrap: 'wrap' as const,
                }}>
                  {[
                    { num: '500+', label: 'Məmnun müştəri' },
                    { num: '1–3', label: 'İş günündə hazır' },
                    { num: '17₼', label: 'dan başlayan' },
                    { num: '4.99₼', label: 'Bakı çatdırılma' },
                  ].map((s, i) => (
                    <div key={s.label} style={{
                      paddingRight: 44, marginRight: 44,
                      borderRight: i < 3 ? '1px solid rgba(245,240,232,0.07)' : 'none',
                      marginBottom: 16,
                    }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 26, fontWeight: 700,
                        color: '#B8952A', lineHeight: 1,
                      }}>{s.num}</div>
                      <div style={{
                        fontSize: 10, letterSpacing: 1.5,
                        textTransform: 'uppercase' as const,
                        color: 'rgba(245,240,232,0.3)',
                        marginTop: 6, fontWeight: 400,
                      }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* MARQUEE */}
            <div style={{
              background: '#B8952A', padding: '13px 0',
              overflow: 'hidden', whiteSpace: 'nowrap' as const,
            }}>
              <span style={{
                display: 'inline-block',
                animation: 'marquee 20s linear infinite',
                fontSize: 10, fontWeight: 600,
                letterSpacing: 3, textTransform: 'uppercase' as const,
                color: '#1B2A4A',
              }}>
                {Array(8).fill('Lazer Yazı  ·  Fərdi Təsbeh  ·  Polad Qolbaq  ·  Domino  ·  Özəl Hədiyyə  ·  Bakı Çatdırılma  ·  ').join('')}
              </span>
            </div>

            {/* PRODUCTS */}
            <section id="products" style={{ padding: 'clamp(64px,8vw,112px) 48px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-end', marginBottom: 52,
                  flexWrap: 'wrap' as const, gap: 20,
                }}>
                  <div>
                    <p style={{
                      fontSize: 10, letterSpacing: 4,
                      textTransform: 'uppercase' as const,
                      color: '#B8952A', fontWeight: 600, margin: '0 0 10px',
                    }}>Kataloq</p>
                    <h2 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(30px,4vw,48px)',
                      fontWeight: 700, color: '#1B2A4A',
                      margin: 0, letterSpacing: '-0.5px',
                    }}>
                      {activeCategory || 'Bütün məhsullar'}
                    </h2>
                  </div>

                  {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      <button
                        onClick={() => setActiveCategory(null)}
                        style={{
                          padding: '9px 24px', borderRadius: 2,
                          border: `1px solid ${!activeCategory ? '#1B2A4A' : '#C8BFB2'}`,
                          background: !activeCategory ? '#1B2A4A' : 'transparent',
                          color: !activeCategory ? '#F5F0E8' : '#8A7F72',
                          fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
                          textTransform: 'uppercase' as const,
                          cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                          transition: 'all 0.2s',
                        }}
                      >Hamısı</button>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          style={{
                            padding: '9px 24px', borderRadius: 2,
                            border: `1px solid ${activeCategory === cat ? '#1B2A4A' : '#C8BFB2'}`,
                            background: activeCategory === cat ? '#1B2A4A' : 'transparent',
                            color: activeCategory === cat ? '#F5F0E8' : '#8A7F72',
                            fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
                            textTransform: 'uppercase' as const,
                            cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                            transition: 'all 0.2s',
                          }}
                        >{cat}</button>
                      ))}
                    </div>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i}>
                        <div style={{ aspectRatio: '3/4', background: '#E8E1D6', borderRadius: 2, animation: 'pulse 1.6s ease-in-out infinite' }} />
                        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                          <div style={{ height: 10, background: '#E8E1D6', borderRadius: 2, width: '45%', animation: 'pulse 1.6s ease-in-out infinite' }} />
                          <div style={{ height: 15, background: '#E8E1D6', borderRadius: 2, width: '70%', animation: 'pulse 1.6s ease-in-out infinite' }} />
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

            {/* HOW IT WORKS */}
            <section style={{ background: '#1B2A4A', padding: 'clamp(64px,8vw,112px) 48px' }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ marginBottom: 60 }}>
                  <p style={{ fontSize: 10, letterSpacing: 4, textTransform: 'uppercase' as const, color: '#B8952A', fontWeight: 600, margin: '0 0 12px' }}>Proses</p>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(30px,4vw,48px)',
                    fontWeight: 700, color: '#F5F0E8', margin: 0,
                  }}>
                    Sadə. Sürətli.{' '}
                    <span style={{ color: '#B8952A', fontStyle: 'italic', fontWeight: 400 }}>Fərdi.</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
                  {[
                    { n: '01', title: 'Seç', desc: 'Kataloqdan məhsul seç, variant müəyyən et' },
                    { n: '02', title: 'Fərdiləşdir', desc: 'Ad, tarix, xüsusi mesaj əlavə et' },
                    { n: '03', title: 'Hazırlayırıq', desc: '1–3 iş günündə lazer ilə hazırlanır' },
                    { n: '04', title: 'Qapında', desc: 'Bakı daxili çatdırılma 4.99₼' },
                  ].map((s, i) => (
                    <div key={s.n} style={{
                      padding: '40px 36px',
                      borderLeft: i > 0 ? '1px solid rgba(245,240,232,0.06)' : 'none',
                      borderTop: '1px solid rgba(245,240,232,0.06)',
                    }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 60, fontWeight: 700,
                        color: 'rgba(184,149,42,0.10)',
                        lineHeight: 1, marginBottom: 24,
                        letterSpacing: '-2px',
                      }}>{s.n}</div>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 21, fontWeight: 600,
                        color: '#F5F0E8', margin: '0 0 12px',
                      }}>{s.title}</h3>
                      <p style={{
                        fontSize: 13, color: 'rgba(245,240,232,0.38)',
                        lineHeight: 1.75, margin: 0, fontWeight: 300,
                      }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* REVIEWS */}
            <section style={{ background: '#F5F0E8' }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {view === 'about' && <AboutUs />}
        {view === 'contact' && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
      </main>

      <Footer onReviewsClick={() => setView('reviews' as AppView)} />

      <a
        href="https://wa.me/994519831483?text=Salam%2C%20sifaris%20vermek%20isteyirem"
        target="_blank" rel="noreferrer"
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 52, height: 52, background: '#25D366',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: 22,
          zIndex: 999, boxShadow: '0 6px 20px rgba(37,211,102,0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >💬</a>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          onClose={() => { setSelectedProduct(null); setEditingItem(undefined); }}
          onAddToCart={handleAddToCart}
          onOpenCategory={cat => {
            setSelectedProduct(null); setEditingItem(undefined);
            setActiveCategory(cat); setView('home');
          }}
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; }
        ::selection { background: #B8952A; color: #F5F0E8; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}