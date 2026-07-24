import React from 'react';
import { C } from '../../tokens';

export default function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, margin: 0, color: C.black }}>404</h1>
        <p style={{ margin: '16px 0 24px', fontSize: 16, color: '#555555' }}>Səhifə tapılmadı.</p>
        <button
          onClick={onHome}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: C.primary,
            color: C.white,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Əsas səhifəyə qayıt
        </button>
      </div>
    </div>
  );
}
