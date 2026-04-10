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

  const totalStock = (product: Product) =>
    (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{
          marginBottom: 32,
          display: 'flex', alignItems: 'baseline',
          gap: 14, flexWrap: 'wrap',
        }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(24px,3.5vw,34px)',
            fontWeight: 700, color: '#1C1714',
            margin: 0, letterSpacing: '-0.3px',
          }}>
            {title}
          </h2>
          <span style={{
            color: '#9C9088', fontSize: 11, fontWeight: 700,
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            {products.length} məhsul
          </span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))',
        gap: 'clamp(14px,2.5vw,22px)',
      }}>
        {products.map((product) => {
          const firstVariant = product.variants?.[0];
          if (!firstVariant) return null;
          const firstImage = firstVariant.images?.[0];
          const { min, max, minOld, hasDiscount, discountPercent } = getPriceRange(product);
          const samePrice = min === max;
          const stock = totalStock(product);
          const lowStock = stock > 0 && stock <= 5;

          return (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onViewProduct(product)}
            >
              {/* IMAGE */}
              <div style={{
                position: 'relative',
                background: '#F0EAE0',
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
                    color: '#C9A84C', opacity: 0.25, fontSize: 48,
                  }}>✦</div>
                )}

                {hasDiscount && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#1C1714', color: '#C9A84C',
                    fontSize: 10, fontWeight: 800,
                    padding: '4px 10px', borderRadius: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '0.5px',
                  }}>
                    -{discountPercent}%
                  </div>
                )}

                {product.isBestSeller && !hasDiscount && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: 'linear-gradient(135deg,#C9A84C,#E8C97A)',
                    color: '#0F0D0B',
                    fontSize: 9, fontWeight: 800,
                    padding: '4px 10px', borderRadius: 8,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '1px', textTransform: 'uppercase',
                  }}>
                    ★ POPULAR
                  </div>
                )}

                {lowStock && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    background: 'rgba(220,38,38,0.88)',
                    color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 6,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Son {stock} ədəd
                  </div>
                )}

                {/* Hover overlay */}
                <div
                  className="card-overlay"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(15,13,11,0.75) 0%, rgba(15,13,11,0.1) 55%, transparent 100%)',
                    display: 'flex', alignItems: 'flex-end',
                    padding: '0 12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                    <button
                      onClick={e => { e.stopPropagation(); onViewProduct(product); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 5,
                        padding: '9px 0', borderRadius: 10,
                        background: 'rgba(250,248,244,0.93)',
                        border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 700, color: '#1C1714',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      <Eye size={12} /> Bax
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                      style={{
                        flex: 1.4, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 5,
                        padding: '9px 0', borderRadius: 10,
                        background: 'linear-gradient(135deg,#C9A84C,#E8C97A)',
                        border: 'none', cursor: 'pointer',
                        fontSize: 11, fontWeight: 800, color: '#0F0D0B',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      <ShoppingBag size={12} /> Səbətə əlavə et
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD BODY */}
              <div style={{ padding: '14px 16px 18px' }}>
                {product.category && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: '#C9A84C',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    display: 'block', marginBottom: 6,
                  }}>
                    {product.category}
                  </span>
                )}

                <h3 style={{
                  margin: '0 0 10px',
                  fontSize: 14, fontWeight: 700,
                  color: '#1C1714', lineHeight: 1.4,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {product.name}
                </h3>

                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 6,
                }}>
                  <div>
                    {hasDiscount && (
                      <span style={{
                        fontSize: 11, color: '#B0A8A0',
                        textDecoration: 'line-through',
                        display: 'block', lineHeight: 1, marginBottom: 2,
                      }}>
                        {minOld!.toFixed(2)} AZN
                      </span>
                    )}
                    <span style={{
                      fontSize: 'clamp(15px,2vw,17px)', fontWeight: 800,
                      color: '#C9A84C',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: '-0.3px',
                    }}>
                      {min.toFixed(2)}{!samePrice && `–${max.toFixed(2)}`} AZN
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {product.variants && product.variants.length > 1 && (
                      <span style={{
                        fontSize: 9, color: '#9C9088', fontWeight: 700,
                        background: '#F3EDE4', borderRadius: 6,
                        padding: '3px 8px', flexShrink: 0,
                      }}>
                        {product.variants.length} variant
                      </span>
                    )}
                    {product.hasBulkDiscount && (
                      <span style={{
                        fontSize: 9, color: '#16a34a', fontWeight: 700,
                        background: '#f0fdf4', borderRadius: 6,
                        padding: '3px 8px', flexShrink: 0,
                        border: '1px solid #bbf7d0',
                      }}>
                        Toplu ✓
                      </span>
                    )}
                  </div>
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