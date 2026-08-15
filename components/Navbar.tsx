import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import { C, F } from '../tokens';
import { ShoppingBag, Search, X, Menu, Globe } from 'lucide-react';
import { Product } from '../types';
import { toWebP } from '../lib/image';
import { useTranslation } from 'react-i18next';
import { getLangFromPath, withLangPrefix } from '../i18n/useLocalizedNav';

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
  cartCount, onCartClick,
  products = [],
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const otherLang = lang === 'az' ? 'en' : 'az';

  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let raf: number | null = null;
    const fn = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        raf = null;
      });
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => {
      window.removeEventListener('scroll', fn);
      if (raf) cancelAnimationFrame(raf);
    };
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
    { label: t('nav.products'), href: withLangPrefix('/mehsullar', lang) },
    { label: t('nav.delivery'), href: withLangPrefix('/catdirilma', lang) },
    { label: t('nav.about'),    href: withLangPrefix('/haqqimizda', lang) },
    { label: t('nav.contact'),  href: withLangPrefix('/elaqe', lang) },
  ];

  // Cari yolu digər dilə çevirir. Məhsul detalı (/mehsullar/:slug) səhifəsində
  // slug dəyişmir — yalnız /en prefiksi əlavə/silinir.
  const otherLangPath = (() => {
    const stripped = lang === 'en' ? (location.pathname.replace(/^\/en/, '') || '/') : location.pathname;
    return withLangPrefix(stripped, otherLang) + location.search;
  })();

  const NAV_H = 60;

  return (
    <>
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
          <Link to={withLangPrefix('/', lang)} aria-label="Ana səhifəyə qayıt" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}>
            <img
              src="/favicon.png"
              alt="Ravio logo"
              style={{
                width: 38, height: 38, borderRadius: 8,
                objectFit: 'cover', display: 'block',
              }}
            />
            <span className="ravio-nav-brand-text" style={{ fontFamily: F.sans, fontSize: 18, fontWeight: 800, color: C.black, letterSpacing: '-0.5px' }}>
              Sizə Özəl Hədiyyələr
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="r-desktop-nav">
            {navLinks.map(link => (
              <Link key={link.label} to={link.href} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px', fontSize: 13, fontWeight: 500,
                color: '#444444', fontFamily: F.sans,
                borderRadius: 6, transition: 'color 0.15s, background 0.15s',
                textDecoration: 'none', display: 'inline-block',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = C.black; e.currentTarget.style.background = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444444'; e.currentTarget.style.background = 'transparent'; }}
              >{link.label}</Link>
            ))}
          </div>

          {/* Right icons */}
          <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, position: 'relative' }}>
            {/* Language switcher */}
            <Link
              to={otherLangPath}
              aria-label={otherLang === 'en' ? 'Switch to English' : 'Azərbaycan dilinə keç'}
              style={{
                background: 'none', border: '1px solid #E5E1DB', cursor: 'pointer',
                height: 32, borderRadius: 8, padding: '0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                color: '#444444', fontFamily: F.sans, fontSize: 12, fontWeight: 700,
                textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#444444'; e.currentTarget.style.borderColor = '#E5E1DB'; }}
            >
              <Globe size={13} />
              {otherLang === 'en' ? 'EN' : 'AZ'}
            </Link>

            {/* Search button */}
            <button onClick={() => { setSearchOpen(v => !v); setQuery(''); }}
              aria-label={searchOpen ? "Axtarışı bağla" : t('nav.search')}
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
                    placeholder={t('nav.searchPlaceholder')}
                    aria-label={t('nav.searchPlaceholder')}
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
                        <Link
                          to={withLangPrefix(`/mehsullar/${p.slug}`, lang)}
                          onClick={() => { setSearchOpen(false); setQuery(''); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 16px', background: 'none',
                            cursor: 'pointer', textAlign: 'left' as const,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          {p.variants?.[0]?.images?.[0] && (
                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: C.bg, flexShrink: 0 }}>
                              <img
                                src={toWebP(p.variants[0].images[0], 88)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt=""
                                loading="lazy"
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
                            <p style={{ margin: '2px 0 0', fontSize: 13, color: C.primaryText, fontWeight: 700 }}>
                              {(p.variants[0]?.discountPrice ?? p.variants[0]?.price ?? 0).toFixed(2)} ₼
                            </p>
                          </div>
                          <span style={{ color: '#CCCCCC', fontSize: 16, flexShrink: 0 }}>›</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : query.trim().length > 1 ? (
                  <div style={{ padding: '24px', textAlign: 'center' as const, color: '#999', fontSize: 13 }}>
                    🔍 Nəticə tapılmadı
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center' as const, color: '#767676', fontSize: 12 }}>
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
  <div
    onClick={() => setMenuOpen(false)}
    style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.35)',
    }}
  />
)}
        {menuOpen && (
          <div style={{
            background: C.white,
            borderTop: '1px solid #F0EBE2',
            padding: '8px 16px 28px',
            position: 'relative' as const,
            zIndex: 1001,
          }}>
            {navLinks.map(link => (
              <Link key={link.label} to={link.href} onClick={() => setMenuOpen(false)}
                style={{
                  width: '100%', display: 'block',
                  padding: '15px 8px', textAlign: 'left' as const,
                  fontSize: 16, fontWeight: 500, color: C.black,
                  fontFamily: F.sans,
                  borderBottom: '1px solid #F5F2EC',
                  textDecoration: 'none',
                }}
              >{link.label}</Link>
            ))}
            <Link
              to={otherLangPath}
              onClick={() => setMenuOpen(false)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '15px 8px', textAlign: 'left' as const,
                fontSize: 16, fontWeight: 500, color: C.black,
                fontFamily: F.sans,
                borderBottom: '1px solid #F5F2EC',
                textDecoration: 'none',
              }}
            ><Globe size={16} /> {otherLang === 'en' ? 'English' : 'Azərbaycan dili'}</Link>
            <Link
              to={withLangPrefix('/mehsullar', lang)}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 20, padding: '15px', width: '100%',
                background: C.primary, color: C.white,
                borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                fontFamily: F.sans,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >🛍️ Sifarişə başla</Link>
          </div>
        )}
      </nav>

      <div style={{ height: NAV_H }} />
    </>
  );
};

export default Navbar;
