import React from 'react';
import { useTranslation } from 'react-i18next';
import { C } from '../../tokens';

export default function InfoStrips() {
  const { t } = useTranslation();

  const strips = [
    {
      icon: '🚚',
      title: t('home.infoStrips.delivery.title'),
      desc: t('home.infoStrips.delivery.desc'),
    },
    {
      icon: '🐾',
      title: t('home.infoStrips.charity.title'),
      desc: t('home.infoStrips.charity.desc'),
    },
    {
      icon: '✍️',
      title: t('home.infoStrips.engraving.title'),
      desc: t('home.infoStrips.engraving.desc'),
    },
  ];

  return (
    <div style={{ background: C.white, borderBottom: '1px solid #EDEBE7' }}>
      <div className="ravio-info-strips-wrap">
        {strips.map((s) => (
          <div key={s.title} className="ravio-strip-item">
            <span className="ravio-strip-icon">{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.black, marginBottom: 1 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 400 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .ravio-info-strips-wrap {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .ravio-strip-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-left: 1px solid #EDEBE7;
        }
        .ravio-strip-item:first-child { border-left: none; }
        .ravio-strip-icon { font-size: 24px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .ravio-info-strips-wrap {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
            padding: 0 16px;
          }
          .ravio-info-strips-wrap::-webkit-scrollbar { display: none; }
          .ravio-strip-item {
            flex-shrink: 0;
            border-left: none;
            border-right: 1px solid #EDEBE7;
            padding: 12px 16px;
          }
          .ravio-strip-item:last-child { border-right: none; }
          .ravio-strip-icon { font-size: 20px; }
        }
      `}</style>
    </div>
  );
}
