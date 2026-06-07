import React, { useState, useEffect, useRef } from 'react';
import '../styles/navbar.css';
import { C, F } from '../tokens';
import { ShoppingBag, Search, X, Menu } from 'lucide-react';
import { Product } from '../types';

interface NavbarProps {
  cartCount: number;
  onLogoClick: () => void;
  onCartClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  onDeliveryClick: () => void;
  onProductsClick: () => void;
  products?: Product[];
  onViewProduct?: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount, onLogoClick, onCartClick,
  onAboutClick, onContactClick, onDeliveryClick, onProductsClick,
  products = [], onViewProduct,
}) => {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const navLinks = [
    { label: 'Məhsullar',  action: onProductsClick },
    { label: 'Çatdırılma', action: onDeliveryClick },
    { label: 'Haqqımızda', action: onAboutClick },
    { label: 'Əlaqə',      action: onContactClick },
  ];

  const NAV_H = 60;

  return (
    <>
      {/* Main nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: C.white,
        borderBottom: scrolled ? '1px solid #E5E1DB' : '1px solid #EDEBE7',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 16px',
          height: NAV_H, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>
          {/* Logo */}
          <button onClick={onLogoClick} aria-label="Ana səhifəyə qayıt" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <img
              src="/og-ravio.png"
              alt="Ravio logo"
              style={{
                width: 38, height: 38, borderRadius: 8,
                objectFit: 'cover', display: 'block',
              }}
            />
            <span className="ravio-nav-brand-text" style={{ fontFamily: F.sans, fontSize: 18, fontWeight: 800, color: C.black, letterSpacing: '-0.5px' }}>
              Sizə Özəl Hədiyyələr
            </span>
          </button>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="r-desktop-nav">
            {navLinks.map(link => (
              <button key={link.label} onClick={link.action} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px', fontSize: 13, fontWeight: 500,
                color: '#444444', fontFamily: F.sans,
                borderRadius: 6, transition: 'color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = C.black; e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444444'; e.currentTarget.style.background = 'transparent'; }}
              >{link.label}</button>
            ))}
          </div>

          {/* Right icons */}
          <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, position: 'relative' }}>
            {/* Search button */}
            <button onClick={() => { setSearchOpen(v => !v); setQuery(''); }}
  aria-label={searchOpen ? "Axtarışı bağla" : "Axtarış"}
  aria-expanded={searchOpen}
  style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: 40, height: 40, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: searchOpen ? C.primary : '#444444',
              transition: 'color 0.15s',
            }}>
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>

            {searchOpen && (
              <div
                className="ravio-search-panel"
                style={{
                  position: 'absolute', right: 0, top: 46,
                  width: 'min(340px, calc(100vw - 32px))',
                  background: C.white,
                  border: '1px solid #E5E1DB', borderRadius: 12,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  overflow: 'hidden', zIndex: 500,
                  ['--panel-top' as string]: `${NAV_H + 8}px`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #F0EBE2' }}>
                  <Search size={14} color={C.primary} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Məhsul axtar..."
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: 15, color: C.black,
                      fontFamily: F.sans,
                      background: 'transparent',
                      minWidth: 0,
                    }}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, flexShrink: 0 }}>
                      <X size={13} />
                    </button>
                  )}
                </div>

                {results.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 320, overflowY: 'auto' as const }}>
                    {results.map(p => (
                      <li key={p.id}>
                        <button
                          onClick={() => { onViewProduct?.(p); setSearchOpen(false); setQuery(''); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 16px', background: 'none', border: 'none',
                            cursor: 'pointer', textAlign: 'left' as const,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          {p.variants?.[0]?.images?.[0] && (
                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: C.bg, flexShrink: 0 }}>
                              <img
                                src={p.variants[0].images[0]}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt=""
                              />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              margin: 0, fontSize: 13, fontWeight: 600, color: C.black,
                              fontFamily: F.sans,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                            }}>
                              {p.name}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: C.primary, fontWeight: 700 }}>
                              {(p.variants[0]?.discountPrice ?? p.variants[0]?.price ?? 0).toFixed(2)} ₼
                            </p>
                          </div>
                          <span style={{ color: '#CCCCCC', fontSize: 16, flexShrink: 0 }}>›</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query.trim().length > 1 ? (
                  <div style={{ padding: '24px', textAlign: 'center' as const, color: '#999', fontSize: 13 }}>
                    🔍 Nəticə tapılmadı
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center' as const, color: '#BBBBBB', fontSize: 12 }}>
                    Axtar...
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            <button onClick={onCartClick}
  aria-label={`Alış-veriş səbəti${cartCount > 0 ? ` (${cartCount} məhsul)` : ''}`}
  style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              width: 40, height: 40, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#444444',
            }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  background: C.primary, color: C.white,
                  fontSize: 9, fontWeight: 800,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
  className="r-mobile-menu-btn"
  aria-label={menuOpen ? "Menyu bağla" : "Menyu aç"}
  aria-expanded={menuOpen}
  onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 8,
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                color: C.black,
              }}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            background: C.white,
            borderTop: '1px solid #F0EBE2',
            padding: '8px 16px 28px',
          }}>
            {navLinks.map(link => (
              <button key={link.label} onClick={() => { link.action(); setMenuOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '15px 8px', textAlign: 'left' as const, display: 'block',
                  fontSize: 16, fontWeight: 500, color: C.black,
                  fontFamily: F.sans,
                  borderBottom: '1px solid #F5F2EC',
                }}
              >{link.label}</button>
            ))}
            <button
              onClick={() => { setMenuOpen(false); onProductsClick(); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 20, padding: '15px', width: '100%',
                background: C.primary, color: C.white,
                border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                fontFamily: F.sans,
                cursor: 'pointer',
              }}
            >🛍️ Sifarişə başla</button>
          </div>
        )}
      </nav>

      {/* Spacer — yalnız nav hündürlüyü qədər */}
      <div style={{ height: NAV_H }} />

    </>
  );
};

export default Navbar;