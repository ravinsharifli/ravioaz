import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, F } from '../../tokens';
import { Product } from '../../types';
import { SITE_URL } from '../../constants/seo';
import { getLangFromPath, withLangPrefix } from '../../i18n/useLocalizedNav';
import CatalogLayout from '../catalog/CatalogLayout';

interface ProductsPageProps {
  categories: string[];
  categoryNameMap?: Record<string, string>;
  products: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}

export default function ProductsPage({ categories, categoryNameMap, products, loading, openProduct }: ProductsPageProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const lang = getLangFromPath(location.pathname);
  const canonicalUrl = `${SITE_URL}${withLangPrefix('/mehsullar', lang)}`;

  return (
    <>
      <Helmet>
        <title>{t('productsPage.meta.title')}</title>
        <meta name="description" content={t('productsPage.meta.description')} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div style={{ padding: '24px 24px 0', maxWidth: 1280, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', fontFamily: F.sans }}>
          {t('productsPage.title')}
        </h1>
        <p style={{ color: C.textSec, margin: 0, fontSize: 14 }}>
          {loading ? t('productsPage.loading') : t('productsPage.countSuffix', { count: products.length })}
        </p>
      </div>
      <div style={{ padding: '0 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <CatalogLayout
          activeSlug={null}
          activeCategory={null}
          categories={categories}
          categoryNameMap={categoryNameMap}
          products={products}
          filteredProducts={products}
          loading={loading}
          openProduct={openProduct}
        />
      </div>
    </>
  );
}
