
import React from 'react';
export const DeliveryInfo: React.FC = () => (
  <Section
    label="Çatdırılma"
    title="Ödənişsiz çatdırılma"
    sub="Bütün sifarişlər ödənişsiz çatdırılır. Çatdırılma üsulunu sifariş zamanı seçirsiniz."
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
      {[
        { icon: '🚇', title: 'Metro görüşü', sub: 'Ödənişsiz', desc: 'Sizə uyğun metro stansiyasında görüşürük. Gün və saat seçirsiniz.' },
        { icon: '🛵', title: 'Kuryer', sub: '+4.99 ₼', desc: 'Ünvanınıza gətirilir. Bakı daxili.' },
        { icon: '📮', title: 'Poçt', sub: '+4.99 ₼', desc: 'Azərpoçt vasitəsilə istənilən ünvana.' },
      ].map(d => (
        <div key={d.title} style={{
          background: C.white, borderRadius: 12, padding: '24px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>{d.icon}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.black, margin: 0 }}>{d.title}</h3>
            <span style={{ fontSize: 13, fontWeight: 700, color: d.sub === 'Ödənişsiz' ? '#16A34A' : C.orange }}>{d.sub}</span>
          </div>
          <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
        </div>
      ))}
    </div>
 
    {/* Process */}
    <div style={{ background: C.black, borderRadius: 16, padding: 'clamp(28px,4vw,40px)' }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: '0 0 24px', letterSpacing: '-0.3px' }}>Hazırlıq prosesi</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
        {[
          { n: '01', title: 'Sifariş qəbul', desc: '24 saat ərzində təsdiq edilir' },
          { n: '02', title: 'Lazer yazı', desc: 'Dəqiq və keyfiyyətli işləmə' },
          { n: '03', title: 'Yoxlama', desc: 'Hər məhsul yoxlanılır' },
          { n: '04', title: 'Çatdırılma', desc: '1–3 iş günü' },
        ].map((s, i) => (
          <div key={s.n} style={{
            padding: '24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: 2, marginBottom: 10 }}>{s.n}</div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: '0 0 8px' }}>{s.title}</h4>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </Section>
);
 
export default AboutUs;