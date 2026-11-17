import { C } from '../../tokens';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

// noindex: bilinməyən URL-lər Vercel rewrite səbəbindən HTTP 200 qaytarır (soft-404). Google-un onları
// indeksləməməsi üçün robots noindex qoyulur. DİQQƏT: Sanity sorğusu XƏTA ilə bitibsə (məhsul əslində var,
// amma yüklənmədi) noindex qoyulmur — keçici şəbəkə xətası düzgün səhifəni indeksdən çıxarmasın.
export default function NotFound({ onHome, noindex = true }: { onHome: () => void; noindex?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
    {noindex && (
      <Helmet>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
    )}
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
    </>
  );
}
