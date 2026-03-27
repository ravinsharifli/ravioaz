import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, X, Home, Users, PackageCheck, Phone, Menu } from 'lucide-react';
import { Product } from '../types';
import { client } from '../sanityclient';
import { createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder({ projectId: 'w7scii42', dataset: 'production' });
const urlFor = (source: any) => builder.image(source).url();

interface NavbarProps {
  cartCount: number;
  onLogoClick: () => void;
  onCartClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  onDeliveryClick: () => void;
  products?: Product[];
  onViewProduct?: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount, onLogoClick, onCartClick,
  onAboutClick, onContactClick, onDeliveryClick,
  products = [], onViewProduct,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    client.fetch(`*[_type == "siteSettings"][0]{ logo }`)
      .then((data: any) => { if (data?.logo) setLogoUrl(urlFor(data.logo)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const handleSelect = (p: Product) => {
    if (onViewProduct) onViewProduct(p);
    setQuery(''); setSearchOpen(false);
  };

  const navLinks = [
    { label: 'Ana Səhifə', icon: <Home className="h-3.5 w-3.5" />, action: onLogoClick },
    { label: 'Haqqımızda', icon: <Users className="h-3.5 w-3.5" />, action: onAboutClick },
    { label: 'Çatdırılma', icon: <PackageCheck className="h-3.5 w-3.5" />, action: onDeliveryClick },
    { label: 'Əlaqə', icon: <Phone className="h-3.5 w-3.5" />, action: onContactClick },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_30px_rgba(0,0,0,0.08)]'
          : 'bg-white/90 backdrop-blur-md'
      }`}>
        {/* Üst nazik zolaq */}
        <div className="bg-gradient-to-r from-[#FF8C00] via-[#FF6B00] to-[#FF8C00] h-0.5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* LOQO */}
            <button onClick={onLogoClick} className="flex items-center gap-3 group outline-none">
              {logoUrl ? (
                <img src={logoUrl} alt="Ravio.az" className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                    <span className="text-white font-black text-sm">R</span>
                  </div>
                  <span className="text-xl font-black text-[#1A1A1A] tracking-tight">ravio<span className="text-[#FF8C00]">.az</span></span>
                </div>
              )}
            </button>

            {/* NAV LİNKLƏR — desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button key={link.label} onClick={link.action}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all duration-200 outline-none">
                  {link.icon}
                  {link.label}
                </button>
              ))}
            </div>

            {/* SAĞ DÜYMƏLƏR */}
            <div className="flex items-center gap-1">
              {/* Axtarış */}
              <div className="relative">
                <button onClick={() => { setSearchOpen(v => !v); setMenuOpen(false); }}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all outline-none">
                  {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-50">
                      <Search className="h-4 w-4 text-[#FF8C00] flex-shrink-0" />
                      <input autoFocus type="text" value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Məhsul axtar..."
                        className="flex-1 outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300 bg-transparent" />
                      {query && <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500"><X className="h-4 w-4" /></button>}
                    </div>
                    {results.length > 0 ? (
                      <ul className="max-h-72 overflow-y-auto py-2">
                        {results.map(p => (
                          <li key={p.id}>
                            <button onClick={() => handleSelect(p)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors group">
                              {p.variants?.[0]?.images?.[0] && (
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                                  <img src={p.variants[0].images[0]} className="w-full h-full object-cover" alt="" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-[#FF8C00] transition-colors">{p.name}</p>
                                {p.variants?.[0] && (
                                  <p className="text-xs text-gray-400 font-medium">
                                    {(p.variants[0].discountPrice || p.variants[0].price).toFixed(2)} AZN
                                  </p>
                                )}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : query.trim().length > 1 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm font-medium text-gray-400">Nəticə tapılmadı</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Səbət */}
              <button onClick={onCartClick}
                className="relative p-2.5 rounded-xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all outline-none">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-md shadow-orange-200">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobil menyu */}
              <button onClick={() => { setMenuOpen(v => !v); setSearchOpen(false); }}
                className="md:hidden p-2.5 rounded-xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all outline-none">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil menyu açıldıqda */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-50 bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <button key={link.label} onClick={() => { link.action(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#FF8C00] hover:bg-orange-50 transition-all outline-none text-left">
                <span className="text-[#FF8C00]">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Navbar hündürlüyü üçün boşluq */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default Navbar;