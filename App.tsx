import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import CartDrawer from './components/CartDrawer';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import DeliveryInfo from './components/DeliveryInfo';
import CustomerReviews from './components/CustomerReviews';
import { MOCK_PRODUCTS, PREMIUM_PRODUCTS, COLORS } from './constants';
import { Product, CartItem, AppView } from './types';
import { ChevronRight } from 'lucide-react';
import { client } from './sanityclient';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
const urlFor = (source: any) => builder.image(source);

const SIZE_CONFIG: Record<string, string> = {
  'square':      'aspect-square',
  'wide-thin':   'aspect-[4/1]',
  'wide-medium': 'aspect-[3/1]',
  'wide-thick':  'aspect-[2/1]',
  'tall-small':  'aspect-[2/3]',
  'tall-large':  'aspect-[1/2]',
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sanityProducts, setSanityProducts] = useState<Product[]>([]);
  const [sanityCategories, setSanityCategories] = useState<any[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<any[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Bütün məhsullar');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = `*[_type == "product"]{
          "id": _id,
          name,
          "category": category->name,
          price,
          discountPrice,
          rating,
          description,
          "images": images[].asset->url,
          availableColors,
          stockQuantity,
          isPremium,
          premiumOrder,
          premiumSize
        }`;
        const products = await client.fetch(productsQuery);
        setSanityProducts(products);

        const premiums = products
          .filter((p: any) => p.isPremium)
          .sort((a: any, b: any) => (a.premiumOrder || 999) - (b.premiumOrder || 999))
          .slice(0, 3);
        setPremiumProducts(premiums);

        const categoriesQuery = `*[_type == "category"]{ name, description }`;
        const categories = await client.fetch(categoriesQuery);
        setSanityCategories([
          { name: 'Bütün məhsullar', sub: '' },
          ...categories.map((cat: any) => ({ name: cat.name, sub: cat.description || '' }))
        ]);

        const bannersQuery = `*[_type == "promoBanner" && isActive == true] | order(order asc){
          image, title, subtitle, badge, titleColor, backgroundColor,
          buttonText, buttonCategory, isActive, order, size
        }`;
        const banners = await client.fetch(bannersQuery);
        setPromoBanners(banners);
      } catch (error) {
        console.error("Sanity xətası:", error);
      }
    };
    fetchData();
  }, []);

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

  const handleLogoClick = () => {
    setCurrentView('home');
    setActiveCategory('Bütün məhsullar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBannerButtonClick = (buttonCategory: string) => {
    const target = buttonCategory?.trim() || 'Bütün məhsullar';
    setActiveCategory(target);
    setCurrentView('home');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const renderSingleBanner = (banner: any, index: number) => {
    const aspectClass = SIZE_CONFIG[banner.size] || SIZE_CONFIG['wide-medium'];
    const hasText = banner.title || banner.subtitle || banner.badge;
    const bgColor = banner.backgroundColor || '#1A1A1A';
    const titleColor = banner.titleColor || '#FF8C00';

    return (
      <div
        key={index}
        className={`relative w-full rounded-[2rem] overflow-hidden shadow-xl ${aspectClass}`}
        style={{ backgroundColor: bgColor }}
      >
        {/* Arxa fon şəkli - tam görünsün, heç bir örtük yoxdur */}
        {banner.image && (
          <img
            src={urlFor(banner.image).url()}
            alt="Kampaniya"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Şəkil varsa - tam üzərinə 40% örtük */}
        {banner.image && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {/* Məzmun - yazılar şəklin üzərində */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 py-6 gap-3">
          {banner.badge && (
            <span className="inline-block self-start bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-black">
              {banner.badge}
            </span>
          )}
          {banner.title && (
            <h2
              className="text-3xl md:text-5xl font-black tracking-tight leading-none"
              style={{ color: titleColor }}
            >
              {banner.title}
            </h2>
          )}
          {banner.subtitle && (
            <p className="text-white text-base md:text-xl font-bold drop-shadow-md">
              {banner.subtitle}
            </p>
          )}
          {banner.buttonText && (
            <div className="mt-2">
              <button
                onClick={() => handleBannerButtonClick(banner.buttonCategory)}
                className="bg-white text-[#1A1A1A] px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-lg hover:bg-[#FF8C00] hover:text-white"
              >
                {banner.buttonText} →
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
      <div className="flex flex-col gap-4 mb-8">
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
      <section className="py-8">
        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-8">Premium məhsullar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {large && (
            <div onClick={() => setSelectedProduct(large)} className="bg-[#1A1A1A] rounded-[2.5rem] p-8 relative overflow-hidden cursor-pointer h-[280px] md:h-[400px] shadow-2xl">
              <div className="relative z-10 h-full flex flex-col justify-center text-white">
                <h3 className="text-3xl font-black mb-1">{large.name}</h3>
                {large.discountPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-400 line-through">{large.price} AZN</span>
                    <span className="text-3xl font-black text-[#FF8C00]">{large.discountPrice} AZN</span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-[#FF8C00]">{large.price} AZN</span>
                )}
              </div>
              {large.images?.[0] && (
                <>
                  <img src={large.images[0]} className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-60 rounded-l-[5rem]" alt={large.name} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-transparent" />
                </>
              )}
            </div>
          )}
          <div className="flex flex-col gap-6">
            {smallTop && (
              <div onClick={() => setSelectedProduct(smallTop)} className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-[2.5rem] p-6 relative overflow-hidden cursor-pointer h-[192px] shadow-xl">
                <div className="relative z-10 h-full flex flex-col justify-center text-white">
                  <h3 className="text-xl font-black mb-1">{smallTop.name}</h3>
                  {smallTop.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400 line-through">{smallTop.price} AZN</span>
                      <span className="text-2xl font-black text-[#FF8C00]">{smallTop.discountPrice} AZN</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-[#FF8C00]">{smallTop.price} AZN</span>
                  )}
                </div>
                {smallTop.images?.[0] && (
                  <>
                    <img src={smallTop.images[0]} className="absolute right-0 top-0 h-full w-[35%] object-cover opacity-40" alt={smallTop.name} />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2A2A2A] via-[#2A2A2A]/90 to-transparent" />
                  </>
                )}
              </div>
            )}
            {smallBottom && (
              <div onClick={() => setSelectedProduct(smallBottom)} className="bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] rounded-[2.5rem] p-6 relative overflow-hidden cursor-pointer h-[192px] shadow-xl">
                <div className="relative z-10 h-full flex flex-col justify-center text-white">
                  <h3 className="text-xl font-black mb-1">{smallBottom.name}</h3>
                  {smallBottom.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white/70 line-through">{smallBottom.price} AZN</span>
                      <span className="text-2xl font-black text-white">{smallBottom.discountPrice} AZN</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-black text-white">{smallBottom.price} AZN</span>
                  )}
                </div>
                {smallBottom.images?.[0] && (
                  <>
                    <img src={smallBottom.images[0]} className="absolute right-0 top-0 h-full w-[35%] object-cover opacity-30" alt={smallBottom.name} />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#FF8C00]/90 to-transparent" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100">
      <Navbar
        cartCount={cartCount}
        onLogoClick={handleLogoClick}
        onCartClick={() => setIsCartOpen(true)}
        onAboutClick={() => navigateTo('about')}
        onContactClick={() => navigateTo('contact')}
        onDeliveryClick={() => navigateTo('delivery')}
      />
      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-8">

            {/* MOBİL: Üfüqi sürüşən kateqoriya düymələri */}
            <div className="lg:hidden mb-4 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
                {sanityCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                      activeCategory === cat.name
                        ? 'bg-[#FF8C00] text-white shadow-lg'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* DESKTOP: Sol panel kateqoriyalar */}
              <aside className="hidden lg:block lg:w-72 flex-shrink-0 lg:sticky lg:top-24">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-xl font-black mb-6 text-[#1A1A1A] tracking-tight">Kateqoriyalar</h3>
                  <nav className="space-y-1">
                    {sanityCategories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setActiveCategory(cat.name);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex flex-col items-start px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                          activeCategory === cat.name
                            ? 'bg-[#FF8C00] text-white shadow-lg shadow-orange-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold text-left">{cat.name}</span>
                          <ChevronRight className={`h-4 w-4 transition-transform flex-shrink-0 ${activeCategory === cat.name ? 'rotate-90' : ''}`} />
                        </div>
                        {cat.sub && (
                          <span className={`text-[10px] font-bold mt-0.5 opacity-80 text-left ${activeCategory === cat.name ? 'text-white' : 'text-[#FF8C00]'}`}>
                            {cat.sub}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
              <div className="flex-grow w-full space-y-8">
                {activeCategory === 'Bütün məhsullar' ? (
                  <>
                    {renderPromoBanners()}
                    {renderPremiumProducts()}
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
                    <h1 className="text-lg font-black text-[#1A1A1A] tracking-tight">{activeCategory}</h1>
                    <p className="text-gray-400 font-bold mt-1 text-[10px] italic">
                      {activeCategory} kateqoriyasındakı premium kolleksiyamız
                    </p>
                  </div>
                )}
                <div className="pb-16">
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={(p) => setSelectedProduct(p)}
                    onViewProduct={setSelectedProduct}
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
          product={editingCartItem || selectedProduct!}
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
      />
      <AIAssistant />
      <Footer onReviewsClick={() => navigateTo('reviews')} />
    </div>
  );
};

export default App;