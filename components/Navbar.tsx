import React, { useState, useEffect } from 'react';
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

const Navbar: React.FC<NavbarProps> = ({
  cartCount, onLogoClick, onCartClick,
  onAboutClick, onContactClick, onDeliveryClick,
  products = [], onViewProduct,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const navLinks = [
    { label: 'Məhsullar', action: onLogoClick },
    { label: 'Çatdırılma', action: onDeliveryClick },
    { label: 'Haqqımızda', action: onAboutClick },
    { label: 'Əlaqə', action: onContactClick },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div style={{
        background: '#1A1714',
        color: '#C9A84C',
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: 3,
        fontWeight: 500,
        padding: '9px 0',
        fontFamily: "'DM Sans', sans-serif",
        textTransform: 'uppercase',
      }}>
        Bakı daxili çatdırılma · Lazer yazı · Özəl hədiyyələr
      </div>

      {/* Main nav */}
      <nav style={{
        position: 'fixed',
        top: 33,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(250,247,242,0.97)' : 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${scrolled ? '#E8E2D9' : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

          {/* Logo */}
          <button onClick={onLogoClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 26,
              fontWeight: 600,
              color: '#1A1714',
              letterSpacing: '-0.5px',
            }}>
              ravio<span style={{ color: '#C9A84C' }}>.</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', gap: 2 }} className="desktop-nav">
            {navLinks.map(link => (
              <button key={link.label} onClick={link.action} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px', borderRadius: 8,
                fontSize: 13, color: '#4A3F38',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, letterSpacing: '0.3px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4A3F38')}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setSearchOpen(v => !v); setQuery(''); }} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4A3F38', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F2EDE5'; e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#4A3F38'; }}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 48,
                  width: 300, background: '#fff',
                  borderRadius: 16, boxShadow: '0 16px 48px rgba(28,23,20,0.12)',
                  border: '1px solid #E8E2D9', overflow: 'hidden', zIndex: 200,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #F2EDE5' }}>
                    <Search size={14} color="#C9A84C" />
                    <input
                      autoFocus
                      type="text" value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Məhsul axtar..."
                      style={{
                        flex: 1, outline: 'none', border: 'none', background: 'transparent',
                        fontSize: 13, color: '#1A1714',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  </div>
                  {results.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0' }}>
                      {results.map(p => (
                        <li key={p.id}>
                          <button onClick={() => { onViewProduct?.(p); setSearchOpen(false); setQuery(''); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 16px', background: 'none', border: 'none',
                              cursor: 'pointer', textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FAF7F2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            {p.variants?.[0]?.images?.[0] && (
                              <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#F2EDE5' }}>
                                <img src={p.variants[0].images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                            )}
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1A1714', fontFamily: "'DM Sans', sans-serif" }}>{p.name}</p>
                              <p style={{ margin: 0, fontSize: 12, color: '#C9A84C' }}>
                                {(p.variants[0].discountPrice || p.variants[0].price).toFixed(0)} AZN
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim().length > 1 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#8C7F77', fontSize: 13 }}>Nəticə tapılmadı</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={onCartClick} style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              width: 40, height: 40, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4A3F38', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F2EDE5'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#4A3F38'; }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  background: '#C9A84C', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  width: 14, height: 14, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="mobile-menu-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 10,
                display: 'none', alignItems: 'center', justifyContent: 'center',
                color: '#4A3F38',
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: '#FAF7F2',
            borderTop: '1px solid #E8E2D9',
            padding: '12px 24px 20px',
          }}>
            {navLinks.map(link => (
              <button key={link.label} onClick={() => { link.action(); setMenuOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '12px 0', textAlign: 'left', display: 'block',
                  fontSize: 15, fontWeight: 500, color: '#1A1714',
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottom: '1px solid #F2EDE5',
                }}
              >
                {link.label}
              </button>
            ))}
            <a href="https://wa.me/994519831483" target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 16, padding: '14px', borderRadius: 12,
                background: '#1A1714', color: '#C9A84C',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px',
              }}
            >
              WhatsApp ilə sifariş et
            </a>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 33 + 60 }} />

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;