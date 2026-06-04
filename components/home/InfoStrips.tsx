import React from 'react';
import { C } from '../../tokens';

export default function InfoStrips() {
  const strips = [
    { icon: '🚚', title: 'Ödənişsiz çatdırılma', desc: 'Bütün sifarişlər' },
    { icon: '⚡', title: '1–3 iş günü', desc: 'Sürətli hazırlıq' },
    { icon: '✍️', title: 'Lazer yazısı', desc: 'Ad, tarix, mesaj' },
    { icon: '🎁', title: 'Hədiyyəlik qutu', desc: 'Fərqli qutu seçimi' },
  ];

  return (
    <div style={{ background: C.white, borderBottom: '1px solid #EDEBE7' }}>
      <div className="ravio-info-strips-wrap">
        {strips.map((s, i) => (
          <div key={s.title} className={`ravio-strip-item ravio-strip-${i}`}>
            <span className="ravio-strip-icon">{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.black, marginBottom: 1, whiteSpace: 'nowrap' }}>
                {s.title}
              </div>
              <div style={{ fontSize: 11, color: '#888888', fontWeight: 400, whiteSpace: 'nowrap' }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .ravio-info-strips-wrap {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .ravio-strip-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px;
          border-left: 1px solid #EDEBE7;
        }
        .ravio-strip-item:first-child { border-left: none; }
        .ravio-strip-icon { font-size: 22px; flex-shrink: 0; }
        @media (max-width: 640px) {
          .ravio-info-strips-wrap {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
            padding: 0 16px;
            gap: 0;
          }
          .ravio-info-strips-wrap::-webkit-scrollbar { display: none; }
          .ravio-strip-item {
            flex-shrink: 0;
            border-left: none;
            border-right: 1px solid #EDEBE7;
            padding: 10px 14px;
            gap: 8px;
          }
          .ravio-strip-item:last-child { border-right: none; }
          .ravio-strip-icon { font-size: 18px; }
        }
        @media (max-width: 1024px) and (min-width: 641px) {
          .ravio-info-strips-wrap { grid-template-columns: repeat(2, 1fr); }
          .ravio-strip-0 { border-left: none; border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-1 { border-bottom: 1px solid #EDEBE7; }
          .ravio-strip-2 { border-left: none; }
        }
      `}</style>
    </div>
  );
}
