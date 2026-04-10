import React from 'react';
import { Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onReviewsClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onReviewsClick }) => {
  return (
    <footer style={{ background: '#1A1714', color: '#FAF7F2', padding: '72px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48, marginBottom: 64,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 28, fontWeight: 600,
              color: '#FAF7F2', marginBottom: 16,
              letterSpacing: '-0.5px',
            }}>
              ravio<span style={{ color: '#C9A84C' }}>.</span>
            </div>
            <p style={{
              fontSize: 13, color: 'rgba(250,247,242,0.4)',
              lineHeight: 1.7, margin: '0 0 24px',
              fontWeight: 300, maxWidth: 220,
            }}>
              Lazer yazı, fərdi təsbeh, polad qolbaq. Yalnız sənin üçün.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { href: 'https://instagram.com/ravio.az', icon: <Instagram size={16} />, label: 'Instagram' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: 10,
                    border: '1px solid rgba(250,247,242,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(250,247,242,0.5)', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(250,247,242,0.1)'; e.currentTarget.style.color = 'rgba(250,247,242,0.5)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 500, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 20px' }}>
              Keçidlər
            </h4>
            {[
              { label: 'Məhsullar', href: '#products' },
              { label: 'Müştəri rəyləri', action: onReviewsClick },
              { label: 'WhatsApp ilə sifariş', href: 'https://wa.me/994519831483' },
            ].map(link => (
              <div key={link.label} style={{ marginBottom: 12 }}>
                {link.href ? (
                  <a href={link.href} style={{ color: 'rgba(250,247,242,0.45)', fontSize: 13, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FAF7F2'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,242,0.45)'}
                  >{link.label}</a>
                ) : (
                  <button onClick={link.action} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(250,247,242,0.45)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 300, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FAF7F2'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(250,247,242,0.45)'}
                  >{link.label}</button>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 500, color: '#C9A84C', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 20px' }}>
              Əlaqə
            </h4>
            {[
              { icon: <Phone size={13} />, text: '+994 51 983 14 83' },
              { icon: <Mail size={13} />, text: 'info@ravio.az' },
              { icon: <MapPin size={13} />, text: 'Bakı, Azərbaycan' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ color: '#C9A84C', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(250,247,242,0.45)', fontWeight: 300 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(250,247,242,0.06)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(250,247,242,0.25)', fontWeight: 300 }}>
            © 2025 Ravio. Bütün hüquqlar qorunur.
          </span>
          <span style={{ fontSize: 11, color: 'rgba(250,247,242,0.2)', letterSpacing: 2, textTransform: 'uppercase' }}>
            @ravio.az
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;