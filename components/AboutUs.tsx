import React from 'react';
import { F } from '../tokens';
import { Helmet } from 'react-helmet-async';

const FONT = F.sans;
const C = {
  black:   'var(--clr-black)',
  gray:    '#555555',
  grayLt:  'var(--clr-text-muted)',
  orange:  'var(--clr-primary)',
  bg:      'var(--clr-bg)',
  border:  'var(--clr-border)',
  white:   'var(--clr-white)',
};

const pillars = [
  {
    icon: '🚚',
    color: '#0f2d45',
    accent: '#1a6699',
    label: 'Çatdırılma strategiyası',
    title: 'Bütün Azərbaycana ödənişsiz',
    body:
      'Çatdırılma haqqı almırıq — nə Bakıda, nə Sumqayıtda, nə də ölkənin hər hansı guşəsində. Kuryer, metro görüşü, Azərpoçt — üç kanal, hamısı ödənişsiz. Çünki bir hədiyyə seçib sonra çatdırılma haqqıyla üzləşmək həmin hədiyyənin sevincini əlindən alır.',
    stats: [
      { val: '3', unit: 'çatdırılma kanalı' },
      { val: '0₼', unit: 'çatdırılma haqqı' },
    ],
  },
  {
    icon: '🐾',
    color: '#0f2a1e',
    accent: '#1a7a4a',
    label: 'Heyvan qayğısı strategiyası',
    title: 'Satışın 5%-i küçə heyvanlarına',
    body:
      'Hər aldığın hədiyyənin 5%-i avtomatik olaraq küçə heyvanlarının yemlənməsinə, müalicəsinə və sığınacağına yönəlir. Bu şərt deyil, reklam deyil — biznesmizin quruluşuna işlənmiş bir öhdəlikdir. Sənin sevdiyinə hədiyyə alarkən bir başqasına da yaxşılıq etmiş olursan.',
    stats: [
      { val: '5%', unit: 'hər satışdan' },
      { val: '♾️', unit: 'davamlı öhdəlik' },
    ],
  },
  {
    icon: '✍️',
    color: '#1a1200',
    accent: '#b85c00',
    label: 'Fərdi hədiyyə strategiyası',
    title: 'Hər hədiyyə sənin adınla',
    body:
      'Lazer texnologiyası ilə hər məhsula ad, tarix, mesaj, hətta koordinat yazırıq. Satın aldığın əşya mağazadan deyil, sənin ürəyindən gəlmiş kimi görünür. Kütləvi istehsal yoxdur — hər sifariş ayrıca hazırlanır, ayrıca yoxlanılır, ayrıca paketlənir.',
    stats: [
      { val: '1–3', unit: 'gün ərzində hazır' },
      { val: '∞', unit: 'fərdiləşdirmə imkanı' },
    ],
  },
];

const AboutUs: React.FC = () => {
  return (
    <div style={{ fontFamily: FONT }}>
      <Helmet>
        <title>Haqqımızda | Ravio</title>
        <meta name="description" content="Ravio — Bakıda fərdi hədiyyələr hazırlayan onlayn mağaza. Lazer yazısı, ödənişsiz çatdırılma, satışın 5%-i küçə heyvanlarına. Hər məhsul sizin üçün xüsusi hazırlanır." />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Haqqımızda | Ravio" />
        <meta property="og:description" content="Ravio — fərdi hədiyyə mağazası. Ödənişsiz çatdırılma, lazer yazı, satışın 5%-i heyvanlara." />
        <meta property="og:url"         content="https://ravio.az/haqqimizda" />
        <meta property="og:image"       content="https://ravio.az/og-ravio.png" />
        <meta name="twitter:card"       content="summary_large_image" />
        <link rel="canonical" href="https://ravio.az/haqqimizda" />
      </Helmet>

      {/* ── Hero bölməsi ──────────────────────────────────── */}
      <div style={{ background: '#111111', padding: 'clamp(48px,7vw,96px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: C.orange,
            letterSpacing: 2, textTransform: 'uppercase',
            margin: '0 0 16px',
          }}>
            Haqqımızda
          </p>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,52px)', fontWeight: 800,
            color: '#ffffff', margin: '0 0 20px',
            letterSpacing: '-0.5px', lineHeight: 1.1,
          }}>
            Bir hədiyyə almaq —<br />iki yaxşılıq etməkdir.
          </h1>
          <p style={{
            fontSize: 'clamp(14px,2vw,17px)', color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75, margin: 0, maxWidth: 560, marginInline: 'auto',
          }}>
            Ravio Bakıda fəaliyyət göstərən fərdi hədiyyə mağazasıdır.
            Hər məhsul sifariş əsasında lazer ilə yazılır.
            Hər satışın 5%-i küçə heyvanlarına yönəlir.
            Çatdırılma tamamilə ödənişsizdir.
          </p>
        </div>
      </div>

      {/* ── 3 Sütun Strategiya ────────────────────────────── */}
      <div style={{ background: C.bg, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: C.orange, letterSpacing: 2,
            textTransform: 'uppercase', margin: '0 0 12px',
          }}>
            Bizim 3 prinsipimiz
          </p>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800,
            color: C.black, margin: '0 0 48px', letterSpacing: '-0.3px',
          }}>
            Niyə məhz Ravio?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {pillars.map(p => (
              <div key={p.title} style={{
                background: p.color,
                borderRadius: 20,
                padding: 'clamp(24px,3vw,36px)',
                display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                {/* Üst hissə */}
                <div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${p.accent}44`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, marginBottom: 16,
                  }}>
                    {p.icon}
                  </div>
                  <p style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1.8,
                    textTransform: 'uppercase',
                    color: p.accent, margin: '0 0 8px',
                  }}>
                    {p.label}
                  </p>
                  <h3 style={{
                    fontSize: 'clamp(17px,2vw,21px)', fontWeight: 800,
                    color: '#ffffff', margin: '0 0 12px', lineHeight: 1.2,
                  }}>
                    {p.title}
                  </h3>
                  <p style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.75, margin: 0,
                  }}>
                    {p.body}
                  </p>
                </div>

                {/* Statistika */}
                <div style={{
                  display: 'flex', gap: 20,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: 20,
                }}>
                  {p.stats.map(s => (
                    <div key={s.unit}>
                      <div style={{
                        fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800,
                        color: '#ffffff', lineHeight: 1,
                      }}>
                        {s.val}
                      </div>
                      <div style={{
                        fontSize: 11, color: 'rgba(255,255,255,0.45)',
                        marginTop: 4, fontWeight: 500,
                      }}>
                        {s.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Necə işləyir ─────────────────────────────────── */}
      <div style={{ background: C.white, padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 11, fontWeight: 700,
            color: C.orange, letterSpacing: 2,
            textTransform: 'uppercase', margin: '0 0 12px',
          }}>
            Proses
          </p>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800,
            color: C.black, margin: '0 0 40px', letterSpacing: '-0.3px',
          }}>
            Sifarişdən çatdırılmaya
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '01', title: 'Məhsulu seç', desc: 'Qolbaq, təsbeh, domino — kataloqumuzdan seç.' },
              { n: '02', title: 'Yazını bildir', desc: 'Ad, tarix, mesaj, hətta koordinat — istədiyin hər şeyi yaz.' },
              { n: '03', title: 'Sifarişi ver', desc: 'WhatsApp üzərindən 2 dəqiqədə sifariş tamamlanır.' },
              { n: '04', title: 'Biz hazırlayırıq', desc: 'Lazer ilə yazılır, yoxlanılır, paketlənir — 1–3 iş günü.' },
              { n: '05', title: 'Qapınıza gəlir', desc: 'Kuryer, metro, Azərpoçt — tamamilə ödənişsiz.' },
            ].map((step, i, arr) => (
              <div key={step.n} style={{
                display: 'flex', gap: 20, alignItems: 'flex-start',
                paddingBottom: i < arr.length - 1 ? 28 : 0,
                position: 'relative',
              }}>
                {/* Nömrə + xətt */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: C.orange, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    {step.n}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 24,
                      background: '#EDEBE7', marginTop: 6,
                    }} />
                  )}
                </div>
                {/* Mətn */}
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.black, margin: '0 0 6px' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.65, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div style={{
        background: C.orange,
        padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800,
          color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.3px',
        }}>
          İlk hədiyyəni sifariş et
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 28px' }}>
          Ödənişsiz çatdırılma · Lazer yazı · Hər alışda heyvanlara yaxşılıq
        </p>
        
          href="/"
          style={{
            display: 'inline-block',
            background: '#ffffff', color: '#FF6A00',
            borderRadius: 10, padding: '14px 32px',
            fontSize: 14, fontWeight: 800,
            textDecoration: 'none', letterSpacing: 0.2,
          }}
        >
          Kataloqa bax →
        </a>
      </div>
    </div>
  );
};

export default AboutUs;