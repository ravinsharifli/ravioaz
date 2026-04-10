import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onReviewsClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onReviewsClick }) => {
  return (
    <footer style={{
      background: '#1B2A4A',
      padding: '80px 48px 36px',
      fontFamily: "'Jost', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 56,
          marginBottom: 72,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 2,
                background: '#B8952A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 14, fontWeight: 700, color: '#F5F0E8',
                }}>R</span>
              </div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20, fontWeight: 700, color: '#F5F0E8',
                letterSpacing: '-0.3px',
              }}>ravio</span>
            </div>

            <p style={{
              fontSize: 13, fontWeight: 300,
              color: 'rgba(245,240,232,0.4)',
              lineHeight: 1.8, margin: '0 0 28px',
              maxWidth: 220,
            }}>
              Lazer yazı, fərdi təsbeh, polad qolbaq. Hər hədiyyə yalnız sənin üçün hazırlanır.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href="https://instagram.com/ravio.az"
                target="_blank" rel="noreferrer"
                style={{
                  width: 38, height: 38, borderRadius: 2,
                  border: '1px solid rgba(245,240,232,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(245,240,232,0.4)',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8952A'; e.currentTarget.style.color = '#B8952A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.12)'; e.currentTarget.style.color = 'rgba(245,240,232,0.4)'; }}
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://wa.me/994519831483"
                target="_blank" rel="noreferrer"
                style={{
                  width: 38, height: 38, borderRadius: 2,
                  border: '1px solid rgba(245,240,232,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(245,240,232,0.4)',
                  textDecoration: 'none',
                  fontSize: 16, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#B8952A'; e.currentTarget.style.color = '#B8952A'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.12)'; e.currentTarget.style.color = 'rgba(245,240,232,0.4)'; }}
              >
                <span style={{ fontSize: 15 }}>💬</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{
              fontSize: 9, letterSpacing: 3,
              textTransform: 'uppercase' as const,
              color: '#B8952A', fontWeight: 600,
              margin: '0 0 24px',
            }}>Keçidlər</h4>
            {[
              { label: 'Məhsullar', href: '#products' },
              { label: 'Müştəri rəyləri', action: onReviewsClick },
              { label: 'WhatsApp sifariş', href: 'https://wa.me/994519831483' },
            ].map((link, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                {link.href ? (
                  <a href={link.href} style={{
                    color: 'rgba(245,240,232,0.4)', fontSize: 13,
                    textDecoration: 'none', fontWeight: 300,
                    transition: 'color 0.2s',
                    display: 'block',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F5F0E8'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.4)'}
                  >{link.label}</a>
                ) : (
                  <button onClick={link.action} style={{
                    background: 'none', border: 'none', padding: 0,
                    color: 'rgba(245,240,232,0.4)', fontSize: 13,
                    cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                    fontWeight: 300, transition: 'color 0.2s',
                    display: 'block',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#F5F0E8'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(245,240,232,0.4)'}
                  >{link.label}</button>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontSize: 9, letterSpacing: 3,
              textTransform: 'uppercase' as const,
              color: '#B8952A', fontWeight: 600,
              margin: '0 0 24px',
            }}>Əlaqə</h4>
            {[
              { icon: <Phone size={13} />, text: '+994 51 983 14 83' },
              { icon: <Mail size={13} />, text: 'info@ravio.az' },
              { icon: <MapPin size={13} />, text: 'Bakı, Azərbaycan' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
              }}>
                <span style={{ color: '#B8952A', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)', fontWeight: 300 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(245,240,232,0.06)', paddingTop: 28 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap' as const, gap: 12,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.2)', fontWeight: 300 }}>
              © 2025 Ravio. Bütün hüquqlar qorunur.
            </span>
            <span style={{
              fontSize: 9, color: 'rgba(245,240,232,0.15)',
              letterSpacing: 3, textTransform: 'uppercase' as const,
            }}>@ravio.az</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;