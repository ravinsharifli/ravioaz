import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, X, Menu } from 'lucide-react';
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
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    client.fetch(`*[_type == "siteSettings"][0]{ logo }`)
      .then((data: any) => { if (data?.logo) setLogoUrl(urlFor(data.logo)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = query.trim().length > 1
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const handleSelect = (p: Product) => {
    if (onViewProduct) onViewProduct(p);
    setQuery(''); setSearchOpen(false);
  };

  const navLinks = [
    { label: 'Ana Səhifə', action: onLogoClick },
    { label: 'Haqqımızda', action: onAboutClick },
    { label: 'Çatdırılma', action: onDeliveryClick },
    { label: 'Əlaqə', action: onContactClick },
  ];

  const S = {
    nav: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(250,248,244,0.96)' : 'rgba(250,248,244,0.85)',
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
      borderBottom: scrolled ? '1px solid #E8E2D9' : '1px solid transparent',
      transition: 'all 0.4s ease',
      boxShadow: scrolled ? '0 2px 24px rgba(28,23,20,0.07)' : 'none',
    },
    topBar: {
      background: '#1C1714',
      padding: '7px 0',
      textAlign: 'center' as const,
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: 700,
      color: '#BF912E',
      fontFamily: "'Nunito Sans', sans-serif",
      textTransform: 'uppercase' as const,
    },
  };

  return (
    <>
      {/* Top announcement bar */}
      <div style={S.topBar}>
        ✦ Lazer yazı ilə fərdiləşdirilmiş hədiyyələr &nbsp;·&nbsp; Bakı daxili çatdırılma 4.99 AZN ✦
      </div>

      <nav style={S.nav}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* LOGO */}
          <button
            onClick={onLogoClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10 }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Ravio.az" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#1C1714',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#BF912E', fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, lineHeight: 1 }}>R</span>
                </div>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 700,
                  color: '#1C1714', letterSpacing: '-0.3px',
                }}>
                  ravio<span style={{ color: '#BF912E' }}>.az</span>
                </span>
              </div>
            )}
          </button>

          {/* NAV LINKS — desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map((link) => (
              <button key={link.label} onClick={link.action}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  color: '#4A3F38',
                  fontFamily: "'Nunito Sans', sans-serif",
                  letterSpacing: '0.2px',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLButtonElement).style.color = '#BF912E';
                  (e.target as HTMLButtonElement).style.background = '#FBF4E4';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.color = '#4A3F38';
                  (e.target as HTMLButtonElement).style.background = 'none';
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* RIGHT: Search + Cart + Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setSearchOpen(v => !v); setMenuOpen(false); setQuery(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  width: 38, height: 38, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4A3F38', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = '#F2EDE5'; (e.currentTarget).style.color = '#BF912E'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = '#4A3F38'; }}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 46,
                  width: 320, background: '#fff',
                  borderRadius: 16, boxShadow: '0 12px 40px rgba(28,23,20,0.14)',
                  border: '1px solid #E8E2D9', overflow: 'hidden',
                  zIndex: 200,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #F2EDE5' }}>
                    <Search size={15} color="#BF912E" />
                    <input
                      autoFocus
                      type="text" value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Məhsul axtar..."
                      style={{
                        flex: 1, outline: 'none', border: 'none', background: 'transparent',
                        fontSize: 13, fontWeight: 600, color: '#1C1714',
                        fontFamily: "'Nunito Sans', sans-serif",
                      }}
                    />
                    {query && (
                      <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C7F77', padding: 0 }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {results.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: '8px 0', maxHeight: 280, overflowY: 'auto' }}>
                      {results.map(p => (
                        <li key={p.id}>
                          <button onClick={() => handleSelect(p)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                              padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                              textAlign: 'left', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget).style.background = '#FBF4E4'}
                            onMouseLeave={e => (e.currentTarget).style.background = 'none'}
                          >
                            {p.variants?.[0]?.images?.[0] && (
                              <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F2EDE5' }}>
                                <img src={p.variants[0].images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              </div>
                            )}
                            <div>
                              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1C1714', fontFamily: "'Nunito Sans', sans-serif" }}>{p.name}</p>
                              {p.variants?.[0] && (
                                <p style={{ margin: 0, fontSize: 12, color: '#BF912E', fontWeight: 600 }}>
                                  {(p.variants[0].discountPrice || p.variants[0].price).toFixed(2)} AZN
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : query.trim().length > 1 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8C7F77', fontSize: 13, fontWeight: 600 }}>
                      Nəticə tapılmadı
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              style={{
                position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                width: 38, height: 38, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4A3F38', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = '#F2EDE5'; (e.currentTarget).style.color = '#BF912E'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = '#4A3F38'; }}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: '#BF912E', color: '#fff',
                  fontSize: 9, fontWeight: 900,
                  width: 16, height: 16, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Nunito Sans', sans-serif",
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMenuOpen(v => !v); setSearchOpen(false); }}
              className="md:hidden"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                width: 38, height: 38, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#4A3F38', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = '#F2EDE5'; (e.currentTarget).style.color = '#BF912E'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = '#4A3F38'; }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden" style={{
            background: 'rgba(250,248,244,0.98)',
            borderTop: '1px solid #E8E2D9',
            padding: '12px 20px 20px',
          }}>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { link.action(); setMenuOpen(false); }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '13px 16px', borderRadius: 10, textAlign: 'left',
                  fontSize: 14, fontWeight: 700, color: '#4A3F38',
                  fontFamily: "'Nunito Sans', sans-serif",
                  display: 'block', marginBottom: 2,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = '#FBF4E4'; (e.currentTarget).style.color = '#BF912E'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = '#4A3F38'; }}
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://wa.me/994519831483"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 8, padding: '13px 16px', borderRadius: 12,
                background: '#1C1714', color: '#BF912E',
                fontSize: 14, fontWeight: 800, textDecoration: 'none',
                fontFamily: "'Nunito Sans', sans-serif",
                letterSpacing: '0.3px',
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        )}
      </nav>

      {/* Spacer for announcement bar + navbar */}
      <div style={{ height: 64 + 33 }} />
    </>
  );
};

export default Navbar;