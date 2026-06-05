import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { C, F } from '../../tokens';
import { Product, ReelPost } from '../../types';
import { OG_IMAGE, SITE_URL } from '../../constants/seo';
import InfoStrips from '../home/InfoStrips';
import UnifiedHeroCarousel from '../home/UnifiedHeroCarousel';
import ProductGrid from '../ProductGrid';
import CustomerReviews from '../CustomerReviews';
import LoadingGrid from '../catalog/LoadingGrid';

interface HomePageProps {
  visible: boolean;
  reelPosts: ReelPost[];
  heroSlides: any[];
  categories: string[];
  filteredProducts: Product[];
  loading: boolean;
  activeCategory: string | null;
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  goToProducts: (cat?: string | null) => void;
  openProduct: (p: Product) => void;
  reviews: any[];
}

export default function HomePage({
  visible,
  reelPosts,
  heroSlides,
  categories,
  filteredProducts,
  loading,
  activeCategory,
  setActiveCategory,
  goToProducts,
  openProduct,
  reviews,
}: HomePageProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <Helmet>
        <title>Ravio — Sizə Özəl Hədiyyələr | Bakı</title>
        <meta
          name="description"
          content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. Hər məhsul sizin üçün özəl hazırlanır. 17₼-dən başlayan qiymətlə, 1–3 iş günündə çatdırılma."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ravio — Sizə Özəl Hədiyyələr | Bakı" />
        <meta
          property="og:description"
          content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. 17₼-dən başlayan qiymətlə."
        />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:locale" content="az_AZ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ravio — Sizə Özəl Hədiyyələr | Bakı" />
        <meta
          name="twitter:description"
          content="Lazer yazılı qolbaq, fərdi təsbeh, domino və giftbox. 17₼-dən başlayan qiymətlə."
        />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Ravio',
            url: SITE_URL,
            logo: OG_IMAGE,
            description: 'Bakıda fərdi hədiyyələr — lazer yazılı qolbaq, təsbeh, domino, giftbox.',
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              availableLanguage: 'Azerbaijani',
            },
            areaServed: { '@type': 'Country', name: 'Azerbaijan' },
          })}
        </script>
      </Helmet>

      <InfoStrips />

      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Lazer Yazılı Qolbaq və Fərdi Hədiyyələr Bakıda — Ravio
      </h1>

      <UnifiedHeroCarousel
        reelPosts={reelPosts}
        heroSlides={heroSlides}
        onShopClick={() => goToProducts(null)}
        onProductClick={(productSlug) => navigate(`/mehsullar/${productSlug}`)}
      />

      <section
        id="mehsullar"
        style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,3vw,32px)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                background: '#111111',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.8,
                textTransform: 'uppercase' as const,
                padding: '4px 10px',
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              Seçilmiş məhsullar
            </span>
            <h2
              style={{
                fontSize: 'clamp(22px,3.5vw,32px)',
                fontWeight: 800,
                color: C.black,
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Məhsullarımız
            </h2>
          </div>
          <button
            onClick={() => goToProducts(null)}
            style={{
              padding: '10px 22px',
              background: 'transparent',
              border: '1.5px solid #D5D0C8',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: C.black,
              cursor: 'pointer',
              fontFamily: F.sans,
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = C.primary;
              e.currentTarget.style.color = C.primary;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.borderColor = C.borderMid;
              e.currentTarget.style.color = C.black;
            }}
          >
            Hamısına bax →
          </button>
        </div>

        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'nowrap',
              marginBottom: 24,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: 'none',
            }}
          >
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '7px 16px',
                borderRadius: 100,
                flexShrink: 0,
                border: `1.5px solid ${!activeCategory ? C.black : C.borderMid}`,
                background: !activeCategory ? C.black : 'transparent',
                color: !activeCategory ? C.white : C.textSec,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F.sans,
                whiteSpace: 'nowrap',
              }}
            >
              Hamısı
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  flexShrink: 0,
                  border: `1.5px solid ${activeCategory === cat ? C.black : C.borderMid}`,
                  background: activeCategory === cat ? C.black : 'transparent',
                  color: activeCategory === cat ? C.white : C.textSec,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F.sans,
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <ProductGrid
            products={filteredProducts.slice(0, 8)}
            onAddToCart={openProduct}
            onViewProduct={openProduct}
          />
        )}

        {!loading && filteredProducts.length > 8 && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => goToProducts(null)}
              style={{
                padding: '14px 40px',
                background: C.primary,
                color: C.white,
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: F.sans,
                boxShadow: '0 4px 16px rgba(255,106,0,0.3)',
              }}
            >
              Daha çox məhsul gör ({filteredProducts.length - 8}+)
            </button>
          </div>
        )}
      </section>

      <section style={{ background: C.black, padding: 'clamp(48px,7vw,96px) clamp(16px,3vw,32px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.primary,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                margin: '0 0 12px',
              }}
            >
              Necə işləyir
            </p>
            <h2
              style={{
                fontSize: 'clamp(24px,4vw,40px)',
                fontWeight: 800,
                color: C.white,
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              3 addımda sifariş
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            {[
              { n: '01', icon: '🛍️', title: 'Məhsul seç', desc: 'Kataloqdan bəyəndiyini seç, variantı müəyyən et' },
              { n: '02', icon: '✍️', title: 'Ad / mesaj yaz', desc: 'Lazer yazısı üçün istədiyini əlavə et' },
              { n: '03', icon: '⚡', title: 'Ödənişsiz çatır', desc: '1–3 günə hazırlanır və çatdırılır' },
            ].map((s, i) => (
              <div
                key={s.n}
                style={{
                  background: C.darkCard,
                  padding: 'clamp(24px,4vw,40px) clamp(20px,3vw,32px)',
                  borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(255,106,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.primary,
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontSize: 'clamp(15px,2vw,18px)',
                    fontWeight: 700,
                    color: C.white,
                    margin: '0 0 8px',
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.bg }}>
        <CustomerReviews reviews={reviews} />
      </section>
    </div>
  );
}
