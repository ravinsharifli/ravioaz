import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { C, F } from './tokens';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { client } from './sanityclient';
import { Analytics } from '@vercel/analytics/react';
import { Product, CartItem, ReelPost } from './types';
import { PRODUCTS_QUERY, SETTINGS_QUERY, mapSanityProduct } from './lib/sanityProduct';
import { toCategorySlug } from './lib/categorySlug';
import { DEFAULT_METRO } from './constants/defaults';

import Navbar from './components/Navbar';
import PWAInstallBanner from './components/PWAInstallBanner';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import SlugPage from './components/pages/SlugPage';
import NotFound from './components/pages/NotFound';

const CartDrawer = React.lazy(() => import('./components/CartDrawer'));

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ravio_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ravio_cart', JSON.stringify(cart));
    } catch {
      console.warn('Cart localStorage-a yazıla bilmədi');
    }
  }, [cart]);

  useEffect(() => {
    client
      .withConfig({ useCdn: false })
      .fetch(PRODUCTS_QUERY)
      .then((raw: any[]) => {
        setProducts(raw.map(mapSanityProduct));
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Sanity] Məhsullar yüklənmədi:', err);
        setLoading(false);
      });

    client
      .fetch(SETTINGS_QUERY)
      .then((s: any) => setSettings(s))
      .catch((err) => {
        console.error('[Sanity] siteSettings yüklənmədi:', err);
      });

    setTimeout(() => setVisible(true), 60);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const metroSchedule = settings?.metroSchedule || DEFAULT_METRO;
  const reelPosts: ReelPost[] = settings?.reelPosts || [];
  const heroSlides: any[] = settings?.heroSlides || [];
  const reviews: any[] = settings?.reviews || [];

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  const handleAddToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.cartId === item.cartId);
      return idx >= 0 ? prev.map((c, i) => (i === idx ? item : c)) : [...prev, item];
    });
  }, []);

  const handleProductAddToCart = useCallback((item: CartItem) => {
    handleAddToCart(item);
    setCartOpen(true);
  }, [handleAddToCart]);

  const handleRemove = (cartId: string) => setCart((prev) => prev.filter((c) => c.cartId !== cartId));

  const handleEdit = (item: CartItem) => {
    const p = products.find((prod) => prod.id === item.productId);
    if (p?.slug) {
      setCartOpen(false);
      navigate(`/mehsullar/${p.slug}`, { state: { editItem: item } });
    }
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('ravio_cart');
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const openProduct = (p: Product) => {
    if (p.slug) {
      navigate(`/mehsullar/${p.slug}`);
    }
  };

  const goToProducts = (cat?: string | null) => {
    if (cat) {
      navigate(`/mehsullar/${toCategorySlug(cat)}`);
    } else {
      setActiveCategory(null);
      navigate('/mehsullar');
    }
  };

  const allCoupons = products.flatMap((p) => p.coupons || []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F.sans, color: C.black }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: -999,
          left: 0,
          zIndex: 9999,
          background: C.black,
          color: C.white,
          padding: '10px 20px',
          fontWeight: 700,
          fontSize: 14,
          borderRadius: '0 0 8px 0',
          textDecoration: 'none',
          fontFamily: F.sans,
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-999px';
        }}
      >
        Əsas məzmuna keç
      </a>

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

      <main id="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                visible={visible}
                reelPosts={reelPosts}
                heroSlides={heroSlides}
                categories={categories}
                filteredProducts={filteredProducts}
                loading={loading}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                goToProducts={goToProducts}
                openProduct={openProduct}
                reviews={reviews}
              />
            }
          />
          <Route
            path="/mehsullar"
            element={
              <ProductsPage
                categories={categories}
                products={products}
                loading={loading}
                openProduct={openProduct}
              />
            }
          />
          <Route
            path="/mehsullar/:slug"
            element={
              <SlugPage
                products={products}
                loading={loading}
                categories={categories}
                setActiveCategory={setActiveCategory}
                openProduct={openProduct}
                onAddToCart={handleProductAddToCart}
              />
            }
          />
          <Route path="/haqqimizda" element={<AboutUs />} />
          <Route path="/elaqe" element={<Contact />} />
          <Route path="/catdirilma" element={<DeliveryInfo />} />
          <Route path="*" element={<NotFound onHome={() => navigate('/')} />} />
        </Routes>
      </main>

      <Footer
        onReviewsClick={() => navigate('/')}
        onProductsClick={() => goToProducts(null)}
        onDeliveryClick={() => navigate('/catdirilma')}
        onAboutClick={() => navigate('/haqqimizda')}
        onContactClick={() => navigate('/elaqe')}
      />

      <Suspense fallback={null}>
        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cart}
          onRemove={handleRemove}
          onEdit={handleEdit}
          onClearCart={handleClearCart}
          onGoToProducts={() => {
            setCartOpen(false);
            navigate('/mehsullar');
          }}
          metroSchedule={metroSchedule}
          coupons={allCoupons}
        />
      </Suspense>

      <PWAInstallBanner />

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
        @media (max-width: 640px) {
          .ravio-reelworks-inner { flex-direction: column !important; overflow: visible !important; }
          .ravio-reel-main-img   { flex: none !important; width: 100% !important; aspect-ratio: 4/3 !important; }
          .ravio-reel-thumbs     { display: none !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .ravio-reel-main-img { flex: 0 0 52% !important; }
          .ravio-reel-thumbs   { flex: 1 !important; }
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

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <Analytics />
    </BrowserRouter>
  );
}
