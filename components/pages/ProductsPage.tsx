import React from 'react';
import { Helmet } from 'react-helmet-async';
import { C, F } from '../../tokens';
import { Product } from '../../types';
import { SITE_URL } from '../../constants/seo';
import CatalogLayout from '../catalog/CatalogLayout';

interface ProductsPageProps {
  categories: string[];
  products: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}

export default function ProductsPage({ categories, products, loading, openProduct }: ProductsPageProps) {
  return (
    <>
      <Helmet>
        <title>Bütün Məhsullar | Ravio</title>
        <meta
          name="description"
          content="Ravio-nun bütün fərdi hədiyyələri — lazer yazılı qolbaq, təsbeh, domino, giftbox. Bakıda pulsuz çatdırılma, 1–3 iş günü."
        />
        <link rel="canonical" href={`${SITE_URL}/mehsullar`} />
      </Helmet>
      <div style={{ padding: '24px 24px 0', maxWidth: 1280, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', fontFamily: F.sans }}>
          Bütün məhsullar
        </h1>
        <p style={{ color: C.textSec, margin: 0, fontSize: 14 }}>
          {loading ? 'Yüklənir...' : `${products.length} məhsul · Ödənişsiz çatdırılma`}
        </p>
      </div>
      <div style={{ padding: '0 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <CatalogLayout
          activeSlug={null}
          activeCategory={null}
          categories={categories}
          products={products}
          filteredProducts={products}
          loading={loading}
          openProduct={openProduct}
        />
      </div>
    </>
  );
}
