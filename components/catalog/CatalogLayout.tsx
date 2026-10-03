import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { C, F } from '../../tokens';
import { Product } from '../../types';
import { toCategorySlug } from '../../lib/categorySlug';
import { useLocalizedNav, withLangPrefix } from '../../i18n/useLocalizedNav';
import { localizedCategoryName } from '../../lib/productLocale';
import ProductGrid from '../ProductGrid';
import LoadingGrid from './LoadingGrid';

export default function CatalogLayout({
  activeSlug,
  activeCategory,
  categories,
  categoryNameMap,
  products,
  filteredProducts,
  loading,
  openProduct,
}: {
  activeSlug: string | null;
  activeCategory: string | null;
  categories: string[];
  categoryNameMap?: Record<string, string>;
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}) {
  const { t } = useTranslation();
  // useLocalizedNav (useNavigate əvəzinə): /en altında olanda kateqoriya
  // keçidləri /en prefiksini itirmirdi — əvvəllər useNavigate birbaşa
  // işlədildiyi üçün /en/mehsullar/... səhifəsindən "Hamısı" düyməsinə
  // basanda istifadəçi sükutla Azərbaycanca versiyaya atılırdı.
  const { lang } = useLocalizedNav();

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <aside
        className="r-desktop-nav r-catalog-aside"
        style={{
          flexShrink: 0,
          width: 200,
          position: 'sticky',
          top: 110,
          maxHeight: 'calc(100vh - 130px)',
          overflowY: 'auto',
          paddingRight: 8,
          scrollbarWidth: 'none',
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.primaryText,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}
        >
          {t('catalog.categories')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link
            to={withLangPrefix('/mehsullar', lang)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: !activeSlug ? C.black : 'transparent',
              color: !activeSlug ? C.white : '#555555',
              fontSize: 13,
              fontWeight: !activeSlug ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: F.sans,
              transition: 'all 0.15s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <span>{t('catalog.all')}</span>
            <span style={{ fontSize: 11, opacity: 0.55 }}>{products.length}</span>
          </Link>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const slug = toCategorySlug(cat);
            const sel = activeSlug === slug;
            return (
              <Link
                key={cat}
                to={withLangPrefix(`/mehsullar/${slug}`, lang)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: sel ? C.black : 'transparent',
                  color: sel ? C.white : '#555555',
                  fontSize: 13,
                  fontWeight: sel ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: F.sans,
                  transition: 'all 0.15s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
              >
                <span>{localizedCategoryName(cat, lang, categoryNameMap)}</span>
                <span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        {categories.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'nowrap',
              marginBottom: 20,
              overflowX: 'auto',
              paddingBottom: 8,
              scrollbarWidth: 'none',
            }}
            className="r-mobile-nav"
          >
            <Link
              to={withLangPrefix('/mehsullar', lang)}
              style={{
                padding: '7px 16px',
                borderRadius: 100,
                flexShrink: 0,
                border: `1.5px solid ${!activeSlug ? C.black : C.borderMid}`,
                background: !activeSlug ? C.black : 'transparent',
                color: !activeSlug ? C.white : C.textSec,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F.sans,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {t('catalog.all')}
            </Link>
            {categories.map((cat) => {
              const slug = toCategorySlug(cat);
              const sel = activeSlug === slug;
              return (
                <Link
                  key={cat}
                  to={withLangPrefix(`/mehsullar/${slug}`, lang)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 100,
                    flexShrink: 0,
                    border: `1.5px solid ${sel ? C.black : C.borderMid}`,
                    background: sel ? C.black : 'transparent',
                    color: sel ? C.white : C.textSec,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: F.sans,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {localizedCategoryName(cat, lang, categoryNameMap)}
                </Link>
              );
            })}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <ProductGrid
            products={filteredProducts}
            onAddToCart={openProduct}
            onViewProduct={openProduct}
            categoryNameMap={categoryNameMap}
          />
        )}
      </div>
    </div>
  );
}
