import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onReviewsClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onReviewsClick }) => {
  return (
    <footer style={{
      background: '#111111',
      color: '#FFFFFF',
      padding: '72px 32px 32px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 64,
        }}>
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 30, height: 30,
                background: '#FF6A00',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 800 }}>R</span>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px' }}>ravio</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, margin: '0 0 24px', maxWidth: 220 }}>
              Lazer yazı, fərdi təsbeh, polad qolbaq. Hər hədiyyə yalnız sənin üçün hazırlanır.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { href: 'https://instagram.com/ravio.az', icon: <Instagram size={16} /> },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer"
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6A00'; e.currentTarget.style.color = '#FF6A00'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 20px' }}>
              Keçidlər
            </h4>
            {[
              { label: 'Məhsullar', href: '#products' },
              { label: 'Müştəri rəyləri', action: onReviewsClick },
              { label: 'WhatsApp sifariş', href: 'https://wa.me/994519831483' },
            ].map((link, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                {link.href ? (
                  <a href={link.href} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none', fontWeight: 400, transition: 'color 0.15s', display: 'block' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >{link.label}</a>
                ) : (
                  <button onClick={link.action} style={{
                    background: 'none', border: 'none', padding: 0,
                    color: 'rgba(255,255,255,0.4)', fontSize: 14,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    fontWeight: 400, transition: 'color 0.15s', display: 'block',
                    textAlign: 'left' as const,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >{link.label}</button>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 20px' }}>
              Əlaqə
            </h4>
            {[
              { icon: <Phone size={13} />, text: '+994 51 983 14 83' },
              { icon: <Mail size={13} />, text: 'info@ravio.az' },
              { icon: <MapPin size={13} />, text: 'Bakı, Azərbaycan' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                <span style={{ color: '#FF6A00', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap' as const, gap: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>
            © 2025 Ravio. Bütün hüquqlar qorunur.
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: 2, textTransform: 'uppercase' as const }}>
            @ravio.az
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;