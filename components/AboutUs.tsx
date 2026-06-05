import React from 'react';
import { F } from '../tokens';
import { Helmet } from 'react-helmet-async';

const FONT = F.sans;
const C = {
  black: 'var(--clr-black)', gray: '#555555', grayLt: 'var(--clr-text-muted)',
  orange: 'var(--clr-primary)', bg: 'var(--clr-bg)', border: 'var(--clr-border)', white: 'var(--clr-white)',
};

const AboutUs: React.FC = () => {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px', fontFamily: FONT }}>
      <Helmet>
        <title>Haqqımızda | Ravio</title>
        <meta name="description" content="Ravio — Bakıda fərdi hədiyyələr hazırlayan onlayn mağaza. Lazer yazısı, özəl qablaşdırma, sürətli çatdırılma. Hər məhsul sizin üçün xüsusi hazırlanır." />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Haqqımızda | Ravio" />
        <meta property="og:description" content="Ravio — Bakıda fərdi hədiyyələr hazırlayan onlayn mağaza. Hər məhsul sizin üçün xüsusi hazırlanır." />
        <meta property="og:url"         content="https://ravio.az/haqqimizda" />
        <meta property="og:image"       content="https://ravio.az/og-ravio.png" />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical" href="https://ravio.az/haqqimizda" />
      </Helmet>

      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
        Haqqımızda
      </p>
      <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: C.black, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        Hər hədiyyəyə xüsusi toxunuş
      </h1>
      <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.75, margin: '0 0 48px', maxWidth: 580 }}>
        Ravio — Bakıda fəaliyyət göstərən fərdiləşdirilmiş aksessuar və hədiyyə brendidir.
        Hər məhsul sifariş əsasında hazırlanır, hər yazı müştərinin istəyinə görə lazerləyirik.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { icon: '⚡', title: 'Lazer texnologiyası', desc: 'Mikron dəqiqliyi ilə lazer yazı — hər simvol mükəmməl.' },
          { icon: '🎁', title: 'Tam fərdiləşdirmə',   desc: 'Ad, tarix, mesaj — istəyinizə görə hər şey.' },
          { icon: '✓', title: 'Keyfiyyət zəmanəti',   desc: 'Hər məhsul göndərilməzdən əvvəl yoxlanılır.' },
          { icon: '🚀', title: 'Sürətli hazırlıq',    desc: '1–3 günə hazır, ödənişsiz çatdırılma.' },
        ].map(card => (
          <div key={card.title} style={{
            background: C.white, borderRadius: 12,
            padding: '24px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.black, margin: '0 0 8px' }}>{card.title}</h3>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutUs;