import React from 'react';
import { C } from '../../tokens';
import { useTranslation } from 'react-i18next';

export default function NotFound({ onHome }: { onHome: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, margin: 0, color: C.black }}>404</h1>
        <p style={{ margin: '16px 0 24px', fontSize: 16, color: '#555555' }}>{t('notFound.body')}</p>
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
          {t('notFound.homeButton')}
        </button>
      </div>
    </div>
  );
}
