
import React from 'react';
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.36-2.81-.09-.8.19-1.53.64-2.06 1.29-.61.7-.93 1.58-.9 2.5.01.89.35 1.78.94 2.44.61.71 1.46 1.16 2.4 1.28.98.11 1.98-.14 2.73-.78.61-.51.98-1.24 1.05-2.03.01-4.52.01-9.04.01-13.56z" />
  </svg>
);
 
export const Contact: React.FC = () => (
  <Section
    label="Əlaqə"
    title="Bizimlə əlaqə"
    sub="Sual, sifariş və ya məlumat üçün WhatsApp, Instagram və ya TikTok üzərindən yazın."
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {[
        {
          href: 'https://wa.me/994519831483',
          icon: '💬',
          label: 'WhatsApp',
          value: '+994 51 983 14 83',
          cta: 'Sifariş et',
          highlight: true,
        },
        {
          href: 'https://instagram.com/ravio.az',
          icon: null,
          label: 'Instagram',
          value: '@ravio.az',
          cta: 'Keç',
        },
        {
          href: 'https://tiktok.com/@ravio.az',
          icon: null,
          isTikTok: true,
          label: 'TikTok',
          value: '@ravio.az',
          cta: 'Keç',
        },
        {
          href: 'tel:+994519831483',
          icon: '📞',
          label: 'Zəng',
          value: '+994 51 983 14 83',
          cta: 'Zəng et',
        },
      ].map((item: any) => (
        <a key={item.label} href={item.href} target="_blank" rel="noreferrer"
          style={{
            display: 'flex', flexDirection: 'column' as const, gap: 12,
            padding: '24px', borderRadius: 12,
            background: item.highlight ? C.orange : C.white,
            border: `1px solid ${item.highlight ? C.orange : C.border}`,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ fontSize: 28 }}>
            {item.isTikTok ? <span style={{ color: item.highlight ? C.white : C.black }}><TikTokIcon /></span> : item.icon}
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: item.highlight ? 'rgba(255,255,255,0.7)' : C.grayLt }}>{item.label}</p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: item.highlight ? C.white : C.black, letterSpacing: '-0.3px' }}>{item.value}</p>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            color: item.highlight ? C.white : C.orange,
          }}>{item.cta} →</div>
        </a>
      ))}
    </div>
  </Section>
);