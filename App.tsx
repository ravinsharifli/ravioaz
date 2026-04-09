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

// Sanity-dən gələn xam məhsulu bizim Product tipinə çeviririk
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

// Sanity GROQ sorğusu
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

  // Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | undefined>(undefined);

  // Səbət
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Kateqoriya filtri
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Sanity-dən məhsulları yüklə
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

  // Filtrlənmiş məhsullar
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  // Unikal kateqoriyalar
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
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const handleRemove = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
  };

  const handleEdit = (item: CartItem) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      setCartOpen(false);
      openProduct(product, item);
    }
  };

  const goHome = () => {
    setView('home');
    setActiveCategory(null);
  };

  const T = {
    bg: '#FAF8F5',
    primary: '#2F4F4F',
    border: '#E9E5DF',
    muted: '#6B7280',
    accent: '#C9A227',
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Georgia, serif' }}>

      {/* NAVİQASİYA */}
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

      {/* ƏSAS KONTENİ */}
      <main style={{ paddingTop: 80 }}>

        {/* ═══════════════ ANA SƏHİFƏ ═══════════════ */}
        {view === 'home' && (
          <>
            {/* HERO */}
            <section style={{ padding: '48px 16px 32px', maxWidth: 1120, margin: '0 auto' }}>
              <p style={{
                display: 'inline-block',
                background: '#ECE6DA',
                color: T.primary,
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 18,
                letterSpacing: 0.3,
              }}>
                ✨ Lazer yazı ilə fərdiləşdirilmiş hədiyyələr
              </p>
              <h1 style={{
                fontSize: 'clamp(28px, 6vw, 52px)',
                lineHeight: 1.08,
                margin: '0 0 14px',
                color: '#1F1F1F',
                maxWidth: 720,
                fontWeight: 800,
              }}>
                Xüsusi insanlara,<br />xüsusi hədiyyə.
              </h1>
              <p style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: T.muted,
                maxWidth: 580,
                marginBottom: 28,
              }}>
                Bijuteriya, hədiyyə qutuları, məzun lentləri — hamısı sizin adınıza hazırlanır.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href="#mehsullar"
                  onClick={() => setView('home')}
                  style={{
                    textDecoration: 'none',
                    background: T.primary,
                    color: '#fff',
                    padding: '13px 24px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  Məhsullara bax
                </a>
                <a
                  href="https://wa.me/994519831483?text=Salam%2C%20saytdan%20sifariş%20vermək%20istəyirəm"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                    border: `2px solid ${T.primary}`,
                    color: T.primary,
                    padding: '13px 24px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  💬 WhatsApp ilə yaz
                </a>
              </div>
            </section>

            {/* PROMO BANERLƏR */}
            <section style={{ maxWidth: 1120, margin: '0 auto', padding: '0 16px 40px' }}>
              <PromoBanners />
            </section>

            {/* ETIBAR ZOLAĞU */}
            <section style={{
              background: T.primary,
              padding: '16px 0',
              marginBottom: 0,
            }}>
              <div style={{
                maxWidth: 1120,
                margin: '0 auto',
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 32,
              }}>
                {[
                  '⚡ Sürətli hazırlıq',
                  '🎁 Premium paketləmə',
                  '🚚 Bakı daxili çatdırılma',
                  '✍️ Hər məhsula fərdi yazı',
                ].map((t) => (
                  <span key={t} style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </section>

            {/* KATEQORİYA FİLTRİ */}
            {categories.length > 1 && (
              <section style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px 12px' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      border: '1.5px solid',
                      borderColor: !activeCategory ? T.primary : T.border,
                      background: !activeCategory ? T.primary : '#fff',
                      color: !activeCategory ? '#fff' : T.muted,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    Hamısı
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 999,
                        border: '1.5px solid',
                        borderColor: activeCategory === cat ? T.primary : T.border,
                        background: activeCategory === cat ? T.primary : '#fff',
                        color: activeCategory === cat ? '#fff' : T.muted,
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* MƏHSULLAR */}
            <section id="mehsullar" style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 16px 56px' }}>
              {loading ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '80px 0', flexDirection: 'column', gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, border: `3px solid ${T.border}`,
                    borderTopColor: T.primary, borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  <p style={{ color: T.muted, fontSize: 14 }}>Məhsullar yüklənir...</p>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: T.muted }}>
                  <p style={{ fontSize: 18 }}>Bu kateqoriyada məhsul yoxdur</p>
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                      marginTop: 16, padding: '10px 20px', borderRadius: 10,
                      background: T.primary, color: '#fff', border: 'none',
                      cursor: 'pointer', fontWeight: 700,
                    }}
                  >
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

            {/* MÜŞTƏRİ RƏYLƏRİ */}
            <section style={{
              background: '#F3F1ED',
              borderTop: `1px solid ${T.border}`,
              borderBottom: `1px solid ${T.border}`,
            }}>
              <CustomerReviews />
            </section>
          </>
        )}

        {/* DİGƏR SƏHİFƏLƏR */}
        {view === 'about'    && <AboutUs />}
        {view === 'contact'  && <Contact />}
        {view === 'delivery' && <DeliveryInfo />}
        {view === 'reviews'  && (
          <section style={{ maxWidth: 1120, margin: '0 auto' }}>
            <CustomerReviews />
          </section>
        )}
      </main>

      {/* FOOTER */}
      <Footer onReviewsClick={() => setView('reviews')} />

      {/* AI KÖMƏKÇİ */}
      <AIAssistant />

      {/* MƏHSUL MODALI */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          initialData={editingItem}
          onClose={() => {
            setSelectedProduct(null);
            setEditingItem(undefined);
          }}
          onAddToCart={handleAddToCart}
          onOpenCategory={(cat) => {
            setSelectedProduct(null);
            setEditingItem(undefined);
            setActiveCategory(cat);
            setView('home');
          }}
        />
      )}

      {/* SƏBƏT */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={handleRemove}
        onEdit={handleEdit}
        onGoToProducts={() => {
          setCartOpen(false);
          setView('home');
        }}
      />
    </div>
  );
}