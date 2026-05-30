import React from 'react';
import { C, F } from '../tokens';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  photoUrl?: string;
  productUrl?: string;
  isActive?: boolean;
}

const FONT = F.sans;

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={12} color={C.primary} fill={i <= n ? C.primary : 'none'} />
    ))}
  </div>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

// Fallback — Sanity boş olsa bunlar göstərilir
const FALLBACK: Review[] = [
  { name: 'Aytən M.', rating: 5, text: 'Sevgilimin adını qolbağa yazdırdım. Lazer yazısı çox dəqiq çıxdı, paketləmə də gözəl idi.', date: 'Mart 2026' },
  { name: 'Rauf H.',  rating: 5, text: 'Məzun lentlərini sinif üçün 35 ədəd aldım. Qiymət əlverişli, hamısı eyni keyfiyyətdə gəldi.', date: 'İyun 2026' },
  { name: 'Günel Ə.', rating: 5, text: 'Anama ad günü üçün giftbox aldım. Üzərinə "Ən sevimli anam" yazdırdım. Çox xoş gəldi.', date: 'Fevral 2026' },
  { name: 'Tural B.', rating: 5, text: 'Gümüş təsbeh aldım, üzərinə ayə yazdırdım. İşçilik çox yaxşı. Dostlara tövsiyə etdim.', date: 'Yanvar 2026' },
  { name: 'Lalə K.',  rating: 5, text: 'Cüt qolbaq sifarişi verdim. 1 gündə hazır oldu, möhtəşəm çıxdı!', date: 'Aprel 2026' },
];

interface Props {
  reviews?: Review[];
}

const CustomerReviews: React.FC<Props> = ({ reviews: propReviews }) => {
  const navigate = useNavigate();

  const reviews = (propReviews && propReviews.length > 0)
    ? propReviews.filter(r => r.isActive !== false)
    : FALLBACK;

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(16px,3vw,32px)', fontFamily: FONT }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: 16, marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
            Müştəri rəyləri
          </p>
          <h2 style={{ fontSize: 'clamp(20px,4vw,32px)', fontWeight: 800, color: C.black, margin: 0, letterSpacing: '-0.3px' }}>
            Real sifarişlər, real rəylər
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: C.black, letterSpacing: '-1px' }}>4.9</span>
          <div>
            <Stars n={5} />
            <p style={{ fontSize: 11, color: C.textMuted, margin: '4px 0 0', fontWeight: 500 }}>500+ sifarişdən</p>
          </div>
        </div>
      </div>

      {/* Review cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
        marginBottom: 48,
      }}>
        {reviews.map((r, idx) => (
          <div
            key={idx}
            onClick={() => r.productUrl && navigate(`/mehsullar/${r.productUrl}`)}
            style={{
              background: C.white, borderRadius: 12,
              border: '1px solid #EDEBE7',
              display: 'flex', flexDirection: 'column' as const,
              overflow: 'hidden',
              cursor: r.productUrl ? 'pointer' : 'default',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              if (r.productUrl) {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.10)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Məhsul şəkli — yuxarıda, kiçik */}
            {r.photoUrl && (
              <div style={{ position: 'relative', width: '100%', height: 140, overflow: 'hidden', background: C.bg }}>
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
                {r.productUrl && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: C.primary, color: '#fff',
                    fontSize: 10, fontWeight: 700, fontFamily: FONT,
                    padding: '3px 8px', borderRadius: 6,
                  }}>
                    Məhsula bax →
                  </div>
                )}
              </div>
            )}

            {/* Rəy məzmunu */}
            <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column' as const, gap: 8, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: C.black, color: C.white,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{getInitials(r.name)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.black }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{r.date}</div>
                  </div>
                </div>
                <Stars n={r.rating} />
              </div>

              <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, margin: 0, flex: 1 }}>{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Social CTA */}
      <div style={{
        background: C.black, borderRadius: 16,
        padding: 'clamp(20px,4vw,40px) clamp(16px,4vw,48px)',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap' as const, gap: 16,
      }}>
        <div>
          <h3 style={{ fontSize: 'clamp(15px,3vw,22px)', fontWeight: 800, color: C.white, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Siz də rəy bildirin
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Sosial şəbəkədə <strong style={{ color: C.primary }}>@ravio.az</strong> tag edin
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="https://instagram.com/ravio.az" target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: C.white, textDecoration: 'none',
              fontSize: 13, fontWeight: 600, fontFamily: FONT,
            }}
          >
            <InstagramIcon /> Instagram
          </a>
          <a href="https://tiktok.com/@ravio.az" target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: C.white, textDecoration: 'none',
              fontSize: 13, fontWeight: 600, fontFamily: FONT,
            }}
          >
            <TikTokIcon /> TikTok
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;