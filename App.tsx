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
const urlFor = (source: any) => builder.image(source).url();

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

  const handleRemove = (cartId: string) => setCart((prev) => prev.filter((c) => c.cartId !== cartId));

  const handleEdit = (item: CartItem) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) { setCartOpen(false); openProduct(product, item); }
  };

  const goHome = () => { setView('home'); setActiveCategory(null); };

  // ── DESIGN TOKENS ────────────────────────────────
  const T = {
    bg:       '#FAF8F4',
    bgDeep:   '#F2EDE5',
    text:     '#1C1714',
    muted:    '#8C7F77',
    gold:     '#BF912E',
    border:   '#E8E2D9',
    dark:     '#1C1714',
  };
  // ─────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Nunito Sans', sans-serif" }}>

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
            {/* ═══ HERO ═══════════════════════════════════ */}
            <section style={{
              background: T.dark,
              padding: 'clamp(56px,8vw,96px) 20px clamp(48px,7vw,80px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative arc */}
              <div style={{
                position: 'absolute', bottom: -60, right: -60,
                width: 360, height: 360,
                borderRadius: '50%',
                border: '1px solid rgba(191,145,46,0.18)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: -100, right: -100,
                width: 500, height: 500,
                borderRadius: '50%',
                border: '1px solid rgba(191,145,46,0.09)',
                pointerEvents: 'none',
              }} />

              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="fade-up" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(191,145,46,0.12)',
                  border: '1px solid rgba(191,145,46,0.3)',
                  borderRadius: 999, padding: '6px 14px',
                  marginBottom: 24,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BF912E', display: 'inline-block' }} />
                  <span style={{ color: '#BF912E', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Nunito Sans', sans-serif" }}>
                    Lazer yazı · Fərdiləşdirilmiş hədiyyə
                  </span>
                </div>

                <h1 className="fade-up-2" style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(38px,7vw,72px)',
                  fontWeight: 700,
                  lineHeight: 1.06,
                  color: '#FAF8F4',
                  margin: '0 0 20px',
                  maxWidth: 640,
                  letterSpacing: '-0.5px',
                }}>
                  Xüsusi insanlara,<br />
                  <span className="gold-text">xüsusi hədiyyə.</span>
                </h1>

                <p className="fade-up-3" style={{
                  fontSize: 16, lineHeight: 1.75, color: 'rgba(250,248,244,0.65)',
                  maxWidth: 480, marginBottom: 36,
                  fontWeight: 400,
                }}>
                  Bijuteriya, hədiyyə qutuları, məzun lentləri —
                  hamısı sizin adınıza, lazer dəqiqliyi ilə hazırlanır.
                </p>

                <div className="fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="#mehsullar" onClick={() => setView('home')} style={{
                    textDecoration: 'none',
                    background: '#BF912E', color: '#FAF8F4',
                    padding: '13px 28px', borderRadius: 12,
                    fontWeight: 800, fontSize: 14,
                    letterSpacing: '0.3px', fontFamily: "'Nunito Sans', sans-serif",
                    transition: 'all 0.2s',
                    display: 'inline-block',
                  }}>
                    Məhsullara bax
                  </a>
                  <a
                    href="https://wa.me/994519831483?text=Salam%2C%20saytdan%20sifariş%20vermək%20istəyirəm"
                    target="_blank" rel="noreferrer"
                    style={{
                      textDecoration: 'none',
                      border: '1.5px solid rgba(250,248,244,0.25)', color: '#FAF8F4',
                      padding: '13px 28px', borderRadius: 12,
                      fontWeight: 700, fontSize: 14,
                      letterSpacing: '0.3px', fontFamily: "'Nunito Sans', sans-serif",
                      display: 'inline-block',
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: 'clamp(20px,4vw,40px)',
                  marginTop: 48, paddingTop: 36,
                  borderTop: '1px solid rgba(250,248,244,0.1)',
                  flexWrap: 'wrap',
                }}>
                  {[
                    { n: '500+', l: 'Uğurlu sifariş' },
                    { n: '4.9', l: 'Ortalama reytinq' },
                    { n: '1–2 gün', l: 'Hazırlıq müddəti' },
                  ].map(s => (
                    <div key={s.n}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 'clamp(24px,4vw,32px)', fontWeight: 700,
                        color: '#BF912E', lineHeight: 1.1,
                      }}>{s.n}</div>
                      <div style={{ fontSize: 11, color: 'rgba(250,248,244,0.5)', fontWeight: 600, letterSpacing: '0.5px', marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══ TRUST BAR ═══════════════════════════════ */}
            <div style={{
              background: T.bgDeep,
              borderBottom: `1px solid ${T.border}`,
              padding: '0',
              overflowX: 'auto',
            }}>
              <div style={{
                maxWidth: 1200, margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 0, flexWrap: 'nowrap', whiteSpace: 'nowrap',
              }}>
                {[
                  { icon: '⚡', text: 'Sürətli hazırlıq' },
                  { icon: '🎁', text: 'Premium paketləmə' },
                  { icon: '🚚', text: 'Bakı daxili çatdırılma' },
                  { icon: '✍️', text: 'Fərdi lazer yazı' },
                ].map((item, i) => (
                  <React.Fragment key={item.text}>
                    {i > 0 && <span style={{ color: T.border, padding: '0 4px', fontSize: 18 }}>·</span>}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '14px 16px', fontSize: 12, fontWeight: 700,
                      color: T.muted, letterSpacing: '0.3px',
                    }}>
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ═══ PROMO BANNERS ═══════════════════════════ */}
            <section style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 20px 16px' }}>
              <PromoBanners />
            </section>

            {/* ═══ CATEGORY FILTER ═════════════════════════ */}
            {categories.length > 1 && (
              <section style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 20px 0' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: '1px', textTransform: 'uppercase', marginRight: 4 }}>Kateqoriya:</span>
                  {[{ key: null, label: 'Hamısı' }, ...categories.map(c => ({ key: c, label: c }))].map(cat => (
                    <button
                      key={cat.label}
                      onClick={() => setActiveCategory(cat.key)}
                      style={{
                        padding: '6px 16px', borderRadius: 999,
                        border: '1.5px solid',
                        borderColor: activeCategory === cat.key ? '#BF912E' : T.border,
                        background: activeCategory === cat.key ? '#1C1714' : 'transparent',
                        color: activeCategory === cat.key ? '#BF912E' : T.muted,
                        fontWeight: 700, fontSize: 12,
                        cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: "'Nunito Sans', sans-serif",
                        letterSpacing: '0.2px',
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ═══ PRODUCTS ════════════════════════════════ */}
            <section id="mehsullar" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 72px' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
                  <div className="spin" style={{
                    width: 36, height: 36,
                    border: `3px solid ${T.border}`,
                    borderTopColor: '#BF912E',
                    borderRadius: '50%',
                  }} />
                  <p style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>Məhsullar yüklənir...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: T.muted }}>
                  <p style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif" }}>Bu kateqoriyada məhsul yoxdur</p>
                  <button onClick={() => setActiveCategory(null)} style={{
                    marginTop: 16, padding: '10px 24px', borderRadius: 10,
                    background: '#1C1714', color: '#BF912E', border: 'none',
                    cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    fontFamily: "'Nunito Sans', sans-serif",
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

            {/* ═══ REVIEWS ═════════════════════════════════ */}
            <section style={{ background: T.dark, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {view === 'about' && <AboutUs />}
        {view === 'contact' && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
        {view === 'reviews' && (
          <section style={{ background: T.dark }}>
            <CustomerReviews />
          </section>
        )}
      </main>

      <Footer onReviewsClick={() => setView('reviews')} />
      <AIAssistant />

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