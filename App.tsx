import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import CustomerReviews from './components/CustomerReviews';
import { Product, CartItem, AppView } from './types';
import { ChevronRight, Star, Tag, Gem, ArrowRight, Gift, Truck, Shield } from 'lucide-react';
import { client } from './sanityclient';
import { createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder({ projectId: 'w7scii42', dataset: 'production' });
const urlFor = (source: any) => builder.image(source).url();

const SIZE_CONFIG: Record<string, string> = {
  'square': 'aspect-square',
  'wide-thin': 'aspect-[4/1]',
  'wide-medium': 'aspect-[3/1]',
  'wide-thick': 'aspect-[2/1]',
  'tall-small': 'aspect-[2/3]',
  'tall-large': 'aspect-[1/2]',
};

const BEST_SELLER_THRESHOLD = 5;

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sanityProducts, setSanityProducts] = useState<Product[]>([]);
  const [sanityCategories, setSanityCategories] = useState<any[]>([{ name: 'Bütün məhsullar', sub: '' }]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Bütün məhsullar');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = `*[_type == "product"]{
          "id": _id, name, "category": category->name, description,
          "variants": variants[]{ modelName, colorName, "images": images[].asset->url, price, discountPrice, stock },
          isPremium, premiumOrder, premiumSize,
          isBestSeller, bestSellerOrder, orderCount,
          hasBulkDiscount, bulkDiscountNote,
          "bulkTiers": bulkTiers[]{ minQty, maxQty, discountAmount, label }
        }`;
        const products = await client.fetch(productsQuery);
        setSanityProducts(products || []);

        const premiums = (products || [])
          .filter((p: any) => p.isPremium)
          .sort((a: any, b: any) => (a.premiumOrder || 999) - (b.premiumOrder || 999))
          .slice(0, 3);
        setPremiumProducts(premiums);

        const categoriesQuery = `*[_type == "category"]{ name, description }`;
        const categories = await client.fetch(categoriesQuery);
        setSanityCategories([
          { name: 'Bütün məhsullar', sub: '' },
          ...(categories || []).map((cat: any) => ({ name: cat.name, sub: cat.description || '' }))
        ]);

        const bannersQuery = `*[_type == "promoBanner" && isActive == true] | order(order asc){
          image, title, subtitle, badge, titleColor, backgroundColor, buttonText, buttonCategory, isActive, order, size
        }`;
        const banners = await client.fetch(bannersQuery);
        setPromoBanners(banners || []);
      } catch (error) {
        console.error("Sanity xətası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bestSellerProducts = sanityProducts
    .filter(p => p.isBestSeller || (p.orderCount || 0) >= BEST_SELLER_THRESHOLD)
    .sort((a, b) => (a.bestSellerOrder || 999) - (b.bestSellerOrder || 999))
    .slice(0, 8);

  const discountedProducts = sanityProducts
    .filter(p => p.variants?.some(v => v.discountPrice && v.discountPrice < v.price))
    .slice(0, 8);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.cartId === item.cartId);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = item;
        return newCart;
      }
      return [...prev, item];
    });
    setEditingCartItem(null);
    setSelectedProduct(null);
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const handleEditCartItem = (item: CartItem) => {
    setEditingCartItem(item);
    setIsCartOpen(false);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = sanityProducts.filter(p =>
    activeCategory === 'Bütün məhsullar' || p.category === activeCategory
  );

  const editingProduct: Product | null = editingCartItem ? {
    id: editingCartItem.productId,
    name: editingCartItem.productName,
    category: '',
    variants: [{
      modelName: editingCartItem.modelName,
      colorName: editingCartItem.colorName,
      images: editingCartItem.images,
      price: editingCartItem.price,
      discountPrice: editingCartItem.discountPrice,
      stock: 99,
    }],
  } : null;

  const handleLogoClick = () => {
    setCurrentView('home');
    setActiveCategory('Bütün məhsullar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToProducts = () => {
    setCurrentView('home');
    setActiveCategory('Bütün məhsullar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerButtonClick = (buttonCategory: string) => {
    const target = buttonCategory?.trim() || 'Bütün məhsullar';
    setActiveCategory(target);
    setCurrentView('home');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const getProductMinPrice = (p: any) => {
    const variants = p.variants || [];
    if (variants.length === 0) return { display: 0, old: null };
    const prices = variants.map((v: any) => v.discountPrice || v.price || 0);
    const oldPrices = variants.map((v: any) => v.price || 0);
    const min = Math.min(...prices);
    const oldMin = Math.min(...oldPrices);
    const hasDiscount = variants.some((v: any) => v.discountPrice && v.discountPrice < v.price);
    return { display: min, old: hasDiscount ? oldMin : null };
  };

  // Etibar göstəriciləri
  const TrustBadges = () => (
    <div className="flex flex-wrap justify-center gap-6 py-6 px-4">
      {[
        { icon: <Shield className="h-4 w-4" />, text: 'Keyfiyyət Zəmanəti' },
        { icon: <Truck className="h-4 w-4" />, text: 'Sürətli Çatdırılma' },
        { icon: <Gift className="h-4 w-4" />, text: 'Özəl Hazırlanma' },
        { icon: <Star className="h-4 w-4 fill-current" />, text: 'Daimi Endirim' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-500">
          <span className="text-[#FF8C00]">{item.icon}</span>
          <span className="text-xs font-semibold">{item.text}</span>
        </div>
      ))}
    </div>
  );

  // Bölmə başlığı
  const SectionTitle = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">{title}</h2>
        <div className="h-0.5 w-8 bg-gradient-to-r from-[#FF8C00] to-transparent mt-1 rounded-full" />
      </div>
    </div>
  );

  const renderSingleBanner = (banner: any, index: number) => {
    const aspectClass = SIZE_CONFIG[banner.size] || SIZE_CONFIG['wide-medium'];
    const bgColor = banner.backgroundColor || '#1A1A1A';
    const titleColor = banner.titleColor || '#FF8C00';
    return (
      <div key={index} className={`relative w-full rounded-3xl overflow-hidden ${aspectClass}`}
        style={{ backgroundColor: bgColor, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        {banner.image && (
          <img src={urlFor(banner.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {banner.image && <div className="absolute inset-0 bg-black/35" />}
        <div className="absolute inset-0 flex flex-col justify-center px-8 py-6 gap-3">
          {banner.badge && (
            <span className="inline-block self-start bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
              {banner.badge}
            </span>
          )}
          {banner.title && (
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none" style={{ color: titleColor }}>
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className="text-white/90 text-base md:text-lg font-semibold">{banner.subtitle}</p>
          )}
          {banner.buttonText && (
            <div className="mt-1">
              <button onClick={() => handleBannerButtonClick(banner.buttonCategory)}
                className="group flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#FF8C00] hover:text-white transition-all duration-300 shadow-lg">
                {banner.buttonText}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPromoBanners = () => {
    if (promoBanners.length === 0) return null;
    const wideBanners = promoBanners.filter(b => !b.size?.startsWith('tall') && b.size !== 'square');
    const compactBanners = promoBanners.filter(b => b.size?.startsWith('tall') || b.size === 'square');
    return (
      <div className="flex flex-col gap-4 mb-10">
        {wideBanners.map((banner, i) => renderSingleBanner(banner, i))}
        {compactBanners.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {compactBanners.map((banner, i) => renderSingleBanner(banner, i + 100))}
          </div>
        )}
      </div>
    );
  };

  const renderPremiumProducts = () => {
    if (premiumProducts.length === 0) return null;
    const large = premiumProducts.find((p: any) => p.premiumSize === 'large');
    const smallTop = premiumProducts.find((p: any) => p.premiumSize === 'small-top');
    const smallBottom = premiumProducts.find((p: any) => p.premiumSize === 'small-bottom');

    return (
      <section className="py-2">
        <SectionTitle icon={<Gem className="h-4.5 w-4.5 text-purple-600" />} title="Premium məhsullar" color="bg-purple-100" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {large && (() => {
            const { display, old } = getProductMinPrice(large);
            const firstImg = large.variants?.[0]?.images?.[0];
            return (
              <div onClick={() => setSelectedProduct(large)}
                className="bg-[#1A1A1A] rounded-3xl p-8 relative overflow-hidden cursor-pointer h-[260px] md:h-[380px] group"
                style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}>
                <div className="relative z-10 h-full flex flex-col justify-center text-white">
                  <span className="text-[11px] font-black text-[#FF8C00] uppercase tracking-widest mb-2">Premium</span>
                  <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight">{large.name}</h3>
                  {old ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500 line-through">{old} AZN</span>
                      <span className="text-2xl font-black text-[#FF8C00]">{display} AZN</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-[#FF8C00]">{display} AZN</span>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-white/60 text-xs font-semibold group-hover:text-white/90 transition-colors">
                    <span>Bax</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                {firstImg && (
                  <>
                    <img src={firstImg} className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-50 group-hover:opacity-60 transition-opacity rounded-l-[3rem]" alt={large.name} />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/85 to-transparent" />
                  </>
                )}
              </div>
            );
          })()}

          <div className="flex flex-col gap-5">
            {smallTop && (() => {
              const { display, old } = getProductMinPrice(smallTop);
              const firstImg = smallTop.variants?.[0]?.images?.[0];
              return (
                <div onClick={() => setSelectedProduct(smallTop)}
                  className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-3xl p-6 relative overflow-hidden cursor-pointer h-[180px] group"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                  <div className="relative z-10 h-full flex flex-col justify-center text-white">
                    <h3 className="text-lg font-black mb-1.5">{smallTop.name}</h3>
                    {old ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 line-through">{old} AZN</span>
                        <span className="text-xl font-black text-[#FF8C00]">{display} AZN</span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-[#FF8C00]">{display} AZN</span>
                    )}
                  </div>
                  {firstImg && (
                    <>
                      <img src={firstImg} className="absolute right-0 top-0 h-full w-[35%] object-cover opacity-35" alt={smallTop.name} />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2A2A2A] via-[#2A2A2A]/90 to-transparent" />
                    </>
                  )}
                </div>
              );
            })()}

            {smallBottom && (() => {
              const { display, old } = getProductMinPrice(smallBottom);
              const firstImg = smallBottom.variants?.[0]?.images?.[0];
              return (
                <div onClick={() => setSelectedProduct(smallBottom)}
                  className="bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] rounded-3xl p-6 relative overflow-hidden cursor-pointer h-[180px] group"
                  style={{ boxShadow: '0 8px 24px rgba(255,140,0,0.25)' }}>
                  <div className="relative z-10 h-full flex flex-col justify-center text-white">
                    <h3 className="text-lg font-black mb-1.5">{smallBottom.name}</h3>
                    {old ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white/60 line-through">{old} AZN</span>
                        <span className="text-xl font-black text-white">{display} AZN</span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-white">{display} AZN</span>
                    )}
                  </div>
                  {firstImg && (
                    <>
                      <img src={firstImg} className="absolute right-0 top-0 h-full w-[35%] object-cover opacity-25" alt={smallBottom.name} />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#FF8C00]/90 to-transparent" />
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#FF8C00] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] selection:bg-orange-100">
      <Navbar
        cartCount={cartCount}
        onLogoClick={handleLogoClick}
        onCartClick={() => setIsCartOpen(true)}
        onAboutClick={() => navigateTo('about')}
        onContactClick={() => navigateTo('contact')}
        onDeliveryClick={() => navigateTo('delivery')}
        products={sanityProducts}
        onViewProduct={(p) => { setSelectedProduct(p); setCurrentView('home'); }}
      />

      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6">

            {/* Etibar zolağı */}
            <div className="bg-white rounded-2xl mb-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <TrustBadges />
            </div>

            {/* Mobil kateqoriya */}
            <div className="lg:hidden mb-5 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {sanityCategories.map((cat) => (
                  <button key={cat.name}
                    onClick={() => { setActiveCategory(cat.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeCategory === cat.name
                        ? 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white shadow-md shadow-orange-200'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Sol panel */}
              <aside className="hidden lg:block lg:w-64 flex-shrink-0 lg:sticky lg:top-28">
                <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <h3 className="text-sm font-black text-[#1A1A1A] uppercase tracking-widest mb-4">Kateqoriyalar</h3>
                  <nav className="space-y-0.5">
                    {sanityCategories.map((cat) => (
                      <button key={cat.name}
                        onClick={() => { setActiveCategory(cat.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 outline-none ${
                          activeCategory === cat.name
                            ? 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white shadow-md shadow-orange-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]'
                        }`}>
                        <span className="text-sm font-semibold text-left leading-snug">{cat.name}</span>
                        <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${activeCategory === cat.name ? 'rotate-90' : ''}`} />
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Əsas məzmun */}
              <div className="flex-grow w-full space-y-10">
                {activeCategory === 'Bütün məhsullar' ? (
                  <>
                    {renderPromoBanners()}

                    {bestSellerProducts.length > 0 && (
                      <section>
                        <SectionTitle
                          icon={<Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          title="Ən çox satılanlar"
                          color="bg-yellow-50" />
                        <ProductGrid products={bestSellerProducts} onAddToCart={p => setSelectedProduct(p)} onViewProduct={setSelectedProduct} />
                      </section>
                    )}

                    {discountedProducts.length > 0 && (
                      <section>
                        <SectionTitle
                          icon={<Tag className="h-4 w-4 text-red-500" />}
                          title="Endirimli məhsullar"
                          color="bg-red-50" />
                        <ProductGrid products={discountedProducts} onAddToCart={p => setSelectedProduct(p)} onViewProduct={setSelectedProduct} />
                      </section>
                    )}

                    {renderPremiumProducts()}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100">
                    <h1 className="text-lg font-black text-[#1A1A1A]">{activeCategory}</h1>
                    <p className="text-gray-400 text-xs font-medium mt-0.5">{activeCategory} kateqoriyasındakı məhsullar</p>
                  </div>
                )}

                <div className="pb-16">
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={p => setSelectedProduct(p)}
                    onViewProduct={setSelectedProduct}
                    title={activeCategory !== 'Bütün məhsullar' ? undefined : 'Bütün məhsullar'}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {currentView === 'about' && <AboutUs />}
        {currentView === 'contact' && <Contact />}
        {currentView === 'delivery' && <DeliveryInfo onHomeClick={() => navigateTo('home')} />}
        {currentView === 'reviews' && <CustomerReviews />}
      </main>

      {(selectedProduct || editingCartItem) && (
        <ProductModal
          product={editingCartItem ? editingProduct! : selectedProduct!}
          initialData={editingCartItem || undefined}
          onClose={() => { setSelectedProduct(null); setEditingCartItem(null); }}
          onAddToCart={addToCart}
          onOpenCategory={(cat) => { setActiveCategory(cat); setCurrentView('home'); }}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onEdit={handleEditCartItem}
        onGoToProducts={handleGoToProducts}
      />

      <Footer onReviewsClick={() => navigateTo('reviews')} />
    </div>
  );
};

export default App;