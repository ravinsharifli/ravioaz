import React, { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// AdSidebarLayout — Məhsul səhifəsinin yan boşluqlarını dolduran layout wrapper.
//
// İki rejim:
//  1) Reklam rejimi   — VITE_ADSENSE_CLIENT_ID varsa Google AdSense yükləyir
//  2) Fallback rejimi — Reklam yoxdursa trust badges + populyar məhsul linklərini göstərir
//
// Sidebar-lar YALNIZ ≥1440px ekranda görünür. Mobil/tablet tamamilə toxunulmur.
// ─────────────────────────────────────────────────────────────────────────────

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined;
// Sanity-dən gələn slot ID-lərini .env-ə əlavə edin:
// VITE_AD_SLOT_LEFT=xxxxxxxxxx
// VITE_AD_SLOT_RIGHT=xxxxxxxxxx
const AD_SLOT_LEFT  = import.meta.env.VITE_AD_SLOT_LEFT  as string | undefined;
const AD_SLOT_RIGHT = import.meta.env.VITE_AD_SLOT_RIGHT as string | undefined;

// ── Google AdSense bloku ───────────────────────────────────────────────────
const AdsenseBlock: React.FC<{ slot: string }> = ({ slot }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Script artıq yüklənibsə yenidən yükləməyək
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const s = document.createElement('script');
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      s.async = true;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', minHeight: 280 }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  );
};

// ── Trust Badges — Sol sidebar fallback ───────────────────────────────────
const LeftFallback: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

    <div style={{ background: 'var(--clr-white)', border: '1.5px solid #E5E1DB', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--clr-text-sec)' }}>
        Niyə Ravio?
      </p>
      {[
        { icon: '✦', title: 'Fərdi hazırlanır',  sub: 'Hər məhsul sizin üçün'   },
        { icon: '⚡', title: '1–3 iş günü',       sub: 'Sürətli istehsal'        },
        { icon: '🚇', title: 'Metro ilə çatdırma',sub: 'Bakı daxili pulsuz'      },
        { icon: '↩',  title: '100% zəmanət',      sub: 'Narazısınızsa dəyişirik' },
      ].map(({ icon, title, sub }) => (
        <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--clr-black)', lineHeight: 1.3 }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', lineHeight: 1.4 }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ background: 'var(--clr-white)', border: '1.5px solid #E5E1DB', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--clr-text-sec)' }}>
        Ödəniş üsulları
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['Nağd', 'Kart', 'BirBank', 'Kapital'].map(m => (
          <span key={m} style={{ fontSize: 11, padding: '4px 8px', background: '#F7F5F0', borderRadius: 6, color: 'var(--clr-text-sec)', fontWeight: 600 }}>
            {m}
          </span>
        ))}
      </div>
    </div>

    <div style={{ background: '#FFF3EC', border: '1.5px solid #FFD4B8', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--clr-primary)' }}>
        Korporativ sifariş?
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#7C3010', lineHeight: 1.55 }}>
        10+ ədəd sifarişdə xüsusi endirim tətbiq olunur.
      </p>
      <a
        href="https://wa.me/994XXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', textAlign: 'center', background: 'var(--clr-primary)', color: '#fff', fontWeight: 700, fontSize: 12, borderRadius: 8, padding: '9px 0', textDecoration: 'none' }}
      >
        WhatsApp ilə əlaqə
      </a>
    </div>
  </div>
);

// ── Populyar məhsullar — Sağ sidebar fallback ─────────────────────────────
interface SideProduct { name: string; slug: string; price: string; emoji: string; }

const DEFAULT_SIDE_PRODUCTS: SideProduct[] = [
  { name: 'Lazer Qolbaq',    slug: 'lazer-qolbaq',      price: '17 ₼', emoji: '📿' },
  { name: 'Fərdi Təsbeh',    slug: 'ferdi-tesbeh',       price: '22 ₼', emoji: '🧿' },
  { name: 'Domino Dəsti',    slug: 'domino-desti',       price: '35 ₼', emoji: '🎲' },
  { name: 'Hədiyyə Qutusu',  slug: 'hediyelik-qutu',     price: '10 ₼', emoji: '🎁' },
];

const RightFallback: React.FC<{ products?: SideProduct[] }> = ({ products = DEFAULT_SIDE_PRODUCTS }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

    <div style={{ background: 'var(--clr-white)', border: '1.5px solid #E5E1DB', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--clr-text-sec)' }}>
        Populyar məhsullar
      </p>
      {products.map(p => (
        <a
          key={p.slug}
          href={`/mehsullar/${p.slug}`}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0EDE8', textDecoration: 'none' }}
        >
          <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ fontSize: 11, color: 'var(--clr-primary)', fontWeight: 700 }}>{p.price}-dən</div>
          </div>
        </a>
      ))}
      <a
        href="/mehsullar"
        style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 12, color: 'var(--clr-text-sec)', fontWeight: 600, textDecoration: 'none' }}
      >
        Hamısına bax →
      </a>
    </div>

    <div style={{ background: 'var(--clr-white)', border: '1.5px solid #E5E1DB', borderRadius: 12, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--clr-text-sec)' }}>
        Müştəri rəyləri
      </p>
      {[
        { name: 'Aytən M.',  text: 'Qolbaqı çox bəyəndim, yazı mükəmməl çıxdı!' },
        { name: 'Rauf H.',   text: 'Korporativ sifariş verdim, vaxtında gəldi.'  },
        { name: 'Sevinc A.', text: 'Hədiyyəlik qutu super idi, hamı bəyəndi.'    },
      ].map(r => (
        <div key={r.name} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--clr-primary)' }}>★★★★★</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--clr-black)' }}>{r.name}</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--clr-text-sec)', lineHeight: 1.5 }}>"{r.text}"</p>
        </div>
      ))}
    </div>

    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      borderRadius: 12, padding: '16px',
      textAlign: 'center',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 16, lineHeight: 1 }}>📸</p>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#fff' }}>Instagram-da bizi izlə</p>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>Real işlərimizi görün</p>
      <a
        href="https://instagram.com/ravio.az"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-block', background: '#fff', color: '#1a1a2e', fontWeight: 700, fontSize: 11, borderRadius: 7, padding: '7px 14px', textDecoration: 'none' }}
      >
        @ravio.az
      </a>
    </div>
  </div>
);

// ── Ana Layout komponenti ──────────────────────────────────────────────────
interface AdSidebarLayoutProps {
  children: React.ReactNode;
  /** İstifadəçidən ötürülə bilən xüsusi sağ sidebar məhsulları */
  sideProducts?: SideProduct[];
}

const AdSidebarLayout: React.FC<AdSidebarLayoutProps> = ({ children, sideProducts }) => {
  const showAds = !!(ADSENSE_CLIENT && AD_SLOT_LEFT && AD_SLOT_RIGHT);

  return (
    <>
      {/* CSS-i yalnız bir dəfə inject et */}
      <style>{`
        .ravio-sidebar-shell {
          display: grid;
          grid-template-columns: 200px 1fr 200px;
          gap: 0;
          align-items: flex-start;
          max-width: 1560px;
          margin: 0 auto;
        }
        .ravio-sidebar-left,
        .ravio-sidebar-right {
          padding: clamp(12px,2vw,24px) 12px;
          position: sticky;
          top: 80px;
        }
        /* Yalnız geniş ekranlarda göstər */
        @media (max-width: 1439px) {
          .ravio-sidebar-shell {
            grid-template-columns: 1fr !important;
          }
          .ravio-sidebar-left,
          .ravio-sidebar-right {
            display: none !important;
          }
        }
      `}</style>

      <div className="ravio-sidebar-shell">
        {/* ── Sol sidebar ── */}
        <aside className="ravio-sidebar-left">
          {showAds ? <AdsenseBlock slot={AD_SLOT_LEFT!} /> : <LeftFallback />}
        </aside>

        {/* ── Məhsul kontenti (dəyişdirilmir) ── */}
        <main style={{ minWidth: 0 }}>
          {children}
        </main>

        {/* ── Sağ sidebar ── */}
        <aside className="ravio-sidebar-right">
          {showAds ? <AdsenseBlock slot={AD_SLOT_RIGHT!} /> : <RightFallback products={sideProducts} />}
        </aside>
      </div>
    </>
  );
};

export default AdSidebarLayout;
export type { SideProduct };