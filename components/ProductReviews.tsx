import React from 'react';
import { Star } from 'lucide-react';
import { C, F } from '../tokens';
import { CustomerReview } from '../types';
import { toWebP } from '../lib/image';

const FONT = F.sans;

const Stars = ({ n }: { n: number }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={13} color={C.primary} fill={i <= n ? C.primary : 'none'} />
    ))}
  </div>
);

interface ProductReviewsProps {
  reviews: CustomerReview[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  const active = reviews.filter((r) => r.isActive !== false && r.name && r.text);
  if (!active.length) return null;

  const avg = active.reduce((s, r) => s + (r.rating || 5), 0) / active.length;
  const avgDisplay = avg % 1 === 0 ? String(avg) : avg.toFixed(1);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <section
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(32px,5vw,48px) clamp(16px,3vw,32px)',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.primary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            Müştəri rəyləri
          </p>
          <h2
            style={{
              fontSize: 'clamp(20px,3vw,26px)',
              fontWeight: 800,
              color: C.black,
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Real alıcıların rəyləri
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: C.black, letterSpacing: '-1px' }}>
            {avgDisplay}
          </span>
          <div>
            <Stars n={Math.round(avg)} />
            <p style={{ fontSize: 11, color: C.textMuted, margin: '4px 0 0', fontWeight: 500 }}>
              {active.length} rəy
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {active.map((r, idx) => (
          <div
            key={`${r.name}-${idx}`}
            style={{
              background: C.white,
              borderRadius: 12,
              border: '1px solid #EDEBE7',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {r.photoUrl && (
              <div style={{ width: '100%', height: 140, overflow: 'hidden', background: C.bg }}>
                <img
                  src={toWebP(r.photoUrl, 400)}
                  alt={`${r.name} rəyi`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              </div>
            )}
            <div
              style={{
                padding: '14px 14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: C.black,
                      color: C.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(r.name)}
                  </div>
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
    </section>
  );
}
