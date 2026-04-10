import React, { useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onViewProduct }) => {
  const getPriceRange = (product: Product) => {
    const variants = product.variants || [];
    if (!variants.length) return { min: 0, max: 0, minOld: null, hasDiscount: false, discountPercent: 0 };
    const effectivePrices = variants.map(v => v.discountPrice ?? v.price);
    const originalPrices = variants.map(v => v.price);
    const min = Math.min(...effectivePrices);
    const max = Math.max(...effectivePrices);
    const minOld = Math.min(...originalPrices);
    const hasDiscount = variants.some(v => v.discountPrice && v.discountPrice < v.price);
    const discountPercent = hasDiscount ? Math.round(((minOld - min) / minOld) * 100) : 0;
    return { min, max, minOld, hasDiscount, discountPercent };
  };

  if (!products.length) {
    return (
      <div style={{
        textAlign: 'center' as const,
        padding: '80px 24px',
        color: '#8A7F72',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '1px solid #C8BFB2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 20, color: '#C8BFB2',
        }}>◇</div>
        <p style={{ fontSize: 13, fontWeight: 400, letterSpacing: 1 }}>Bu kateqoriyada məhsul yoxdur</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
      gap: 'clamp(16px, 2.5vw, 28px)',
    }}>
      {products.map(product => {
        const firstVariant = product.variants?.[0];
        if (!firstVariant) return null;
        const firstImage = firstVariant.images?.[0];
        const { min, max, minOld, hasDiscount, discountPercent } = getPriceRange(product);
        const samePrice = min === max;
        const stock = (product.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
        const lowStock = stock > 0 && stock <= 5;

        return (
          <ProductCard
            key={product.id}
            product={product}
            firstImage={firstImage}
            min={min} max={max} minOld={minOld}
            hasDiscount={hasDiscount} discountPercent={discountPercent}
            samePrice={samePrice} lowStock={lowStock} stock={stock}
            onView={() => onViewProduct(product)}
            onAdd={() => onAddToCart(product)}
          />
        );
      })}
    </div>
  );
};

interface CardProps {
  product: Product;
  firstImage?: string;
  min: number; max: number; minOld: number | null;
  hasDiscount: boolean; discountPercent: number;
  samePrice: boolean; lowStock: boolean; stock: number;
  onView: () => void; onAdd: () => void;
}

const ProductCard: React.FC<CardProps> = ({
  product, firstImage, min, max, minOld,
  hasDiscount, discountPercent, samePrice, lowStock, stock,
  onView, onAdd,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        transition: 'transform 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Image container */}
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        overflow: 'hidden',
        background: '#EDE8DF',
        borderRadius: 3,
      }}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 48, opacity: 0.1, color: '#B8952A' }}>◇</span>
          </div>
        )}

        {/* Badges top-left */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          {hasDiscount && (
            <span style={{
              background: '#1B2A4A', color: '#B8952A',
              fontSize: 9, fontWeight: 700,
              padding: '4px 10px', borderRadius: 2,
              letterSpacing: 1.5, textTransform: 'uppercase' as const,
            }}>−{discountPercent}%</span>
          )}
          {product.isBestSeller && !hasDiscount && (
            <span style={{
              background: '#B8952A', color: '#F5F0E8',
              fontSize: 9, fontWeight: 700,
              padding: '4px 10px', borderRadius: 2,
              letterSpacing: 1.5, textTransform: 'uppercase' as const,
            }}>Populyar</span>
          )}
        </div>

        {/* Low stock badge */}
        {lowStock && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(220,38,38,0.88)', color: '#fff',
            fontSize: 9, fontWeight: 600,
            padding: '4px 8px', borderRadius: 2, letterSpacing: 1,
          }}>Son {stock}</span>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(27,42,74,0.55)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          display: 'flex', flexDirection: 'column' as const,
          alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '20px',
        }}>
          <button
            onClick={e => { e.stopPropagation(); onView(); }}
            style={{
              width: '100%', padding: '12px',
              background: 'rgba(245,240,232,0.95)',
              border: 'none', borderRadius: 2,
              fontSize: 10, fontWeight: 600, letterSpacing: 2,
              textTransform: 'uppercase' as const,
              color: '#1B2A4A', cursor: 'pointer',
              fontFamily: "'Jost', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transform: hovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.35s ease',
            }}
          >
            <Eye size={13} /> Bax
          </button>
          <button
            onClick={e => { e.stopPropagation(); onAdd(); }}
            style={{
              width: '100%', padding: '12px',
              background: '#B8952A',
              border: 'none', borderRadius: 2,
              fontSize: 10, fontWeight: 600, letterSpacing: 2,
              textTransform: 'uppercase' as const,
              color: '#F5F0E8', cursor: 'pointer',
              fontFamily: "'Jost', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transform: hovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.4s ease',
            }}
          >
            <ShoppingBag size={13} /> Sifariş et
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 4px 20px' }}>
        {product.category && (
          <span style={{
            fontSize: 9, letterSpacing: 2, fontWeight: 600,
            textTransform: 'uppercase' as const, color: '#B8952A',
            display: 'block', marginBottom: 6,
          }}>{product.category}</span>
        )}

        <h3 style={{
          margin: '0 0 12px',
          fontFamily: "'Jost', sans-serif",
          fontSize: 14, fontWeight: 500, color: '#1B2A4A',
          lineHeight: 1.45,
          display: '-webkit-box' as any,
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as any,
          overflow: 'hidden',
        }}>{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {hasDiscount && minOld && (
              <span style={{
                fontSize: 11, color: '#B0A8A0',
                textDecoration: 'line-through',
                display: 'block', lineHeight: 1, marginBottom: 3,
              }}>{minOld.toFixed(0)} ₼</span>
            )}
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 600,
              color: '#1B2A4A',
            }}>
              {min.toFixed(0)}{!samePrice ? `–${max.toFixed(0)}` : ''}{' '}
              <span style={{ color: '#B8952A', fontSize: 14, fontWeight: 400 }}>₼</span>
            </span>
          </div>

          {product.variants && product.variants.length > 1 && (
            <span style={{
              fontSize: 9, letterSpacing: 1, fontWeight: 600,
              textTransform: 'uppercase' as const,
              color: '#8A7F72', background: '#EDE8DF',
              borderRadius: 2, padding: '4px 10px',
              flexShrink: 0,
            }}>{product.variants.length} variant</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;