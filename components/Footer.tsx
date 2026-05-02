import React from 'react';
import { C, F } from '../tokens';
import { Instagram, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onReviewsClick?: () => void;
  onProductsClick?: () => void;
  onDeliveryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);

const Footer: React.FC<FooterProps> = ({ onReviewsClick, onProductsClick, onDeliveryClick, onAboutClick, onContactClick }) => {
  return (
    <footer style={{ background: C.black, color: C.white, padding: 'clamp(48px,6vw,72px) clamp(16px,3vw,32px) 32px', fontFamily: F.sans }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="ravio-footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <img
                src="/og-ravio.png"
                alt="Ravio"
                style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover' }}
              />
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, margin: '0 0 24px', maxWidth: 220 }}>
              Lazer yazı, fərdi təsbeh, polad qolbaq. Hər məhsul yalnız sənin üçün hazırlanır.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { href: 'https://instagram.com/ravio.az', icon: <Instagram size={15} /> },
                { href: 'https://tiktok.com/@ravio.az', icon: <TikTokIcon /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 20px' }}>
              Keçidlər
            </h4>
            {[
              { label: 'Məhsullar',       action: onProductsClick },
              { label: 'Çatdırılma',      action: onDeliveryClick },
              { label: 'Müştəri rəyləri', action: onReviewsClick },
              { label: 'Haqqımızda',      action: onAboutClick },
            ].map((link, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <button onClick={link.action} style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'rgba(255,255,255,0.4)', fontSize: 14,
                  cursor: 'pointer', fontFamily: F.sans,
                  fontWeight: 400, display: 'block', textAlign: 'left' as const, transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.white}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >{link.label}</button>
              </div>
            ))}
          </div>

          {/* Delivery info summary */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 20px' }}>
              Çatdırılma
            </h4>
            {[
              { icon: '🚇', text: 'Metrodaxili — ödənişsiz' },
              { icon: '🛵', text: 'Kuryer (Bakı,Sumqayıt,Abşeron) — 4.99 ₼' },
              { icon: '📮', text: 'Bölgələrə çatdırılma poçt vasitəsilə — 4.99 ₼' },
              { icon: '⚡', text: '1–3 iş günündə hazır' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 20px' }}>
              Əlaqə
            </h4>
            {[
              { icon: <Phone size={13} />, text: '+994 51 983 14 83' },
              { icon: <MapPin size={13} />, text: 'Bakı, Azərbaycan' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <span style={{ color: C.primary, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{item.text}</span>
              </div>
            ))}
            <button onClick={onContactClick} style={{
              marginTop: 8, padding: '10px 20px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 13,
              cursor: 'pointer', fontFamily: F.sans,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >Əlaqə səhifəsi →</button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2026 Ravio. Bütün hüquqlar qorunur.</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: 2, textTransform: 'uppercase' as const }}>@ravio.az</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;