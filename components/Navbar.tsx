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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];

  const navLinks = [
    { label: 'Məhsullar', action: onLogoClick },
    { label: 'Çatdırılma', action: onDeliveryClick },
    { label: 'Haqqımızda', action: onAboutClick },
    { label: 'Əlaqə', action: onContactClick },
  ];

  const iconBtn = (onClick: () => void, children: React.ReactNode) => (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      width: 40, height: 40, borderRadius: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: scrolled ? '#1B2A4A' : '#F5F0E8',
      transition: 'color 0.2s, background 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.color = '#B8952A'}
      onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#1B2A4A' : '#F5F0E8'}
    >{children}</button>
  );

  return (
    <>
      {/* Top announcement bar */}
      <div style={{
        background: '#1B2A4A',
        padding: '9px 0',
        textAlign: 'center' as const,
        fontSize: 10,
        letterSpacing: 3,
        fontWeight: 600,
        color: '#B8952A',
        fontFamily: "'Jost', sans-serif",
        textTransform: 'uppercase' as const,
      }}>
        Bakı daxili çatdırılma 4.99₼ · Lazer yazı · Özəl hədiyyələr
      </div>

      {/* Main navbar */}
      <nav style={{
        position: 'fixed',
        top: 36,
        left: 0, right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(245,240,232,0.97)' : 'rgba(27,42,74,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(27,42,74,0.1)' : '1px solid rgba(245,240,232,0.08)',
        transition: 'all 0.4s ease',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 48px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}>
          {/* Logo */}
          <button onClick={onLogoClick} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 2,
              background: '#B8952A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 15, fontWeight: 700,
                color: '#F5F0E8', lineHeight: 1,
              }}>R</span>
            </div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700,
              color: scrolled ? '#1B2A4A' : '#F5F0E8',
              letterSpacing: '-0.3px',
              transition: 'color 0.4s',
            }}>
              ravio
            </span>
          </button>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
            {navLinks.map(link => (
              <button key={link.label} onClick={link.action} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 18px', borderRadius: 2,
                fontSize: 11, fontWeight: 500,
                letterSpacing: 1.5,
                textTransform: 'uppercase' as const,
                color: scrolled ? '#4A5568' : 'rgba(245,240,232,0.75)',
                fontFamily: "'Jost', sans-serif",
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#B8952A'}
                onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#4A5568' : 'rgba(245,240,232,0.75)'}
              >{link.label}</button>
            ))}
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              {iconBtn(() => { setSearchOpen(v => !v); setQuery(''); }, searchOpen ? <X size={17} /> : <Search size={17} />)}

              {searchOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 52,
                  width: 320, background: '#FFFFFF',
                  borderRadius: 2,
                  boxShadow: '0 20px 60px rgba(27,42,74,0.15)',
                  border: '1px solid rgba(27,42,74,0.08)',
                  overflow: 'hidden', zIndex: 200,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 18px',
                    borderBottom: '1px solid #F0EBE2',
                  }}>
                    <Search size={14} color="#B8952A" />
                    <input
                      autoFocus
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Məhsul axtar..."
                      style={{
                        flex: 1, outline: 'none', border: 'none',
                        background: 'transparent', fontSize: 13,
                        color: '#1B2A4A', fontFamily: "'Jost', sans-serif",
                        fontWeight: 400,
                      }}
                    />
                    {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7F72', padding: 0 }}><X size={13} /></button>}
                  </div>
                  {results.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 300, overflowY: 'auto' as const }}>
                      {results.map(p => (
                        <li key={p.id}>
                          <button
                            onClick={() => { onViewProduct?.(p); setSearchOpen(false); setQuery(''); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 18px', background: 'none', border: 'none',
                              cursor: 'pointer', textAlign: 'left' as const,
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F8F4EE'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            {p.variants?.[0]?.images?.[0] && (
                              <div style={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', flexShrink: 0, background: '#F0EBE2' }}>
                                <img src={p.variants[0].images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                            )}
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1B2A4A', fontFamily: "'Jost', sans-serif" }}>{p.name}</p>
                              <p style={{ margin: 0, fontSize: 12, color: '#B8952A', fontWeight: 400 }}>
                                {(p.variants[0]?.discountPrice || p.variants[0]?.price || 0).toFixed(0)} ₼
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim().length > 1 ? (
                    <div style={{ padding: '24px', textAlign: 'center' as const, color: '#8A7F72', fontSize: 13 }}>Nəticə tapılmadı</div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={onCartClick} style={{
              position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
              width: 40, height: 40, borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: scrolled ? '#1B2A4A' : '#F5F0E8',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#B8952A'}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? '#1B2A4A' : '#F5F0E8'}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 7, right: 7,
                  background: '#B8952A', color: '#F5F0E8',
                  fontSize: 8, fontWeight: 700,
                  width: 14, height: 14, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount}</span>
              )}
            </button>

            {/* Mobile menu btn */}
            <button
              className="mobile-btn"
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 40, height: 40, borderRadius: 2,
                display: 'none', alignItems: 'center', justifyContent: 'center',
                color: scrolled ? '#1B2A4A' : '#F5F0E8',
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: '#F5F0E8',
            borderTop: '1px solid rgba(27,42,74,0.08)',
            padding: '16px 24px 24px',
          }}>
            {navLinks.map(link => (
              <button key={link.label} onClick={() => { link.action(); setMenuOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 0', textAlign: 'left' as const,
                  fontSize: 12, fontWeight: 600, letterSpacing: 2,
                  textTransform: 'uppercase' as const,
                  color: '#1B2A4A', fontFamily: "'Jost', sans-serif",
                  borderBottom: '1px solid rgba(27,42,74,0.06)',
                  display: 'block',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#B8952A'}
                onMouseLeave={e => e.currentTarget.style.color = '#1B2A4A'}
              >{link.label}</button>
            ))}
            <a
              href="https://wa.me/994519831483"
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 20, padding: '14px',
                background: '#1B2A4A', color: '#B8952A',
                borderRadius: 3, textDecoration: 'none',
                fontSize: 11, fontWeight: 600, letterSpacing: 2,
                textTransform: 'uppercase' as const,
                fontFamily: "'Jost', sans-serif",
              }}
            >WhatsApp ilə sifariş</a>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 36 + 64 }} />
    </>
  );
};

export default Navbar;