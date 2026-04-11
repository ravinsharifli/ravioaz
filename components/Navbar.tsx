import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, X, Menu } from 'lucide-react';
import { Product } from '../types';

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

const NAV_LINKS = [
  { label: 'Məhsullar' },
  { label: 'Çatdırılma' },
  { label: 'Haqqımızda' },
  { label: 'Əlaqə' },
];

const Navbar: React.FC<NavbarProps> = ({
  cartCount, onLogoClick, onCartClick,
  onAboutClick, onContactClick, onDeliveryClick,
  products = [], onViewProduct,
}) => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]         = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const actions = [onLogoClick, onDeliveryClick, onAboutClick, onContactClick];

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

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
      {/* Announcement bar */}
      <div style={{
        background: '#111111',
        color: '#FFFFFF',
        textAlign: 'center' as const,
        fontSize: 12,
        fontWeight: 500,
        padding: '9px 16px',
        letterSpacing: 0.3,
        fontFamily: "'Inter', sans-serif",
      }}>
        🚚 Bakı daxili çatdırılma — <strong style={{ color: '#FF6A00' }}>4.99 ₼</strong>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        ✦ Lazer yazı ilə fərdi hədiyyə
      </div>

      {/* Main nav */}
      <nav style={{
        position: 'fixed',
        top: 38,
        left: 0, right: 0,
        zIndex: 1000,
        background: '#FFFFFF',
        borderBottom: scrolled ? '1px solid #E8E3DA' : '1px solid #F0EBE3',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          {/* Logo */}
          <button onClick={onLogoClick} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 30, height: 30,
              background: '#111111',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                color: '#FF6A00',
                fontSize: 16, fontWeight: 800,
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1,
              }}>R</span>
            </div>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 18, fontWeight: 800,
              color: '#111111',
              letterSpacing: '-0.5px',
            }}>ravio</span>
          </button>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="r-desktop-nav">
            {NAV_LINKS.map((link, i) => (
              <button key={link.label} onClick={actions[i]} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px',
                fontSize: 13, fontWeight: 500,
                color: '#444444',
                fontFamily: "'Inter', sans-serif",
                borderRadius: 6,
                transition: 'color 0.15s, background 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#111111'; e.currentTarget.style.background = '#F5F2EC'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444444'; e.currentTarget.style.background = 'transparent'; }}
              >{link.label}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <button onClick={() => { setSearchOpen(v => !v); setQuery(''); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 38, height: 38, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#444444', transition: 'background 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F2EC'; e.currentTarget.style.color = '#111111'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#444444'; }}
              >
                {searchOpen ? <X size={17} /> : <Search size={17} />}
              </button>

              {searchOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 46,
                  width: 340, background: '#FFFFFF',
                  border: '1px solid #E8E3DA',
                  borderRadius: 12,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  overflow: 'hidden', zIndex: 500,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    borderBottom: '1px solid #F0EBE3',
                  }}>
                    <Search size={14} color="#FF6A00" />
                    <input
                      autoFocus
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Məhsul axtar..."
                      style={{
                        flex: 1, border: 'none', outline: 'none',
                        fontSize: 14, color: '#111111',
                        fontFamily: "'Inter', sans-serif",
                        background: 'transparent',
                      }}
                    />
                    {query && (
                      <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  {results.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 320, overflowY: 'auto' as const }}>
                      {results.map(p => (
                        <li key={p.id}>
                          <button onClick={() => { onViewProduct?.(p); setSearchOpen(false); setQuery(''); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 16px', background: 'none', border: 'none',
                              cursor: 'pointer', textAlign: 'left' as const, transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F5F2EC'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            {p.variants?.[0]?.images?.[0] && (
                              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F5F2EC', flexShrink: 0 }}>
                                <img src={p.variants[0].images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111111', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#FF6A00', fontWeight: 700 }}>
                                {(p.variants[0]?.discountPrice || p.variants[0]?.price || 0).toFixed(0)} ₼
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim().length > 1 ? (
                    <div style={{ padding: '24px', textAlign: 'center' as const, color: '#999', fontSize: 13 }}>Nəticə tapılmadı</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={onCartClick} style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              width: 38, height: 38, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#444444', transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F5F2EC'; e.currentTarget.style.color = '#111111'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#444444'; }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 5, right: 5,
                  background: '#FF6A00', color: '#FFFFFF',
                  fontSize: 9, fontWeight: 800,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Inter', sans-serif",
                }}>{cartCount}</span>
              )}
            </button>

            {/* WhatsApp CTA - desktop */}
            <a href="https://wa.me/994519831483" target="_blank" rel="noreferrer"
              className="r-desktop-nav"
              style={{
                marginLeft: 8,
                padding: '8px 20px',
                background: '#FF6A00',
                color: '#FFFFFF',
                borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif",
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'background 0.15s, transform 0.15s',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E55E00'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FF6A00'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              💬 Sifariş et
            </a>

            {/* Mobile menu btn */}
            <button
              className="r-mobile-nav"
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 38, height: 38, borderRadius: 8,
                display: 'none', alignItems: 'center', justifyContent: 'center',
                color: '#111111',
              }}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid #F0EBE3',
            padding: '8px 16px 20px',
          }}>
            {NAV_LINKS.map((link, i) => (
              <button key={link.label} onClick={() => { actions[i](); setMenuOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '13px 8px', textAlign: 'left' as const, display: 'block',
                  fontSize: 15, fontWeight: 500, color: '#111111',
                  fontFamily: "'Inter', sans-serif",
                  borderBottom: '1px solid #F5F2EC',
                }}
              >{link.label}</button>
            ))}
            <a href="https://wa.me/994519831483" target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 16, padding: '14px',
                background: '#FF6A00', color: '#FFFFFF',
                borderRadius: 10, textDecoration: 'none',
                fontSize: 15, fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
              }}
            >💬 WhatsApp ilə sifariş et</a>
          </div>
        )}
      </nav>

      <div style={{ height: 38 + 60 }} />

      <style>{`
        @media (max-width: 768px) {
          .r-desktop-nav { display: none !important; }
          .r-mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;