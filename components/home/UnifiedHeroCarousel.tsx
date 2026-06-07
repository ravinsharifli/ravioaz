import React, { useState, useEffect, useMemo } from 'react';
import { F } from '../../tokens';
import { ReelPost } from '../../types';
import { toWebP, toSrcSet } from '../../lib/image';
import { buildHeroSlides } from './heroTypes';

export default function UnifiedHeroCarousel({
  reelPosts,
  heroSlides: sanityHeroSlides,
  onShopClick,
  onProductClick,
}: {
  reelPosts: ReelPost[];
  heroSlides: any[];
  onShopClick: () => void;
  onProductClick: (slug: string) => void;
}) {
  const slides = useMemo(
    () => buildHeroSlides(reelPosts, sanityHeroSlides),
    [reelPosts, sanityHeroSlides],
  );
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  // Auto-advance: hər 4.5 saniyədə bir növbəti slayd
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length, paused]);

  // Slayd yükləndikdə cari indeks diapazonu yoxlayırıq
  const safeIdx = slides.length > 0 ? Math.min(current, slides.length - 1) : 0;
  const slide   = slides[safeIdx];

  if (!slides.length || !slide) return null;

  const arrowBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, flexShrink: 0,
  };

  
  return (
    <div
      style={{
        background: '#111111',
        padding: 'clamp(16px, 4vw, 48px) clamp(16px, 5vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
    >
      {/* ── Əsas karusel ──────────────────────────────────────────────────── */}
      <div
        className="ravio-reelworks-inner"
        style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 16, overflow: 'hidden' }}
      >
        {/* Əsas kart — şəkil VƏ ya gradient text kart */}
        <div
          key={safeIdx}
          onClick={() => {
            if (slide.type === 'work' && (slide as any).slug) {
              onProductClick((slide as any).slug);
            } else {
              onShopClick();
            }
          }}
          className="ravio-reel-main-img"
          style={{
            flex: '0 0 clamp(200px, 45%, 420px)',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '4/5',
            background: slide.imageUrl ? '#1a1a1a' : (slide.bg || '#FF6A00'),
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'ravio-fadein 0.4s ease',
          }}
        >
          {/* ── Arxa plan ── */}
          {slide.imageUrl ? (
            <img
              src={toWebP(slide.imageUrl, 640)}
              srcSet={toSrcSet(slide.imageUrl, [400, 640, 900])}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 420px"
              alt={slide.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading={safeIdx === 0 ? 'eager' : 'lazy'}
              decoding={safeIdx === 0 ? 'sync' : 'async'}
              fetchPriority={safeIdx === 0 ? 'high' : 'auto'}
            />
          ) : (
            /* Promo / text slayd — dekorativ dairələr */
            <>
              <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: '20px', bottom: '-60px', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: '30px', bottom: '80px', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            </>
          )}

          {/* Şəkil üzərindəki qaranlıq gradient overlay */}
          {slide.imageUrl && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 100%)',
            }} />
          )}

          {/* Sol üst künc etiket (badge) */}
          {slide.label && (
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: slide.imageUrl ? '#111111' : 'rgba(255,255,255,0.2)',
              borderRadius: 100, padding: '5px 12px',
              fontSize: 11, fontWeight: 700, color: '#ffffff',
              fontFamily: F.sans, letterSpacing: 0.3,
            }}>
              {slide.label}
            </div>
          )}

          {/* Alt mətn bloku */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: slide.imageUrl ? '20px 18px' : '28px 24px',
          }}>
            <p style={{
              margin: '0 0 6px',
              fontSize: slide.imageUrl ? 16 : 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 800, color: '#ffffff', fontFamily: F.sans,
              lineHeight: 1.15, letterSpacing: '-0.3px',
              textShadow: slide.imageUrl ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
            }}>
              {slide.title}
            </p>
            {slide.subtitle && (
              <p style={{
                margin: '0 0 14px',
                fontSize: slide.imageUrl ? 12 : 13,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: F.sans, lineHeight: 1.5,
                textShadow: slide.imageUrl ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
              }}>
                {slide.subtitle}
              </p>
            )}
            <div style={{
              display: 'inline-block',
              background: slide.imageUrl ? '#FF6A00' : 'rgba(255,255,255,0.95)',
              color: slide.imageUrl ? '#ffffff' : '#111111',
              borderRadius: 8, padding: '8px 18px',
              fontSize: 12, fontWeight: 700, fontFamily: F.sans,
            }}>
              {slide.ctaText}
            </div>
          </div>
        </div>

        {/* ── Kiçik önizləmə kartları (desktop sağ panel) ── */}
        <div
          className="ravio-reel-thumbs"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 12, overflow: 'hidden' }}
        >
          {slides
            .map((p, i) => ({ p, i }))
            .filter(({ i }) => i !== safeIdx)
            .slice(0, 5)
            .map(({ p, i }) => (
              <div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  flex: 1, borderRadius: 12, overflow: 'hidden',
                  position: 'relative', cursor: 'pointer',
                  background: p.imageUrl ? '#1a1a1a' : (p.bg || '#FF6A00'),
                  border: '2px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'stretch',
                  transition: 'border-color 0.2s',
                  maxHeight: 90,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,106,0,0.5)')}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                {/* Önizləmə miniatür */}
                {p.imageUrl ? (
                  <img
                    src={toWebP(p.imageUrl, 160)}
                    alt={p.title}
                    style={{ width: 80, height: '100%', objectFit: 'cover', flexShrink: 0 }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{
                    width: 80, flexShrink: 0,
                    background: p.bg || '#FF6A00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {p.type === 'campaign' ? '🎉' : '✨'}
                  </div>
                )}
                <div style={{
                  padding: '10px 14px',
                  display: 'flex', flexDirection: 'column' as const,
                  justifyContent: 'center', overflow: 'hidden',
                }}>
                  {p.label && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, marginBottom: 4, fontFamily: F.sans,
                      color: p.imageUrl ? '#FF6A00' : 'rgba(255,255,255,0.75)',
                    }}>
                      {p.label}
                    </span>
                  )}
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 600, color: '#ffffff',
                    fontFamily: F.sans, lineHeight: 1.35,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {p.title}
                  </p>
                  {p.subtitle && (
                    <p style={{
                      margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.5)',
                      fontFamily: F.sans,
                      overflow: 'hidden', whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis',
                    }}>
                      {p.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Naviqasiya — ox düymələri + nöqtələr (aşağıda) ──────────────── */}
      {slides.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            aria-label="Əvvəlki slayd"
            style={arrowBtn}
          >&#8249;</button>

          {slides.length <= 10 ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`${i + 1}-ci slayd`}
                  style={{
                    width: i === safeIdx ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === safeIdx ? '#FF6A00' : 'rgba(255,255,255,0.25)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: F.sans, minWidth: 40, textAlign: 'center' }}>
              {safeIdx + 1} / {slides.length}
            </span>
          )}

          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            aria-label="Növbəti slayd"
            style={arrowBtn}
          >&#8250;</button>
        </div>
      )}

      <style>{`
        @keyframes ravio-fadein {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}