import React from 'react';
import { Zap, Gift, Star, MapPin, MessageCircle } from 'lucide-react';

const T = {
  primary: '#2F4F4F',
  gold: '#C9A227',
  border: '#E9E5DF',
  muted: '#6B7280',
  bg: '#FAF8F5',
};

const AboutUs: React.FC = () => {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 16px' }}>

      {/* BAŞLIQ */}
      <div style={{ marginBottom: 48 }}>
        <p style={{
          display: 'inline-block',
          background: '#ECE6DA', color: T.primary,
          borderRadius: 999, padding: '6px 16px',
          fontSize: 11, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16,
        }}>
          Ravio haqqında
        </p>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 800, color: '#1F1F1F',
          lineHeight: 1.1, margin: '0 0 16px',
          maxWidth: 620,
        }}>
          Hər hədiyyəyə xüsusi toxunuş —<br />
          <span style={{ color: T.primary }}>lazer dəqiqliyi ilə.</span>
        </h1>
        <p style={{
          fontSize: 17, lineHeight: 1.8,
          color: T.muted, maxWidth: 580, margin: 0,
        }}>
          Ravio — Bakıda fəaliyyət göstərən fərdiləşdirilmiş aksessuar və hədiyyə brendidir.
          Hər məhsul sifariş əsasında hazırlanır, hər yazı müştərinin istəyinə görə lazerləyirik.
        </p>
      </div>

      {/* İKİ SÜTUN */}
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 48 }}>

        {/* Sol — mətn */}
        <div style={{ flex: '1 1 340px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1F1F1F', marginBottom: 16 }}>
            Necə işləyirik?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                n: '01',
                title: 'Məhsul seçirsən',
                text: 'Saytdan istədiyin məhsulu seçirsən — qolbaq, boyunbağı, giftbox, məzun lenti və ya başqa aksessuar.',
              },
              {
                n: '02',
                title: 'Yazını bildirirsən',
                text: 'Sifarişdə üzərinə yazılacaq mətni daxil edirsən. İstəsən şəkil də əlavə edə bilərsən.',
              },
              {
                n: '03',
                title: 'WhatsApp vasitəsilə təsdiq',
                text: 'Sifariş WhatsApp-a yönləndirilir, bizdən təsdiq gəlir. Beh ödənişi alınır.',
              },
              {
                n: '04',
                title: '1–2 gündə hazır',
                text: 'Məhsulun hazırlanır, paketlənir. Metrodaxili və ya kuryer ilə təhvil verilir.',
              },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  background: T.primary, color: '#fff',
                  width: 36, height: 36, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  {step.n}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1F1F1F', margin: '0 0 4px' }}>
                    {step.title}
                  </p>
                  <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.7 }}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ — üstünlüklər kartları */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              icon: <Zap size={20} color="#C9A227" />,
              title: 'Lazer texnologiyası',
              text: 'Hər yazı yüksək dəqiqlikli lazer ilə həkk olunur — solmur, silinmir.',
            },
            {
              icon: <Gift size={20} color="#C9A227" />,
              title: 'Hazır hədiyyəlik paket',
              text: 'Premium qutu, lent, qeyd kartı — sifariş edərkən özün seçirsən.',
            },
            {
              icon: <Star size={20} color="#C9A227" />,
              title: 'Hər sifariş unikaldır',
              text: 'Fabrik istehsalı deyil. Sənin adın, sənin yazın, sənin hədiyyən.',
            },
            {
              icon: <MapPin size={20} color="#C9A227" />,
              title: 'Bakı + regionlar',
              text: 'Metro və ya kuryer çatdırılması. Regionlara kargo və ya poçt şirkəti ilə göndəririk.',
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: '#fff',
              border: `1.5px solid ${T.border}`,
              borderRadius: 16, padding: '18px 20px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{
                background: '#FFF8EC', borderRadius: 10,
                width: 40, height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1F1F1F', margin: '0 0 4px' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.7 }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALT BANER — WhatsApp */}
      <div style={{
        background: T.primary,
        borderRadius: 24, padding: '36px 32px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 8px' }}>
            Sualın var? Yazarsan.
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>
            Məhsul, qiymət, çatdırılma — hər şeyi WhatsApp-dan soruşa bilərsən.
          </p>
        </div>
        <a
          href="https://wa.me/994519831483?text=Salam%2C%20məlumat%20almaq%20istəyirəm"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#25D366', color: '#fff',
            padding: '13px 24px', borderRadius: 12,
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}
        >
          <MessageCircle size={18} />
          WhatsApp-da yaz
        </a>
      </div>
    </div>
  );
};

export default AboutUs;