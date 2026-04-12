import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { name: 'Aytən M.', initials: 'AM', rating: 5, text: 'Sevgilimin adını qolbağa yazdırdım. Lazer yazısı çox dəqiq çıxdı, sanki fabrikdən çıxmış kimi. Paketləmə də çox gözəl idi.', product: 'Polad qolbaq', date: 'Mart 2026' },
  { name: 'Rauf H.',  initials: 'RH', rating: 5, text: 'Məzun lentlərini sinif üçün aldım, 35 ədəd. Qiymət çox əlverişli idi, hamısı eyni keyfiyyətdə gəldi. Çatdırılma da vaxtında oldu.', product: 'Məzun lenti', date: 'İyun 2026' },
  { name: 'Günel Ə.', initials: 'GƏ', rating: 5, text: 'Anama ad günü üçün giftbox aldım. Üzərinə "Ən sevimli anam" yazdırdım. Anama çox xoş gəldi, ağladı belə.', product: 'Premium giftbox', date: 'Fevral 2026' },
  { name: 'Tural B.', initials: 'TB', rating: 5, text: 'Gümüş təsbeh aldım, üzərinə ayə yazdırdım. İşçilik çox yaxşı, gümüş əsl, daşlar real. Dostlara tövsiyə etdim.', product: 'Gümüş təsbeh', date: 'Yanvar 2026' },
  { name: 'Lalə K.',  initials: 'LK', rating: 5, text: 'Cüt qolbaq sifarişi verdim, öz adımla sevgilimin adını yazdırdım. 1 gündə hazır oldu. Möhtəşəm çıxdı.', product: 'Cüt qolbaq dəsti', date: 'Aprel 2026' },
];

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} color="#FF6A00" fill={i <= n ? '#FF6A00' : 'none'} />
    ))}
  </div>
);

const CustomerReviews: React.FC = () => {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 32px', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: 16, marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
            Müştəri rəyləri
          </p>
          <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#111111', margin: 0, letterSpacing: '-0.3px' }}>
            Real sifarişlər, real rəylər
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#111111', letterSpacing: '-1px' }}>4.9</span>
          <div>
            <Stars n={5} />
            <p style={{ fontSize: 11, color: '#AAAAAA', margin: '4px 0 0', fontWeight: 500 }}>500+ sifarişdən</p>
          </div>
        </div>
      </div>

      {/* Review cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16, marginBottom: 56,
      }}>
        {reviews.map((r, i) => (
          <div key={i} style={{
            background: '#FFFFFF', borderRadius: 12,
            padding: '20px', border: '1px solid #EDEBE7',
            display: 'flex', flexDirection: 'column' as const, gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#111111', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>{r.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111111' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 2 }}>{r.date}</div>
                </div>
              </div>
              <Stars n={r.rating} />
            </div>

            <p style={{ fontSize: 13, color: '#444444', lineHeight: 1.65, margin: 0 }}>{r.text}</p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#F5F2EC', borderRadius: 6, padding: '5px 10px',
              alignSelf: 'flex-start',
            }}>
              <span style={{ fontSize: 11, color: '#666666', fontWeight: 500 }}>📦 {r.product}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Social CTA — Instagram + TikTok */}
      <div style={{
        background: '#111111', borderRadius: 16,
        padding: 'clamp(32px,4vw,48px) clamp(24px,4vw,48px)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap' as const, gap: 24,
      }}>
        <div>
          <h3 style={{ fontSize: 'clamp(18px,3vw,24px)', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            Siz də rəy bildirin
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 400 }}>
            Sosial şəbəkədə <strong style={{ color: '#FF6A00' }}>@ravio.az</strong> tag edin
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href="https://instagram.com/ravio.az"
            target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF', textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <InstagramIcon />
            Instagram
          </a>

          <a
            href="https://tiktok.com/@ravio.az"
            target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF', textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <TikTokIcon />
            TikTok
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;