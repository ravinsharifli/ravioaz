import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
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
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#8C7F77' }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>✦</div>
        <p style={{ fontSize: 15, fontWeight: 400 }}>Bu kateqoriyada məhsul yoxdur</p>
      </div>
    );
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        gap: 'clamp(12px, 2vw, 20px)',
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
    </>
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
  product, firstImage, min, max, minOld, hasDiscount,
  discountPercent, samePrice, lowStock, stock, onView, onAdd,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid #F0EAE0',
        transition: 'box-shadow 0.3s, transform 0.3s',
        boxShadow: hovered ? '0 12px 40px rgba(26,23,20,0.10)' : '0 1px 4px rgba(26,23,20,0.04)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F5EFE6' }}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, opacity: 0.15, color: '#C9A84C' }}>✦</span>
          </div>
        )}

        {/* Badges */}
        {hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#1A1714', color: '#C9A84C',
            fontSize: 10, fontWeight: 600,
            padding: '4px 10px', borderRadius: 100,
            letterSpacing: '0.5px',
          }}>
            -{discountPercent}%
          </div>
        )}

        {product.isBestSeller && !hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#C9A84C', color: '#1A1714',
            fontSize: 9, fontWeight: 600,
            padding: '4px 10px', borderRadius: 100,
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Populyar
          </div>
        )}

        {lowStock && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(220,38,38,0.85)', color: '#fff',
            fontSize: 9, fontWeight: 600,
            padding: '4px 8px', borderRadius: 100,
          }}>
            Son {stock}
          </div>
        )}

        {/* Hover overlay — Add to cart */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(26,23,20,0.7) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s',
          display: 'flex', alignItems: 'flex-end', padding: '12px',
        }}>
          <button
            onClick={e => { e.stopPropagation(); onAdd(); }}
            style={{
              width: '100%', padding: '11px',
              borderRadius: 10, border: 'none',
              background: '#C9A84C', color: '#1A1714',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'transform 0.3s',
            }}
          >
            <ShoppingBag size={14} />
            Sifariş et
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px 18px' }}>
        {product.category && (
          <span style={{
            fontSize: 9, fontWeight: 500, color: '#C9A84C',
            letterSpacing: '2px', textTransform: 'uppercase',
            display: 'block', marginBottom: 6,
          }}>
            {product.category}
          </span>
        )}

        <h3 style={{
          margin: '0 0 12px', fontSize: 14, fontWeight: 500,
          color: '#1A1714', lineHeight: 1.4,
          fontFamily: "'DM Sans', sans-serif",
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {hasDiscount && (
              <span style={{
                fontSize: 11, color: '#C0B8B0',
                textDecoration: 'line-through', display: 'block', lineHeight: 1, marginBottom: 2,
              }}>
                {minOld!.toFixed(0)} ₼
              </span>
            )}
            <span style={{
              fontSize: 17, fontWeight: 600, color: '#1A1714',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {min.toFixed(0)}{!samePrice ? `–${max.toFixed(0)}` : ''} <span style={{ color: '#C9A84C' }}>₼</span>
            </span>
          </div>

          {product.variants && product.variants.length > 1 && (
            <span style={{
              fontSize: 10, color: '#8C7F77',
              background: '#F5EFE6', borderRadius: 100,
              padding: '3px 10px', fontWeight: 500,
            }}>
              {product.variants.length} variant
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;