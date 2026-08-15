import React from 'react';
import { F } from '../tokens';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getLangFromPath, withLangPrefix } from '../i18n/useLocalizedNav';

const FONT = F.sans;
const C = {
  black:  'var(--clr-black)',
  gray:   '#555555',
  orange: 'var(--clr-primary)',
  bg:     'var(--clr-bg)',
  border: 'var(--clr-border)',
  white:  'var(--clr-white)',
};

const pillarMeta = [
  { key: 'p1', icon: '🚚', color: '#0f2d45', accent: '#1a6699' },
  { key: 'p2', icon: '🐾', color: '#0f2a1e', accent: '#1a7a4a' },
  { key: 'p3', icon: '✍️', color: '#1a1200', accent: '#b85c00' },
] as const;

const stepKeys = ['s1', 's2', 's3', 's4', 's5'] as const;

const AboutUs: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const canonicalPath = lang === 'en' ? '/en/haqqimizda' : '/haqqimizda';

  return (
    <div style={{ fontFamily: FONT }}>
      <Helmet>
        <title>{t('about.seoTitle')}</title>
        <meta name="description" content={t('about.seoDesc')} />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content={t('about.seoTitle')} />
        <meta property="og:description" content={t('about.seoDesc')} />
        <meta property="og:url"         content={`https://ravio.az${canonicalPath}`} />
        <meta property="og:image"       content="https://ravio.az/og-ravio.png" />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical"           href={`https://ravio.az${canonicalPath}`} />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ background: '#111111', padding: 'clamp(48px,7vw,96px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 16px' }}>
            {t('about.eyebrow')}
          </p>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800, color: '#ffffff', margin: '0 0 20px', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {t('about.heroTitle1')}<br />{t('about.heroTitle2')}
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 auto', maxWidth: 560 }}>
            {t('about.heroBody')}
          </p>
        </div>
      </div>

      {/* ── 3 Prinsip ────────────────────────────────────── */}
      <div style={{ background: C.bg, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px' }}>
            {t('about.pillarsEyebrow')}
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: C.black, margin: '0 0 48px', letterSpacing: '-0.3px' }}>
            {t('about.pillarsTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {pillarMeta.map((p) => (
              <div
                key={p.key}
                style={{ background: p.color, borderRadius: 20, padding: 'clamp(24px,3vw,36px)', display: 'flex', flexDirection: 'column' as const, gap: 20 }}
              >
                <div>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: p.accent + '44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>
                    {p.icon}
                  </div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase' as const, color: p.accent, margin: '0 0 8px' }}>
                    {t(`about.pillars.${p.key}.label`)}
                  </p>
                  <h3 style={{ fontSize: 'clamp(17px,2vw,21px)', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', lineHeight: 1.2 }}>
                    {t(`about.pillars.${p.key}.title`)}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: 0 }}>
                    {t(`about.pillars.${p.key}.body`)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 20, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <div>
                    <div style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                      {p.key === 'p1' ? '3' : p.key === 'p2' ? '5%' : '1–3'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontWeight: 500 }}>
                      {t(`about.pillars.${p.key}.stat1`)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                      {p.key === 'p1' ? '0₼' : p.key === 'p2' ? '♾' : '100%'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontWeight: 500 }}>
                      {t(`about.pillars.${p.key}.stat2`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Proses ───────────────────────────────────────── */}
      <div style={{ background: C.white, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px' }}>
            {t('about.processEyebrow')}
          </p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: C.black, margin: '0 0 40px', letterSpacing: '-0.3px' }}>
            {t('about.processTitle')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
            {stepKeys.map((s, i) => (
              <div key={s} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', paddingBottom: i < stepKeys.length - 1 ? 28 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>
                    {`0${i + 1}`}
                  </div>
                  {i < stepKeys.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 24, background: '#EDEBE7', marginTop: 6 }} />
                  )}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.black, margin: '0 0 6px' }}>
                    {t(`about.steps.${s}.title`)}
                  </h3>
                  <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>
                    {t(`about.steps.${s}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div style={{ background: C.orange, padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
          {t('about.ctaTitle')}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 28px' }}>
          {t('about.ctaBody')}
        </p>

        <a
          href={withLangPrefix('/', lang)}
          style={{
            display: 'inline-block',
            background: '#ffffff',
            color: '#FF6A00',
            borderRadius: 10,
            padding: '14px 32px',
            fontSize: 14,
            fontWeight: 800,
            textDecoration: 'none',
            letterSpacing: 0.2,
          }}
        >
          {t('about.ctaButton')}
        </a>
      </div>

    </div>
  );
};

export default AboutUs;
