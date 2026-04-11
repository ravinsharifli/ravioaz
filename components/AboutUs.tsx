import React from 'react';
 
const FONT = "'Inter', sans-serif";
const C = { black: '#111111', gray: '#555555', grayLt: '#AAAAAA', orange: '#FF6A00', bg: '#F5F2EC', border: '#EDEBE7', white: '#FFFFFF' };
 
const Section: React.FC<{ label: string; title: string; sub?: string; children?: React.ReactNode }> = ({ label, title, sub, children }) => (
  <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px', fontFamily: FONT }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>{label}</p>
    <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: C.black, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>{title}</h1>
    {sub && <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.75, margin: '0 0 48px', maxWidth: 580 }}>{sub}</p>}
    {children}
  </div>
);
 
export const AboutUs: React.FC = () => (
  <Section
    label="Haqqımızda"
    title="Hər hədiyyəyə xüsusi toxunuş"
    sub="Ravio — Bakıda fəaliyyət göstərən fərdiləşdirilmiş aksessuar və hədiyyə brendidir. Hər məhsul sifariş əsasında hazırlanır, hər yazı müştərinin istəyinə görə lazerləyirik."
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {[
        { icon: '⚡', title: 'Lazer texnologiyası', desc: 'Mikron dəqiqliyi ilə lazer yazı — hər simvol mükəmməl.' },
        { icon: '🎁', title: 'Tam fərdiləşdirmə', desc: 'Ad, tarix, mesaj — istəyinizə görə hər şey.' },
        { icon: '✓', title: 'Keyfiyyət zəmanəti', desc: 'Hər məhsul göndərilməzdən əvvəl yoxlanılır.' },
        { icon: '🚀', title: 'Sürətli hazırlıq', desc: '1–3 iş günündə hazır, ödənişsiz çatdırılma.' },
      ].map(card => (
        <div key={card.title} style={{
          background: C.white, borderRadius: 12, padding: '24px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.black, margin: '0 0 8px' }}>{card.title}</h3>
          <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);