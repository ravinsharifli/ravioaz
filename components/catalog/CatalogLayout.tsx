import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C, F } from '../../tokens';
import { Product } from '../../types';
import { toCategorySlug } from '../../lib/categorySlug';
import ProductGrid from '../ProductGrid';
import LoadingGrid from './LoadingGrid';

export default function CatalogLayout({
  activeSlug,
  activeCategory,
  categories,
  products,
  filteredProducts,
  loading,
  openProduct,
}: {
  activeSlug: string | null;
  activeCategory: string | null;
  categories: string[];
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  openProduct: (p: Product) => void;
}) {
  const navigate = useNavigate();

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
            color: C.primary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}
        >
          Kateqoriyalar
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => navigate('/mehsullar')}
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
            }}
          >
            <span>Hamısı</span>
            <span style={{ fontSize: 11, opacity: 0.55 }}>{products.length}</span>
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const slug = toCategorySlug(cat);
            const sel = activeSlug === slug;
            return (
              <button
                key={cat}
                onClick={() => navigate(`/mehsullar/${slug}`)}
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
                }}
              >
                <span>{cat}</span>
                <span style={{ fontSize: 11, opacity: 0.55 }}>{count}</span>
              </button>
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
            <button
              onClick={() => navigate('/mehsullar')}
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
              }}
            >
              Hamısı
            </button>
            {categories.map((cat) => {
              const slug = toCategorySlug(cat);
              const sel = activeSlug === slug;
              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/mehsullar/${slug}`)}
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
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <ProductGrid products={filteredProducts} onAddToCart={openProduct} onViewProduct={openProduct} />
        )}
      </div>
    </div>
  );
}
