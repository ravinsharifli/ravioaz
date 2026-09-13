import React, { useState } from 'react';
import { C, F, R } from '../../tokens';
import { Product } from '../../types';
import { toWebP } from '../../lib/image';

// Sanity `campaignBanner` obyektindən GROQ ilə gələn forma (bax: lib/sanityProduct.ts)
export interface CampaignBannerData {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  imageUrl?: string;
  linkedProductSlug?: string;
}

interface PromoRowProps {
  campaignBanner?: CampaignBannerData | null;
  featuredProduct?: Product | null;
  featuredBadgeText?: string;
  defaultBadge: string;
  defaultHeading: string;
  viewAllText: string;
  onShopClick: () => void;
  onProductClick: (slug: string) => void;
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#111111',
  color: '#ffffff',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1.8,
  textTransform: 'uppercase',
  padding: '4px 10px',
  borderRadius: 6,
  marginBottom: 8,
  width: 'fit-content',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(22px,3.5vw,32px)',
  fontWeight: 800,
  color: C.black,
  margin: 0,
  letterSpacing: '-0.3px',
};

/** "Məhsullarımız" başlığının adi görünüşü — kampaniya/seçilmiş məhsul aktiv olmayanda göstərilir. */
function DefaultHeading({ badge, heading }: { badge: string; heading: string }) {
  return (
    <div>
      <span style={badgeStyle}>{badge}</span>
      <h2 style={headingStyle}>{heading}</h2>
    </div>
  );
}

export default function PromoRow({
  campaignBanner,
  featuredProduct,
  featuredBadgeText,
  defaultBadge,
  defaultHeading,
  viewAllText,
  onShopClick,
  onProductClick,
}: PromoRowProps) {
  const bannerActive = !!(campaignBanner?.isActive && (campaignBanner.title || campaignBanner.imageUrl));
  const hasFeatured = !!featuredProduct;

  // ── Heç bir kampaniya banneri / seçilmiş məhsul aktiv deyil ──────────────
  // Sanity-də hər ikisi söndürülübsə (default vəziyyət), sayt bugünkü kimi görünür.
  if (!bannerActive && !hasFeatured) {
    return (
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
        <DefaultHeading badge={defaultBadge} heading={defaultHeading} />
        <button
          onClick={onShopClick}
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
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.black; }}
        >
          {viewAllText}
        </button>
      </div>
    );
  }

  // ── Kampaniya banneri və/və ya seçilmiş məhsul aktivdir ───────────────────
  const handleBannerClick = () => {
    if (campaignBanner?.linkedProductSlug) onProductClick(campaignBanner.linkedProductSlug);
    else onShopClick();
  };

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
      <div style={{ flex: '1 1 420px' }}>
        {bannerActive ? (
          <BannerCard data={campaignBanner as CampaignBannerData} onClick={handleBannerClick} />
        ) : (
          <DefaultHeading badge={defaultBadge} heading={defaultHeading} />
        )}
      </div>

      {hasFeatured && (
        <div style={{ flex: '0 1 300px', maxWidth: 320 }}>
          <FeaturedCard
            product={featuredProduct as Product}
            badgeText={featuredBadgeText}
            onClick={() => (featuredProduct as Product)?.slug && onProductClick((featuredProduct as Product).slug as string)}
          />
        </div>
      )}
    </div>
  );
}

function BannerCard({ data, onClick }: { data: CampaignBannerData; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        height: '100%',
        minHeight: 208,
        borderRadius: R.lg,
        overflow: 'hidden',
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${C.dark}, ${C.darkCard})`,
        display: 'flex',
        alignItems: 'flex-end',
        transition: 'transform 0.25s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {data.imageUrl && (
        <img
          src={toWebP(data.imageUrl, 900, 72)}
          alt={data.title || 'Kampaniya'}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.05) 100%)',
        }}
      />
      <div style={{ position: 'relative', padding: 'clamp(18px,3vw,28px)', width: '100%' }}>
        {data.subtitle && (
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: F.sans }}>
            {data.subtitle}
          </p>
        )}
        {data.title && (
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: 'clamp(20px,3vw,28px)',
              fontWeight: 800,
              color: C.white,
              fontFamily: F.sans,
              letterSpacing: '-0.3px',
            }}
          >
            {data.title}
          </h2>
        )}
        {data.ctaText && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              background: C.primary,
              color: C.white,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: F.sans,
            }}
          >
            {data.ctaText}
          </span>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ product, badgeText, onClick }: { product: Product; badgeText?: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const variants = product.variants || [];
  const fv = variants[0];
  const img = fv?.images?.[0];
  const eff = variants.map((v) => v.discountPrice ?? v.price);
  const orig = variants.map((v) => v.price);
  const min = eff.length ? Math.min(...eff) : 0;
  const minOld = orig.length ? Math.min(...orig) : 0;
  const hasDiscount = min < minOld;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: '100%',
        minHeight: 208,
        display: 'flex',
        flexDirection: 'column',
        background: C.white,
        border: `1.5px solid ${hovered ? C.primary : C.border}`,
        borderRadius: R.lg,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ position: 'relative', flex: 1, background: C.bg, overflow: 'hidden', minHeight: 120 }}>
        {img ? (
          <img
            src={toWebP(img, 480, 72)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
        {badgeText && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: C.primary,
              color: C.white,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.4,
              padding: '3px 9px',
              borderRadius: 6,
              fontFamily: F.sans,
            }}
          >
            {badgeText}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: 13,
            fontWeight: 700,
            color: C.black,
            fontFamily: F.sans,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {product.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          {hasDiscount && (
            <span style={{ fontSize: 11, color: C.textMuted, textDecoration: 'line-through', fontFamily: F.sans }}>
              {minOld.toFixed(2)} ₼
            </span>
          )}
          <span style={{ fontSize: 16, fontWeight: 800, color: hasDiscount ? C.primary : C.black, fontFamily: F.sans }}>
            {min.toFixed(2)} ₼
          </span>
        </div>
      </div>
    </div>
  );
}
