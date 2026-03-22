import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Users, PackageCheck, Search, X, Home } from 'lucide-react';
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
  cartCount,
  onLogoClick,
  onCartClick,
  onAboutClick,
  onContactClick,
  onDeliveryClick,
  products = [],
  onViewProduct,
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Sanity-dən loqonu yüklə
  useEffect(() => {
    client
      .fetch(`*[_type == "siteSettings"][0]{ logo }`)
      .then((data: any) => {
        if (data?.logo) {
          setLogoUrl(urlFor(data.logo));
        }
      })
      .catch(() => {
        // Xəta olarsa heç nə göstərmə
      });
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (p: Product) => {
    if (onViewProduct) onViewProduct(p);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* LOQO — Sanity-dən gəlir */}
          <button
            onClick={onLogoClick}
            className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity outline-none"
            title="Ana səhifəyə qayıt"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Ravio.az"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            ) : (
              // Loqo yüklənənə qədər placeholder
              <div className="h-10 sm:h-12 w-28 bg-gray-100 rounded-xl animate-pulse" />
            )}
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={onLogoClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <Home className="h-4 w-4" /> Ana Səhifə
            </button>
            <button onClick={onAboutClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <Users className="h-4 w-4" /> Haqqımızda
            </button>
            <button onClick={onDeliveryClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <PackageCheck className="h-4 w-4" /> Hazırlanma & Çatdırılma
            </button>
            <button onClick={onContactClick} className="text-sm font-bold text-gray-500 hover:text-[#FF8C00] transition-colors flex items-center gap-2">
              <Phone className="h-4 w-4" /> Əlaqə
            </button>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Axtarış */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(v => !v)}
                aria-label="Axtarış"
                className="p-3 rounded-2xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all duration-300"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Məhsul axtar..."
                      className="flex-1 outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300"
                    />
                    {query && <button onClick={() => setQuery('')}><X className="h-4 w-4 text-gray-300" /></button>}
                  </div>
                  {results.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto py-2">
                      {results.map(p => (
                        <li key={p.id}>
                          <button
                            onClick={() => handleSelect(p)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-left transition-colors"
                          >
                            {p.variants?.[0]?.images?.[0] && (
                              <img src={p.variants[0].images[0]} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                            )}
                            <span className="text-sm font-bold text-gray-800">{p.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim().length > 1 ? (
                    <p className="text-center text-xs font-bold text-gray-400 py-6">Nəticə tapılmadı</p>
                  ) : null}
                </div>
              )}
            </div>

            <button
              onClick={onCartClick}
              aria-label="Səbət"
              className="relative p-3 rounded-2xl text-gray-500 hover:text-[#FF8C00] hover:bg-orange-50 transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 bg-black text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;