import React, { useState } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onViewProduct }) => {
  const getPriceInfo = (product: Product) => {
    const variants = product.variants || [];
    if (!variants.length) return { min: 0, max: 0, minOld: null, hasDiscount: false, pct: 0 };
    const eff = variants.map(v => v.discountPrice ?? v.price);
    const orig = variants.map(v => v.price);
    const min = Math.min(...eff);
    const max = Math.max(...eff);
    const minOld = Math.min(...orig);
    const hasDiscount = variants.some(v => v.discountPrice && v.discountPrice < v.price);
    const pct = hasDiscount ? Math.round(((minOld - min) / minOld) * 100) : 0;
    return { min, max, minOld, hasDiscount, pct };
  };

  if (!products.length) {
    return (
      <div style={{ textAlign: 'center' as const, padding: '80px 24px', color: '#999' }}>
        <ShoppingBag size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.3 }} />
        <p style={{ fontSize: 15, fontFamily: "'Inter', sans-serif" }}>Bu kateqoriyada məhsul yoxdur</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
      gap: 20,
    }}>
      {products.map(product => {
        const fv = product.variants?.[0];
        if (!fv) return null;
        const img = fv.images?.[0];
        const { min, max, minOld, hasDiscount, pct } = getPriceInfo(product);
        const samePrice = min === max;
        const stock = (product.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
        const lowStock = stock > 0 && stock <= 5;
        const outOfStock = stock === 0;

        return (
          <Card
            key={product.id}
            product={product}
            img={img}
            min={min} max={max} minOld={minOld}
            hasDiscount={hasDiscount} pct={pct}
            samePrice={samePrice}
            lowStock={lowStock} outOfStock={outOfStock} stock={stock}
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
  img?: string;
  min: number; max: number; minOld: number | null;
  hasDiscount: boolean; pct: number; samePrice: boolean;
  lowStock: boolean; outOfStock: boolean; stock: number;
  onView: () => void; onAdd: () => void;
}

const Card: React.FC<CardProps> = ({
  product, img, min, max, minOld,
  hasDiscount, pct, samePrice,
  lowStock, outOfStock, stock,
  onView, onAdd,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        border: hovered ? '1px solid #E0DDD8' : '1px solid #EDEBE7',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
      onClick={onView}
    >
      {/* Image area */}
      <div style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', background: '#F5F2EC' }}>
        {img ? (
          <img
            src={img} alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={40} strokeWidth={1} color="#DDDDDD" />
          </div>
        )}

        {/* Discount badge — orange */}
        {hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#FF6A00', color: '#FFFFFF',
            fontSize: 11, fontWeight: 800,
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 0.3,
          }}>−{pct}%</div>
        )}

        {/* Popular badge — dark */}
        {product.isBestSeller && !hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#111111', color: '#FFFFFF',
            fontSize: 10, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: 0.5,
          }}>✦ Populyar</div>
        )}

        {/* Low stock — urgency orange */}
        {lowStock && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#FF6A00', color: '#FFFFFF',
            fontSize: 10, fontWeight: 700,
            padding: '4px 8px', borderRadius: 6,
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Zap size={10} fill="#FFFFFF" />
            Son {stock}
          </div>
        )}

        {/* Out of stock */}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1, fontFamily: "'Inter', sans-serif" }}>
              STOKDA YOX
            </span>
          </div>
        )}

        {/* Quick add button on hover */}
        {!outOfStock && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '0 10px 10px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.25s, transform 0.25s',
          }}>
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              style={{
                width: '100%',
                padding: '11px 0',
                background: '#FF6A00',
                color: '#FFFFFF',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                letterSpacing: 0.3,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E55E00'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF6A00'}
            >
              <ShoppingBag size={13} />
              Sifariş et
            </button>
          </div>
        )}
      </div>

      {/* Card body — F-pattern: left aligned */}
      <div style={{ padding: '14px 14px 16px' }}>
        {/* Category */}
        {product.category && (
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: '#999999',
            letterSpacing: 0.8,
            textTransform: 'uppercase' as const,
            display: 'block', marginBottom: 5,
            fontFamily: "'Inter', sans-serif",
          }}>{product.category}</span>
        )}

        {/* Product name — left, clear */}
        <h3 style={{
          margin: '0 0 10px',
          fontSize: 14, fontWeight: 600,
          color: '#111111',
          lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
          display: '-webkit-box' as any,
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as any,
          overflow: 'hidden',
        }}>{product.name}</h3>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {hasDiscount && minOld && (
              <span style={{
                fontSize: 11, color: '#BBBBBB',
                textDecoration: 'line-through',
                display: 'block', lineHeight: 1, marginBottom: 2,
                fontFamily: "'Inter', sans-serif",
              }}>{minOld.toFixed(0)} ₼</span>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{
                fontSize: 18, fontWeight: 800,
                color: hasDiscount ? '#FF6A00' : '#111111',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.5px',
              }}>
                {min.toFixed(0)}{!samePrice ? `–${max.toFixed(0)}` : ''} ₼
              </span>
            </div>
          </div>

          {/* Variant count */}
          {product.variants && product.variants.length > 1 && (
            <span style={{
              fontSize: 10, color: '#999',
              background: '#F5F2EC',
              borderRadius: 6, padding: '3px 8px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500, flexShrink: 0,
            }}>{product.variants.length} variant</span>
          )}
        </div>

        {/* Fast delivery tag */}
        <div style={{
          marginTop: 10,
          fontSize: 11, color: '#555',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: "'Inter', sans-serif",
        }}>
          <span style={{ color: '#22C55E', fontWeight: 700 }}>✓</span>
          1–3 iş günü · Bakı çatdırılma
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;