import React from 'react';
import { F } from '../tokens';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { getLangFromPath } from '../i18n/useLocalizedNav';

const FONT = F.sans;
const C = {
  black: 'var(--clr-black)', gray: '#555555', grayLt: 'var(--clr-text-muted)',
  orange: 'var(--clr-primary)', bg: 'var(--clr-bg)', border: 'var(--clr-border)', white: 'var(--clr-white)',
  green: '#16A34A',
};

interface DeliveryInfoProps {
  onHomeClick?: () => void;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const canonicalPath = lang === 'en' ? '/en/catdirilma' : '/catdirilma';

  const deliveryOptions = [
    { icon: '🛵', key: 'courier', badgeColor: C.green },
    { icon: '🚇', key: 'metro',   badgeColor: C.green },
    { icon: '📮', key: 'regions', badgeColor: C.green },
  ] as const;

  const steps = ['s1', 's2', 's3', 's4'] as const;
  const faqs = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,3vw,32px)', fontFamily: FONT }}>
      <Helmet>
        <title>{t('delivery.seoTitle')}</title>
        <meta name="description" content={t('delivery.seoDesc')} />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content={t('delivery.seoTitle')} />
        <meta property="og:description" content={t('delivery.seoDesc')} />
        <meta property="og:url"         content={`https://ravio.az${canonicalPath}`} />
        <meta property="og:image"       content="https://ravio.az/og-ravio.png" />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical" href={`https://ravio.az${canonicalPath}`} />
      </Helmet>

      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
        {t('delivery.eyebrow')}
      </p>
      <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: C.black, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        {t('delivery.title')}
      </h1>
      <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.75, margin: '0 0 48px', maxWidth: 580 }}>
        {t('delivery.intro')}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {deliveryOptions.map(d => (
          <div key={d.key} style={{
            background: C.white, borderRadius: 12,
            padding: '24px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>{d.icon}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.black, margin: 0 }}>{t(`delivery.options.${d.key}.title`)}</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: d.badgeColor }}>{t(`delivery.options.${d.key}.badge`)}</span>
            </div>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>{t(`delivery.options.${d.key}.desc`)}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.black, borderRadius: 16, padding: 'clamp(28px,4vw,40px)', marginBottom: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
          {t('delivery.processTitle')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ padding: '24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, marginBottom: 10 }}>{`0${i + 1}`}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>{t(`delivery.steps.${s}.title`)}</h4>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.6 }}>{t(`delivery.steps.${s}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: C.black, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
          {t('delivery.faqTitle')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {faqs.map((f) => (
            <div key={f} style={{ background: C.white, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.black, margin: '0 0 8px' }}>{t(`delivery.faqs.${f}.q`)}</p>
              <p style={{ fontSize: 14, color: C.gray, margin: 0, lineHeight: 1.65 }}>{t(`delivery.faqs.${f}.a`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
