
import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import PromoBanners from './components/PromoBanners';
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

const CATEGORIES = [
  { name: 'Bütün məhsullar', sub: '' },
  { name: 'Elektronika', sub: '' },
  { name: 'Geyim', sub: 'sizə özəl dizayn' },
  { name: 'Hədiyyə qutuları', sub: '' },
  { name: 'Dəst hədiyyələr', sub: '' },
  { name: 'Aksesuarlar', sub: '' },
  { name: 'Foto çərçivə', sub: '' },
  { name: 'Çap xidmətləri', sub: '' },
  { name: 'Özəl hədiyyələr', sub: 'lazer yazı ilə' }
];

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sanityProducts, setSanityProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('Bütün məhsullar');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const query = `*[_type == "product"]{
        "id": _id,
        name,
        category,
        price,
        rating,
        "images": [image.asset->url] 
      }`;
      const data = await client.fetch(query); 
      setSanityProducts(data);
    } catch (error) {
      console.error("Sanity xətası:", error);
    }
  };

  fetchProducts();
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

  const filteredProducts = sanityProducts.filter(p => activeCategory === 'Bütün məhsullar' || p.category === activeCategory);

  const handleLogoClick = () => {
    setCurrentView('home');
    setActiveCategory('Bütün məhsullar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <aside className="lg:w-72 w-full flex-shrink-0 lg:sticky lg:top-24">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-xl font-black mb-6 text-[#1A1A1A] tracking-tight">Kateqoriyalar</h3>
                  <nav className="space-y-1">
                    {CATEGORIES.map((cat) => (
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
                  <PromoBanners />
                ) : (
                  <div className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-500">
                    <h1 className="text-lg font-black text-[#1A1A1A] tracking-tight">{activeCategory}</h1>
                    <p className="text-gray-400 font-bold mt-1 text-[10px] italic">
                      {activeCategory} kateqoriyasındakı premium kolleksiyamız
                    </p>
                  </div>
                )}
                
                {activeCategory === 'Bütün məhsullar' && (
                  <section className="py-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Premium məhsullar</h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div onClick={() => setSelectedProduct(PREMIUM_PRODUCTS[0])} className="flex-1 bg-[#1A1A1A] rounded-[2.5rem] p-8 relative overflow-hidden cursor-pointer h-[280px] shadow-2xl">
                        <div className="relative z-10 h-full flex flex-col justify-center text-white">
                          <h3 className="text-3xl font-black mb-1">{PREMIUM_PRODUCTS[0].name}</h3>
                          <span className="text-3xl font-black text-[#FF8C00]">{PREMIUM_PRODUCTS[0].price} AZN</span>
                        </div>
                        <img src={PREMIUM_PRODUCTS[0].images[0]} className="absolute right-0 top-0 h-full w-[45%] object-cover opacity-60 rounded-l-[5rem]" alt="Premium" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/90 to-transparent"></div>
                      </div>
                    </div>
                  </section>
                )}

                <div className="pb-16">
                  <ProductGrid products={filteredProducts} onAddToCart={(p) => setSelectedProduct(p)} onViewProduct={setSelectedProduct} />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'about' && <AboutUs />}
        {currentView === 'contact' && <Contact />}
        {currentView === 'delivery' && (
          <DeliveryInfo onHomeClick={() => navigateTo('home')} />
        )}
        {currentView === 'reviews' && <CustomerReviews />}
      </main>

      {(selectedProduct || editingCartItem) && (
        <ProductModal 
          product={editingCartItem || selectedProduct!} 
          initialData={editingCartItem || undefined}
          onClose={() => {
            setSelectedProduct(null);
            setEditingCartItem(null);
          }} 
          onAddToCart={addToCart}
          onOpenCategory={(cat) => {
            setActiveCategory(cat);
            setCurrentView('home');
          }}
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
