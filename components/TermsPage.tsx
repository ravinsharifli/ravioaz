import React from 'react';
import { F } from '../tokens';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getLangFromPath } from '../i18n/useLocalizedNav';

const C = {
  black: 'var(--clr-black)', gray: '#555555',
  orange: 'var(--clr-primary)', border: 'var(--clr-border)', white: 'var(--clr-white)',
};

const SECTIONS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const;

const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const canonicalPath = lang === 'en' ? '/en/qaydalar' : '/qaydalar';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,3vw,32px)', fontFamily: F.sans }}>
      <Helmet>
        <title>{t('terms.seoTitle')}</title>
        <meta name="description" content={t('terms.seoDesc')} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('terms.seoTitle')} />
        <meta property="og:description" content={t('terms.seoDesc')} />
        <meta property="og:url" content={`https://ravio.az${canonicalPath}`} />
        <meta property="og:image" content="https://ravio.az/og-ravio.png" />
        <link rel="canonical" href={`https://ravio.az${canonicalPath}`} />
      </Helmet>

      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
        {t('terms.eyebrow')}
      </p>
      <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, color: C.black, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        {t('terms.title')}
      </h1>
      <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.75, margin: '0 0 40px' }}>{t('terms.intro')}</p>

      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
        {SECTIONS.map((s) => (
          <section key={s} style={{ background: C.white, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: C.black, margin: '0 0 8px' }}>{t(`terms.sections.${s}.title`)}</h2>
            <p style={{ fontSize: 14, color: C.gray, margin: 0, lineHeight: 1.7 }}>{t(`terms.sections.${s}.body`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TermsPage;
