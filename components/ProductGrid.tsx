import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  title?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onViewProduct, title }) => {

  const getPriceRange = (product: Product) => {
    const variants = product.variants || [];
    if (variants.length === 0) return { min: 0, max: 0, minOld: null, hasDiscount: false, discountPercent: 0 };
    const effectivePrices = variants.map(v => v.discountPrice ?? v.price);
    const originalPrices = variants.map(v => v.price);
    const min = Math.min(...effectivePrices);
    const max = Math.max(...effectivePrices);
    const minOld = Math.min(...originalPrices);
    const hasDiscount = variants.some(v => v.discountPrice && v.discountPrice < v.price);
    const discountPercent = hasDiscount ? Math.round(((minOld - min) / minOld) * 100) : 0;
    return { min, max, minOld, hasDiscount, discountPercent };
  };

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(22px,3.5vw,30px)',
            fontWeight: 700, color: '#1C1714',
            margin: 0, letterSpacing: '-0.2px',
          }}>
            {title}
          </h2>
          <span style={{ color: '#BF912E', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            {products.length} məhsul
          </span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(12px,2vw,20px)',
      }}>
        {products.map((product) => {
          const firstVariant = product.variants?.[0];
          if (!firstVariant) return null;
          const firstImage = firstVariant.images?.[0];
          const { min, max, minOld, hasDiscount, discountPercent } = getPriceRange(product);
          const samePrice = min === max;

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onViewProduct(product)}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid #E8E2D9',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 12px 40px rgba(28,23,20,0.12)';
                el.style.borderColor = '#D5CBBF';
                el.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.boxShadow = 'none';
                el.style.borderColor = '#E8E2D9';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Image */}
              <div style={{
                position: 'relative',
                background: '#F5F1EB',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
              }}>
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="product-card-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#D5CBBF',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 12, fontWeight: 600,
                  }}>Şəkil yoxdur</div>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#1C1714', color: '#BF912E',
                    fontSize: 10, fontWeight: 900,
                    padding: '4px 9px', borderRadius: 6,
                    fontFamily: "'Nunito Sans', sans-serif",
                    letterSpacing: '0.5px',
                  }}>
                    -{discountPercent}%
                  </div>
                )}

                {/* Bestseller badge */}
                {product.isBestSeller && !hasDiscount && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#BF912E', color: '#FAF8F4',
                    fontSize: 9, fontWeight: 900,
                    padding: '4px 9px', borderRadius: 6,
                    fontFamily: "'Nunito Sans', sans-serif",
                    letterSpacing: '1px', textTransform: 'uppercase',
                  }}>
                    ★ POPULAR
                  </div>
                )}

                {/* Hover CTA */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(28,23,20,0.55) 0%, transparent 50%)',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  padding: '0 12px 14px',
                  opacity: 0, transition: 'opacity 0.3s',
                }}
                  className="card-overlay"
                  onMouseEnter={e => (e.currentTarget).style.opacity = '1'}
                  onMouseLeave={e => (e.currentTarget).style.opacity = '0'}
                >
                  <div style={{
                    display: 'flex', gap: 8, width: '100%',
                  }}>
                    <button
                      onClick={e => { e.stopPropagation(); onViewProduct(product); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '9px 0', borderRadius: 9,
                        background: 'rgba(250,248,244,0.95)',
                        border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 800,
                        color: '#1C1714', fontFamily: "'Nunito Sans', sans-serif",
                        letterSpacing: '0.3px',
                      }}
                    >
                      <Eye size={13} /> Bax
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '9px 0', borderRadius: 9,
                        background: '#BF912E', border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 800,
                        color: '#FAF8F4', fontFamily: "'Nunito Sans', sans-serif",
                        letterSpacing: '0.3px',
                      }}
                    >
                      <ShoppingBag size={13} /> Əlavə et
                    </button>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 14px 16px' }}>
                <h3 style={{
                  margin: '0 0 8px',
                  fontSize: 13, fontWeight: 700,
                  color: '#1C1714', lineHeight: 1.35,
                  fontFamily: "'Nunito Sans', sans-serif",
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {product.name}
                </h3>

                {product.category && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#8C7F77',
                    letterSpacing: '1px', textTransform: 'uppercase',
                    display: 'block', marginBottom: 8,
                  }}>
                    {product.category}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 4 }}>
                  <div>
                    {hasDiscount && (
                      <span style={{ fontSize: 11, color: '#B0A39B', textDecoration: 'line-through', display: 'block', lineHeight: 1 }}>
                        {minOld!.toFixed(2)} AZN
                      </span>
                    )}
                    <span style={{
                      fontSize: 'clamp(14px,2vw,16px)', fontWeight: 900,
                      color: '#BF912E', fontFamily: "'Nunito Sans', sans-serif",
                      letterSpacing: '-0.2px',
                    }}>
                      {min.toFixed(2)}{!samePrice && `–${max.toFixed(2)}`} AZN
                    </span>
                  </div>

                  {product.variants && product.variants.length > 1 && (
                    <span style={{
                      fontSize: 10, color: '#8C7F77', fontWeight: 600,
                      background: '#F2EDE5', borderRadius: 6,
                      padding: '3px 7px', flexShrink: 0,
                    }}>
                      {product.variants.length} variant
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;