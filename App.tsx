import React, { useState, useEffect } from 'react';
import { client } from './sanityclient';
import { createImageUrlBuilder } from '@sanity/image-url';
import { Product, CartItem, AppView } from './types';

import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import PromoBanners from './components/PromoBanners';
import CustomerReviews from './components/CustomerReviews';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

const builder = createImageUrlBuilder({ projectId: 'w7scii42', dataset: 'production' });

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
    client
      .fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => {
        setProducts(raw.map(mapSanityProduct));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Sanity xətası:', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  const openProduct = (product: Product, item?: CartItem) => {
    setSelectedProduct(product);
    setEditingItem(item);
  };

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.cartId === item.cartId);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = item; return updated; }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const handleRemove = (cartId: string) =>
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));

  const handleEdit = (item: CartItem) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) { setCartOpen(false); openProduct(product, item); }
  };

  const goHome = () => { setView('home'); setActiveCategory(null); };

  const trustItems = [
    { icon: '⚡', text: 'Sürətli Hazırlıq' },
    { icon: '✦', text: 'Lazer Dəqiqliyi' },
    { icon: '🎁', text: 'Premium Paketləmə' },
    { icon: '🚚', text: 'Bakı daxili Çatdırılma' },
    { icon: '✍️', text: 'Fərdi Dizayn' },
    { icon: '💎', text: 'Keyfiyyət Zəmanəti' },
    { icon: '📦', text: '1–2 Gündə Hazır' },
    { icon: '💬', text: 'WhatsApp Dəstək' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <Navbar
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onLogoClick={goHome}
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
            {/* ── HERO ─────────────────────────────────── */}
            <section style={{
              background: 'linear-gradient(160deg, #0F0D0B 0%, #1C1612 55%, #0F0D0B 100%)',
              padding: 'clamp(80px,10vw,120px) 24px clamp(72px,9vw,108px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div className="hero-dots" style={{
                position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: -160, right: -80,
                width: 520, height: 520,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', top: -100, left: -60,
                width: 340, height: 340,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>

                <div className="fade-up" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.25)',
                  borderRadius: 999,
                  padding: '7px 16px',
                  marginBottom: 28,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#C9A84C', display: 'inline-block',
                    boxShadow: '0 0 8px rgba(201,168,76,0.7)',
                  }} />
                  <span style={{
                    color: '#C9A84C', fontSize: 11, fontWeight: 700,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Lazer yazı · DTF basqı · Özəl hədiyyə
                  </span>
                </div>

                <h1 className="fade-up-2" style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(46px, 7.5vw, 84px)',
                  fontWeight: 700,
                  lineHeight: 1.04,
                  color: '#FAF8F4',
                  margin: '0 0 22px',
                  maxWidth: 700,
                  letterSpacing: '-0.5px',
                }}>
                  Xüsusi insanlara,<br />
                  <span className="gold-text">xüsusi hədiyyə.</span>
                </h1>

                <p className="fade-up-3" style={{
                  fontSize: 'clamp(14px,1.8vw,17px)',
                  lineHeight: 1.8,
                  color: 'rgba(250,248,244,0.55)',
                  maxWidth: 500,
                  marginBottom: 40,
                  fontWeight: 400,
                }}>
                  Bijuteriya, hədiyyə qutuları, məzun lentləri, köynəklər —
                  hamısı sizin adınıza, lazer dəqiqliyi ilə hazırlanır.
                </p>

                <div className="fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  
                    href="#mehsullar"
                    className="btn-primary"
                    style={{
                      textDecoration: 'none',
                      padding: '14px 32px',
                      borderRadius: 14,
                      fontSize: 14,
                      letterSpacing: '0.3px',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    Məhsullara bax <span style={{ fontSize: 16 }}>→</span>
                  </a>
                  
                    href="https://wa.me/994519831483?text=Salam%2C%20saytdan%20sifariş%20vermək%20istəyirəm"
                    target="_blank" rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      border: '1.5px solid rgba(250,248,244,0.18)',
                      color: '#FAF8F4',
                      padding: '14px 28px',
                      borderRadius: 14,
                      fontWeight: 700, fontSize: 14,
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(201,168,76,0.4)';
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(201,168,76,0.06)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(250,248,244,0.18)';
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: 18 }}>💬</span> WhatsApp
                  </a>
                </div>

                <div className="fade-up-5" style={{
                  display: 'flex',
                  gap: 'clamp(24px, 5vw, 56px)',
                  marginTop: 56,
                  paddingTop: 40,
                  borderTop: '1px solid rgba(201,168,76,0.12)',
                  flexWrap: 'wrap',
                }}>
                  {[
                    { n: '500+', l: 'Uğurlu sifariş' },
                    { n: '4.9 ★', l: 'Müştəri reytinqi' },
                    { n: '1–2 gün', l: 'Hazırlıq müddəti' },
                    { n: '17₼', l: 'Ən aşağı qiymət' },
                  ].map(s => (
                    <div key={s.n}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(26px, 4vw, 34px)',
                        fontWeight: 700, color: '#C9A84C', lineHeight: 1.1,
                      }}>{s.n}</div>
                      <div style={{
                        fontSize: 11, color: 'rgba(250,248,244,0.4)',
                        fontWeight: 600, letterSpacing: '0.3px', marginTop: 4,
                      }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── TRUST TICKER ─────────────────────────── */}
            <div style={{
              background: '#1C1714',
              borderBottom: '1px solid rgba(201,168,76,0.12)',
              padding: '13px 0',
              overflow: 'hidden',
            }}>
              <div className="trust-ticker">
                {[...trustItems, ...trustItems, ...trustItems].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '0 28px',
                    fontSize: 11, fontWeight: 700,
                    color: 'rgba(201,168,76,0.75)',
                    letterSpacing: '1.2px', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid rgba(201,168,76,0.1)',
                  }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* ── PROMO BANNERS ─────────────────────────── */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 20px' }}>
              <PromoBanners />
            </section>

            {/* ── CATEGORY FILTER ───────────────────────── */}
            {categories.length > 1 && (
              <section style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px 0' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: '#9C9088',
                    letterSpacing: '2px', textTransform: 'uppercase', marginRight: 4,
                  }}>Kateqoriya:</span>
                  {[{ key: null as string | null, label: 'Hamısı' }, ...categories.map(c => ({ key: c, label: c }))].map(cat => (
                    <button
                      key={cat.label}
                      onClick={() => setActiveCategory(cat.key)}
                      className="cat-pill"
                      style={{
                        padding: '7px 18px', borderRadius: 999,
                        border: '1.5px solid',
                        borderColor: activeCategory === cat.key ? '#1C1714' : '#E5DDD3',
                        background: activeCategory === cat.key ? '#1C1714' : 'transparent',
                        color: activeCategory === cat.key ? '#C9A84C' : '#5C5048',
                        fontWeight: 700, fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '0.2px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ── PRODUCTS ──────────────────────────────── */}
            <section id="mehsullar" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>
              {loading ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '100px 0', gap: 16,
                }}>
                  <div className="spin" style={{
                    width: 38, height: 38,
                    border: '3px solid #E5DDD3',
                    borderTopColor: '#C9A84C',
                    borderRadius: '50%',
                  }} />
                  <p style={{ color: '#9C9088', fontSize: 13, fontWeight: 600 }}>Məhsullar yüklənir...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#9C9088' }}>
                  <p style={{ fontSize: 20, fontFamily: "'Cormorant Garamond', serif" }}>Bu kateqoriyada məhsul yoxdur</p>
                  <button onClick={() => setActiveCategory(null)} style={{
                    marginTop: 16, padding: '11px 28px', borderRadius: 12,
                    background: '#1C1714', color: '#C9A84C', border: 'none',
                    cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Bütün məhsullara bax
                  </button>
                </div>
              ) : (
                <ProductGrid
                  products={filteredProducts}
                  onAddToCart={openProduct}
                  onViewProduct={openProduct}
                  title={activeCategory || 'Bütün məhsullar'}
                />
              )}
            </section>

            {/* ── HOW IT WORKS ──────────────────────────── */}
            <section style={{
              background: '#F3EDE4',
              borderTop: '1px solid #E5DDD3',
              padding: 'clamp(56px,7vw,88px) 24px',
            }}>
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    fontSize: 10, fontWeight: 800, letterSpacing: '2.5px',
                    textTransform: 'uppercase', color: '#C9A84C',
                    marginBottom: 14,
                  }}>
                    <span style={{ display: 'block', width: 24, height: 1, background: '#C9A84C', opacity: 0.4 }} />
                    Necə işləyir
                    <span style={{ display: 'block', width: 24, height: 1, background: '#C9A84C', opacity: 0.4 }} />
                  </div>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(28px,4vw,42px)',
                    fontWeight: 700, color: '#1C1714', margin: 0,
                  }}>
                    Sadə, sürətli, şəxsi
                  </h2>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'clamp(16px,3vw,24px)',
                }}>
                  {[
                    { step: '01', icon: '🛍️', title: 'Məhsul seç', desc: 'Kataloqdan istədiyini seç, variant və miqdar təyin et' },
                    { step: '02', icon: '✍️', title: 'Fərdiləşdir', desc: 'Ad, tarix, mesaj — nə istəyirsən əlavə et' },
                    { step: '03', icon: '⚡', title: 'Biz hazırlayırıq', desc: 'Lazer yazı, DTF və ya sublim basqı ilə 1–2 gündə' },
                    { step: '04', icon: '📦', title: 'Qapına gəlir', desc: 'Bakı daxili çatdırılma — 4.99 AZN-ə' },
                  ].map(s => (
                    <div
                      key={s.step}
                      style={{
                        background: '#fff', borderRadius: 20,
                        padding: '28px 24px',
                        border: '1.5px solid #E5DDD3',
                        position: 'relative',
                        transition: 'box-shadow 0.3s, transform 0.3s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(28,23,20,0.1)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        fontSize: 26, marginBottom: 16,
                        background: 'rgba(201,168,76,0.08)',
                        width: 52, height: 52, borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{s.icon}</div>
                      <div style={{
                        position: 'absolute', top: 18, right: 20,
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 52, fontWeight: 700,
                        color: 'rgba(201,168,76,0.07)', lineHeight: 1,
                        userSelect: 'none',
                      }}>{s.step}</div>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22, fontWeight: 700,
                        color: '#1C1714', margin: '0 0 8px',
                      }}>{s.title}</h3>
                      <p style={{
                        fontSize: 13, lineHeight: 1.7,
                        color: '#5C5048', margin: 0, fontWeight: 400,
                      }}>{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── REVIEWS ───────────────────────────────── */}
            <section style={{ background: '#1C1714', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {view === 'about' && <AboutUs />}
        {view === 'contact' && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
        {view === 'reviews' && (
          <section style={{ background: '#1C1714' }}>
            <CustomerReviews />
          </section>
        )}
      </main>

      <Footer onReviewsClick={() => setView('reviews')} />
      <AIAssistant />

      {/* Floating WhatsApp */}
      
        href="https://wa.me/994519831483?text=Salam%2C%20saytdan%20sifariş%20vermək%20istəyirəm"
        target="_blank" rel="noreferrer"
        className="wa-float"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56,
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          fontSize: 26,
          zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'}
        title="WhatsApp ilə əlaqə"
      >
        💬
      </a>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          onClose={() => { setSelectedProduct(null); setEditingItem(undefined); }}
          onAddToCart={handleAddToCart}
          onOpenCategory={(cat) => {
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
    </div>
  );
}