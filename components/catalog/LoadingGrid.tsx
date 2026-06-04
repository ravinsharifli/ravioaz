import React from 'react';
import { C } from '../../tokens';

export default function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} style={{ background: C.white, borderRadius: 12, overflow: 'hidden', border: '1px solid #EDEBE7' }}>
          <div style={{ aspectRatio: '1/1', background: C.bg, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ height: 10, background: C.bg, borderRadius: 4, width: '45%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 14, background: C.bg, borderRadius: 4, width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
