import React from 'react';
import { ArrowRight, Sparkles, Gift, GraduationCap } from 'lucide-react';

const PromoBanners: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* MAIN HERO BANNER */}
      <div style={{
        background: '#1C1714',
        borderRadius: 20,
        padding: 'clamp(28px,5vw,48px)',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 24,
        alignItems: 'center',
      }}>
        {/* Background pattern */}
        <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', opacity: 0.04, pointerEvents: 'none' }} viewBox="0 0 400 300" fill="none">
          <circle cx="350" cy="150" r="180" stroke="#BF912E" strokeWidth="1" />
          <circle cx="350" cy="150" r="120" stroke="#BF912E" strokeWidth="1" />
          <circle cx="350" cy="150" r="60" stroke="#BF912E" strokeWidth="1" />
        </svg>
        <svg style={{ position: 'absolute', left: -40, bottom: -40, opacity: 0.04, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" stroke="#BF912E" strokeWidth="1" fill="none" />
          <circle cx="100" cy="100" r="50" stroke="#BF912E" strokeWidth="1" fill="none" />
        </svg>

        {/* Left content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(191,145,46,0.15)',
            border: '1px solid rgba(191,145,46,0.3)',
            borderRadius: 999, padding: '5px 12px',
            marginBottom: 16,
          }}>
            <Sparkles size={10} color="#BF912E" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: '#BF912E', fontFamily: "'Inter', sans-serif" }}>
              Fərdiləşdirilmiş hədiyyə
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(22px,4vw,38px)',
            fontWeight: 700, color: '#FAF8F4',
            margin: '0 0 10px', lineHeight: 1.15, letterSpacing: '-0.2px',
          }}>
            Hər məhsula sənin adın,<br />
            <span style={{ color: '#BF912E' }}>lazer dəqiqliyi ilə.</span>
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(250,248,244,0.6)', margin: '0 0 22px', lineHeight: 1.65, maxWidth: 440, fontWeight: 400 }}>
            Bijuteriya, giftbox, məzun lenti — hamısı üzərinə istədiyin yazı yazılır.
            Sifariş verəndə mətni yazırsan, biz hazırlayırıq.
          </p>

          <a href="#mehsullar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#BF912E', color: '#1C1714',
            padding: '11px 22px', borderRadius: 10,
            fontWeight: 800, fontSize: 13,
            textDecoration: 'none', letterSpacing: '0.3px',
            fontFamily: "'Inter', sans-serif",
          }}>
            Məhsullara bax <ArrowRight size={14} />
          </a>
        </div>

        {/* Right: stat pills — mobilda gizlənir */}
        <div className="promo-stats" style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column' as const,
          gap: 10, minWidth: 110,
        }}>
          {[
            { n: '500+', l: 'Sifariş' },
            { n: '4.9★', l: 'Reytinq' },
            { n: '1–2g', l: 'Hazırlıq' },
          ].map(item => (
            <div key={item.n} style={{
              background: 'rgba(250,248,244,0.06)',
              border: '1px solid rgba(191,145,46,0.2)',
              borderRadius: 12, padding: '12px 16px',
              textAlign: 'center' as const,
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#BF912E', lineHeight: 1 }}>{item.n}</div>
              <div style={{ fontSize: 10, color: 'rgba(250,248,244,0.4)', marginTop: 3, fontWeight: 600 }}>{item.l}</div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 560px) {
            .promo-stats { display: none !important; }
          }
        `}</style>
      </div>

      {/* TWO SMALL BANNERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Gift boxes banner */}
        <div style={{
          background: '#F2EDE5',
          border: '1px solid #E8E2D9',
          borderRadius: 16, padding: 'clamp(16px,3vw,28px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -12, bottom: -12,
            width: 90, height: 90, borderRadius: '50%',
            background: 'rgba(191,145,46,0.08)', pointerEvents: 'none',
          }} />
          <Gift size={22} color="#BF912E" style={{ marginBottom: 10 }} />
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(14px,2.5vw,20px)', fontWeight: 700,
            color: '#1C1714', margin: '0 0 6px',
          }}>
            Premium Giftbox
          </h3>
          <p style={{ fontSize: 'clamp(11px,1.5vw,12px)', color: '#8C7F77', margin: '0 0 12px', lineHeight: 1.5, fontWeight: 400 }}>
            Pulqabı, saat, alışqan, kəmər — istədiyin hər şeyi bir qutuda yığırıq.
          </p>
          <a href="#mehsullar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 800, color: '#BF912E',
            textDecoration: 'none',
          }}>
            Kəşf et <ArrowRight size={12} />
          </a>
        </div>

        {/* Mezun lentleri banner */}
        <div style={{
          background: '#1C1714',
          borderRadius: 16, padding: 'clamp(16px,3vw,28px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -15, top: -15,
            width: 100, height: 100, borderRadius: '50%',
            background: 'rgba(191,145,46,0.08)', pointerEvents: 'none',
          }} />
          <GraduationCap size={22} color="#BF912E" style={{ marginBottom: 10 }} />
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(14px,2.5vw,20px)', fontWeight: 700,
            color: '#FAF8F4', margin: '0 0 6px',
          }}>
            Məzun Lentləri
          </h3>
          <p style={{ fontSize: 'clamp(11px,1.5vw,12px)', color: 'rgba(250,248,244,0.55)', margin: '0 0 12px', lineHeight: 1.5, fontWeight: 400 }}>
            10+ ədəddə endirim tətbiq olunur.{' '}
            <span style={{ color: '#BF912E', fontWeight: 700 }}>Xüsusi endirimlə.</span>
          </p>
          <a href="#mehsullar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 800, color: '#BF912E',
            textDecoration: 'none',
          }}>
            Qiymətlərə bax <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PromoBanners;