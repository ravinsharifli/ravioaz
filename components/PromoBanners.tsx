import React from 'react';
import { Gift, Sparkles, Star } from 'lucide-react';

const PromoBanners: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ANA BANER — Lazer yazı */}
      <div style={{
        background: '#2F4F4F',
        borderRadius: 24,
        padding: '40px 32px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        {/* Sol: mətn */}
        <div style={{ zIndex: 1, maxWidth: 520 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#C9A227', color: '#1F1F1F',
            borderRadius: 999, padding: '5px 14px',
            fontSize: 11, fontWeight: 800,
            letterSpacing: 1.5, textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <Sparkles size={11} />
            Fərdiləşdirilmiş hədiyyə
          </div>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(24px, 4vw, 38px)',
            fontWeight: 800, lineHeight: 1.15, margin: '0 0 12px',
          }}>
            Hər məhsula sənin adın,<br />
            <span style={{ color: '#C9A227' }}>lazer dəqiqliyi ilə.</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)', fontSize: 15,
            lineHeight: 1.7, margin: '0 0 24px',
          }}>
            Bijuteriya, giftbox, məzun lenti — hamısı üzərinə istədiyin yazı yazılır.
            Sifariş verəndə mətni yazırsan, biz hazırlayırıq.
          </p>
          <a
            href="#mehsullar"
            style={{
              display: 'inline-block',
              background: '#C9A227', color: '#1F1F1F',
              padding: '13px 28px', borderRadius: 12,
              fontWeight: 800, fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Məhsullara bax →
          </a>
        </div>

        {/* Sağ: dekor ədədlər */}
        <div style={{
          display: 'flex', gap: 12, zIndex: 1,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { n: '500+', l: 'Sifariş' },
            { n: '4.9★', l: 'Ortalama' },
            { n: '1–2', l: 'Gündə hazır' },
          ].map(item => (
            <div key={item.n} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '16px 20px',
              textAlign: 'center', minWidth: 90,
            }}>
              <div style={{ color: '#C9A227', fontSize: 22, fontWeight: 800 }}>{item.n}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 3 }}>{item.l}</div>
            </div>
          ))}
        </div>

        {/* Arxa fon dekor */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 240, height: 240,
          background: 'rgba(201,162,39,0.08)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
      </div>

      {/* İKİ KİÇİK BANER */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

        {/* Yeni müştəri endirimi */}
        <div style={{
          flex: '1 1 260px',
          background: '#FFF8EC',
          border: '1.5px solid #E0C99A',
          borderRadius: 20, padding: '24px 22px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            background: '#C9A227', width: 40, height: 40,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={18} color="#fff" fill="#fff" />
          </div>
          <div style={{ fontSize: 11, color: '#8a6d2f', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Yeni müştəri
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1F1F1F', margin: 0, lineHeight: 1.3 }}>
            İlk sifarişdə<br />
            <span style={{ color: '#C9A227' }}>10% endirim</span>
          </h3>
          <p style={{ fontSize: 12, color: '#8a8078', margin: 0, lineHeight: 1.6 }}>
            Sifarişi formalaşdıranda "Yeni müştəriyəm" seçirsən — endirim avtomatik tətbiq olunur.
          </p>
        </div>

        {/* Giftbox */}
        <div style={{
          flex: '1 1 260px',
          background: '#1F1F1F',
          borderRadius: 20, padding: '24px 22px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            background: '#C9A227', width: 40, height: 40,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gift size={18} color="#1F1F1F" />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(201,162,39,0.8)', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Hədiyyə qutusu
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
            Premium giftbox —<br />
            <span style={{ color: '#C9A227' }}>tam hazır bağlama</span>
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
            Lent, qeyd kartı, qutu üzərində yazı — hər şey daxildir. Sifariş verəndə seçirsən.
          </p>
        </div>

        {/* Məzun lentləri */}
        <div style={{
          flex: '1 1 260px',
          background: '#F0EBE3',
          border: '1.5px solid #E0DDD8',
          borderRadius: 20, padding: '24px 22px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{
            background: '#2F4F4F', width: 40, height: 40,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            🎓
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Toplu sifariş
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1F1F1F', margin: 0, lineHeight: 1.3 }}>
            Məzun lentləri —<br />
            <span style={{ color: '#2F4F4F' }}>30+ ədəddə 3 AZN</span>
          </h3>
          <p style={{ fontSize: 12, color: '#8a8078', margin: 0, lineHeight: 1.6 }}>
            1–10 ədəd: 5 AZN &nbsp;·&nbsp; 11–20: 4 AZN &nbsp;·&nbsp; 21–30: 3.5 AZN &nbsp;·&nbsp; 30+: 3 AZN
          </p>
        </div>

      </div>
    </div>
  );
};

export default PromoBanners;