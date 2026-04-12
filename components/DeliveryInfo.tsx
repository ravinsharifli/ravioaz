import React from 'react';

const FONT = "'Inter', sans-serif";
const C = {
  black: '#111111', gray: '#555555', grayLt: '#AAAAAA',
  orange: '#FF6A00', bg: '#F5F2EC', border: '#EDEBE7', white: '#FFFFFF',
  green: '#16A34A',
};

interface DeliveryInfoProps {
  onHomeClick?: () => void;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = () => {
  const deliveryOptions = [
    {
      icon: '🚇',
      title: 'Metro görüşü',
      badge: 'Ödənişsiz',
      badgeColor: C.green,
      desc: 'Bakı metrosunun istənilən stansiyasında görüşürük. Gün və saat sifariş zamanı seçilir.',
    },
    {
      icon: '🛵',
      title: 'Kuryer xidməti',
      badge: '+4.99 ₼',
      badgeColor: C.orange,
      desc: 'Bakı, Masazır, Xırdalan, Sumqayıt və Abşeron ərazisində ünvana çatdırılır.',
    },
    {
      icon: '📮',
      title: 'Azərpoçt',
      badge: '+4.99 ₼',
      badgeColor: C.orange,
      desc: 'Azərpoçt vasitəsilə Azərbaycanın istənilən bölgəsinə çatdırılır.',
    },
  ];

  const steps = [
    { n: '01', title: 'Sifariş qəbul',  desc: '24 saat ərzində təsdiq edilir' },
    { n: '02', title: 'Lazer yazı',      desc: 'Dəqiq və keyfiyyətli işləmə' },
    { n: '03', title: 'Yoxlama',         desc: 'Hər məhsul göndərilməzdən yoxlanılır' },
    { n: '04', title: 'Çatdırılma',      desc: '1–3 iş günü' },
  ];

  const faqs = [
    {
      q: 'Metro görüşü ödənişlidirmi?',
      a: 'Xeyr, metro görüşü tamamilə ödənişsizdir. Bakı metrosunun istənilən stansiyasını seçə bilərsiniz.',
    },
    {
      q: 'Kuryer xidməti hara çatdırır?',
      a: 'Bakı, Masazır, Xırdalan, Sumqayıt və bütün Abşeron ərazisi üçün kuryer xidməti mövcuddur. Ödəniş 4.99 ₼-dir.',
    },
    {
      q: 'Sifariş nə qədər müddətdə hazır olur?',
      a: '1–3 iş günü ərzində hazırlanır. Hazır olduqda sizinlə əlaqə saxlanılır.',
    },
    {
      q: 'Çatdırılma vaxtını özüm seçə bilərəmmi?',
      a: 'Bəli. Metro görüşü üçün stansiya, gün və saatı sifariş zamanı özünüz seçirsiniz.',
    },
    {
      q: 'Sifarişi ləğv etmək olurmu?',
      a: 'Lazer yazısı başlamazdan əvvəl ləğv mümkündür. Başlandıqdan sonra ləğv qəbul edilmir.',
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,3vw,32px)', fontFamily: FONT }}>

      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 1.5, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>
        Çatdırılma
      </p>
      <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: C.black, margin: '0 0 16px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
        Çatdırılma məlumatları
      </h1>
      <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.75, margin: '0 0 48px', maxWidth: 580 }}>
        Metro görüşü ödənişsizdir. Kuryer xidməti Bakı, Masazır, Xırdalan, Sumqayıt və Abşeron ərazisi üçün 4.99 ₼ təşkil edir.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {deliveryOptions.map(d => (
          <div key={d.title} style={{
            background: C.white, borderRadius: 12,
            padding: '24px', border: `1px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>{d.icon}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.black, margin: 0 }}>{d.title}</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: d.badgeColor }}>{d.badge}</span>
            </div>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: C.black, borderRadius: 16, padding: 'clamp(28px,4vw,40px)', marginBottom: 40 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
          Hazırlıq prosesi
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ padding: '24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, marginBottom: 10 }}>{s.n}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>{s.title}</h4>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, color: C.black, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
          Tez-tez soruşulan suallar
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.black, margin: '0 0 8px' }}>{faq.q}</p>
              <p style={{ fontSize: 14, color: C.gray, margin: 0, lineHeight: 1.65 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;