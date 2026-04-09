import React from 'react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Aytən M.',
    initials: 'AM',
    rating: 5,
    text: 'Sevgilimin adını qolbağa yazdırdım. Lazer yazısı çox dəqiq çıxdı, sanki fabrikdən çıxmış kimi. Paketləmə də çox gözəl idi, özüm verəydim o cür bağlardım.',
    product: 'Polad qolbaq',
    date: 'Mart 2025',
  },
  {
    name: 'Rauf H.',
    initials: 'RH',
    rating: 5,
    text: 'Məzun lentlərini sinif üçün aldım, 35 ədəd. Qiymət çox əlverişli idi, hamısı eyni keyfiyyətdə gəldi. WhatsAppdan sürətli cavab verdilər.',
    product: 'Məzun lenti (35 ədəd)',
    date: 'İyun 2025',
  },
  {
    name: 'Günel Ə.',
    initials: 'GƏ',
    rating: 5,
    text: 'Anama ad günü üçün giftbox aldım. İçinə saat, kəmər, alışqan yığdılar, üzərinə "Ən sevimli anam" yazdırdım. Anama çox xoş gəldi, ağladı belə.',
    product: 'Premium giftbox',
    date: 'Fevral 2025',
  },
  {
    name: 'Tural B.',
    initials: 'TB',
    rating: 5,
    text: 'Gümüş təsbeh aldım, üzərinə ayə yazdırdım. İşçilik çox yaxşı, gümüş əsl, daşlar real. Dostlara tövsiyə etdim artıq.',
    product: 'Gümüş təsbeh',
    date: 'Yanvar 2025',
  },
  {
    name: 'Lalə K.',
    initials: 'LK',
    rating: 5,
    text: 'Cüt qolbaq sifarişi verdim, öz adımla sevgilimin adını yazdırdım. 1 gündə hazır oldu, kuryer gətirdi. Möhtəşəm çıxdı.',
    product: 'Cüt qolbaq dəsti',
    date: 'Aprel 2025',
  },
];

const T = {
  bg: '#F9F7F4',
  card: '#FFFFFF',
  border: '#E9E5DF',
  text: '#1F1F1F',
  muted: '#8a8078',
  gold: '#C9A227',
  primary: '#2F4F4F',
};

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={13} color="#C9A227" fill={i <= n ? '#C9A227' : 'none'} />
    ))}
  </div>
);

const CustomerReviews: React.FC = () => {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 16px' }}>

      {/* Başlıq */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{
            display: 'inline-block',
            background: '#ECE6DA', color: T.primary,
            borderRadius: 999, padding: '6px 14px',
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            Müştəri rəyləri
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: T.text, margin: 0 }}>
            Real sifarişlər, real rəylər
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: T.gold }}>4.9</span>
          <div>
            <Stars n={5} />
            <p style={{ fontSize: 11, color: T.muted, margin: '3px 0 0' }}>500+ sifarişdən</p>
          </div>
        </div>
      </div>

      {/* Rəy kartları */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {reviews.map((r, i) => (
          <div key={i} style={{
            background: T.card,
            border: `1.5px solid ${T.border}`,
            borderRadius: 20, padding: 24,
            display: 'flex', flexDirection: 'column', gap: 14,
            position: 'relative',
          }}>
            {/* Üst sıra */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#ECE6DA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: T.primary,
                  flexShrink: 0,
                }}>
                  {r.initials}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: T.text, margin: 0 }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{r.product}</p>
                </div>
              </div>
              <Quote size={16} color={T.gold} style={{ opacity: 0.5, flexShrink: 0 }} />
            </div>

            {/* Ulduzlar */}
            <Stars n={r.rating} />

            {/* Rəy mətni */}
            <p style={{
              fontSize: 14, color: '#4a4a4a', lineHeight: 1.7,
              margin: 0, flex: 1,
              fontStyle: 'italic',
            }}>
              "{r.text}"
            </p>

            {/* Tarix */}
            <p style={{ fontSize: 11, color: T.muted, margin: 0, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              {r.date}
            </p>
          </div>
        ))}

        {/* Rəy yaz kartı */}
        <div style={{
          background: T.primary,
          borderRadius: 20, padding: 24,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', gap: 14,
          minHeight: 220,
        }}>
          <div style={{ fontSize: 32 }}>⭐</div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0 }}>
            Siz də rəy bildirin
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
            Sifarişiniz gəldikdən sonra Instagram-da @ravio.az-ı teq edin
          </p>
          <a
            href="https://instagram.com/ravio.az"
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#C9A227', color: '#1F1F1F',
              padding: '11px 22px', borderRadius: 10,
              fontWeight: 700, fontSize: 13, textDecoration: 'none',
            }}
          >
            Instagram-da aç
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;