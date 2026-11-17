import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C } from '../../tokens';
import { getLangFromPath, withLangPrefix } from '../../i18n/useLocalizedNav';
import { fetchHomeReviews, RawProductReviews } from '../../lib/siteExtras';

// Ana səhifədə "Müştərilərimiz nə deyir?" — məhsullara yazılmış REAL rəylərdən seçmə.
// - Orta reytinq və say BÜTÜN aktiv rəylərdən hesablanır (yalnız yaxşıları seçib şişirdilmir).
// - Kartlarda yalnız 4–5 ulduzlu, mətni olan rəylər göstərilir; hər məhsuldan ən çox 1 rəy (müxtəliflik).
// - 3-dən az rəy varsa bölmə HEÇ NƏ göstərmir (az rəy etimad yaratmır).
const MIN_REVIEWS = 3;
const MAX_CARDS = 6;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span role="img" aria-label={`${rating} / 5`} style={{ color: '#F5A623', letterSpacing: 2, fontSize: 15 }}>
      {'★'.repeat(full)}
      <span style={{ color: C.borderMid }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}

export default function HomeReviews() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const [raw, setRaw] = useState<RawProductReviews[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomeReviews().then((r) => {
      if (!cancelled) setRaw(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const view = useMemo(() => {
    if (!raw) return null;
    const all = raw.flatMap((p) =>
      (p.reviews || []).map((r) => ({
        name: r.name,
        rating: r.rating ?? 5,
        text: (r.text || '').trim(),
        photoUrl: r.photoUrl,
        productName: lang === 'en' ? p.nameEn || p.name : p.name,
        productSlug: p.slug,
      })),
    );
    if (all.length < MIN_REVIEWS) return null;
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;

    const candidates = all
      .filter((r) => r.rating >= 4 && r.text.length >= 15 && r.text.length <= 400)
      .sort((a, b) => Number(Boolean(b.photoUrl)) - Number(Boolean(a.photoUrl)));
    const seen = new Set<string>();
    const picked: typeof candidates = [];
    for (const r of candidates) {
      if (seen.has(r.productSlug)) continue;
      seen.add(r.productSlug);
      picked.push(r);
      if (picked.length >= MAX_CARDS) break;
    }
    if (picked.length < MIN_REVIEWS) return null;
    return { avg: (Math.round(avg * 10) / 10).toFixed(1), count: all.length, picked };
  }, [raw, lang]);

  if (!view) return null;

  return (
    <section aria-labelledby="home-reviews-title" style={{ background: C.bg, padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,48px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.primaryText, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 10px' }}>
          {t('homeReviews.eyebrow')}
        </p>
        <h2 id="home-reviews-title" style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: C.black, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          {t('homeReviews.title')}
        </h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: C.textSec, margin: '0 0 28px' }}>
          <Stars rating={Number(view.avg)} /> <span style={{ marginLeft: 6 }}>{t('homeReviews.summary', { avg: view.avg, count: view.count })}</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {view.picked.map((r) => (
            <article key={`${r.productSlug}-${r.name}`} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Stars rating={r.rating} />
              <p
                style={{
                  margin: 0, fontSize: 14, lineHeight: 1.65, color: C.black,
                  display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
              >
                {r.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                {r.photoUrl && (
                  <img
                    src={`${r.photoUrl}?w=120&h=120&fit=crop&auto=format&q=70`}
                    alt={t('homeReviews.photoAlt', { name: r.name })}
                    width={56}
                    height={56}
                    loading="lazy"
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.black }}>{r.name}</div>
                  <Link
                    to={withLangPrefix(`/mehsullar/${r.productSlug}`, lang)}
                    style={{ fontSize: 12, color: C.textSec, textDecoration: 'underline' }}
                  >
                    {t('homeReviews.forProduct', { name: r.productName })}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
