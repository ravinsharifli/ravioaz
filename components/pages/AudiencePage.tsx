import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, F } from '../../tokens';
import { Product, AudienceCategory } from '../../types';
import { SITE_URL } from '../../constants/seo';
import { getLangFromPath, withLangPrefix } from '../../i18n/useLocalizedNav';
import { localizedAudienceName } from '../../lib/productLocale';
import ProductGrid from '../ProductGrid';
import LoadingGrid from '../catalog/LoadingGrid';

interface AudiencePageProps {
  audienceCategories: AudienceCategory[];
  products: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}

export default function AudiencePage({ audienceCategories, products, loading, openProduct }: AudiencePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const lang = getLangFromPath(location.pathname);

  const current = useMemo(
    () => audienceCategories.find((a) => a.slug === slug) || null,
    [audienceCategories, slug]
  );

  const filteredProducts = useMemo(
    () => (slug ? products.filter((p) => p.audienceCategories?.includes(slug)) : []),
    [products, slug]
  );

  // ── Bölmə tapılmadı (silinib və ya səhv link) ─────────────────────────────
  // audienceCategories hələ yüklənməyibsə (loading), səhv "tapılmadı" göstərməyək.
  if (!current && !loading) {
    return (
      <div style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto', textAlign: 'center' as const }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', fontFamily: F.sans, color: C.black }}>
          {t('audiencePage.notFoundTitle')}
        </h1>
        <p style={{ color: C.textSec, margin: '0 0 20px', fontSize: 14 }}>{t('audiencePage.notFoundText')}</p>
        <Link
          to={withLangPrefix('/mehsullar', lang)}
          style={{
            display: 'inline-block', padding: '11px 22px', background: C.primary, color: C.white,
            borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: F.sans, textDecoration: 'none',
          }}
        >
          {t('audiencePage.notFoundCta')}
        </Link>
      </div>
    );
  }

  const name = current ? localizedAudienceName(current, lang) : '';
  // Sanity-də yazılmış səhifə mətni (boşdursa heç nə göstərilmir). EN səhifədə AZ mətn göstərilmir.
  const introText = ((lang === 'en' ? current?.descriptionEn : current?.description) || '').trim();
  const introParagraphs = introText ? introText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean) : [];
  // Google başlığı/təsviri: Sanity-dəki sahə (yalnız AZ), boşdursa avtomatik şablon.
  const metaTitle = (lang === 'az' && current?.seoTitle?.trim()) || t('audiencePage.metaTitleTemplate', { name });
  const metaDescription = (lang === 'az' && current?.seoDescription?.trim()) || t('audiencePage.metaDescriptionTemplate', { name });
  const canonicalUrl = `${SITE_URL}${withLangPrefix(`/kime/${slug}`, lang)}`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div style={{ padding: '24px 24px 0', maxWidth: 1280, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', fontFamily: F.sans, color: C.black }}>
          {name || '\u00A0'}
        </h1>
        {introParagraphs.length > 0 && (
          <div style={{ maxWidth: 760, margin: '0 0 12px' }}>
            {introParagraphs.map((p, i) => (
              <p key={i} style={{ color: C.textSec, margin: '0 0 10px', fontSize: 15, lineHeight: 1.65 }}>{p}</p>
            ))}
          </div>
        )}
        <p style={{ color: C.textSec, margin: '0 0 20px', fontSize: 14 }}>
          {loading ? t('productsPage.loading') : t('productsPage.countSuffix', { count: filteredProducts.length })}
        </p>
      </div>
      <div style={{ padding: '0 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
        {loading ? (
          <LoadingGrid />
        ) : (
          <ProductGrid products={filteredProducts} onAddToCart={openProduct} onViewProduct={openProduct} />
        )}
      </div>
    </>
  );
}
