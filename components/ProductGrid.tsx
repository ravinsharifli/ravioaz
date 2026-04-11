import React, { useState } from 'react';
import { ShoppingBag, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const eff  = variants.map(v => v.discountPrice ?? v.price);
    const orig = variants.map(v => v.price);
    const min  = Math.min(...eff);
    const max  = Math.max(...eff);
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
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))',
      gap: 20,
    }}>
      {products.map(product => {
        const fv = product.variants?.[0];
        if (!fv) return null;
        const { min, max, minOld, hasDiscount, pct } = getPriceInfo(product);
        const stock    = (product.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
        const lowStock = stock > 0 && stock <= 5;
        const outOfStock = stock === 0;
        return (
          <Card
            key={product.id}
            product={product}
            min={min} max={max} minOld={minOld}
            hasDiscount={hasDiscount} pct={pct}
            samePrice={min === max}
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
  min: number; max: number; minOld: number | null;
  hasDiscount: boolean; pct: number; samePrice: boolean;
  lowStock: boolean; outOfStock: boolean; stock: number;
  onView: () => void; onAdd: () => void;
}

const Card: React.FC<CardProps> = ({
  product, min, max, minOld,
  hasDiscount, pct, samePrice,
  lowStock, outOfStock, stock,
  onView, onAdd,
}) => {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx]   = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const allImages = (product.variants || []).flatMap(v => v.images || []).filter(Boolean);
  const images    = allImages.length > 0 ? allImages : [];
  const totalImgs = images.length;

  const nextImg = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i + 1) % totalImgs); };
  const prevImg = (e: React.MouseEvent) => { e.stopPropagation(); setImgIdx(i => (i - 1 + totalImgs) % totalImgs); };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setImgIdx(i => diff > 0 ? (i + 1) % totalImgs : (i - 1 + totalImgs) % totalImgs);
    setTouchStart(null);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF', borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer',
        border: hovered ? '1px solid #E0DDD8' : '1px solid #EDEBE7',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
      onClick={onView}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F5F2EC' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <img
            src={images[imgIdx]} alt={product.name}
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

        {/* Discount badge — image corner only */}
        {hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#FF6A00', color: '#FFFFFF',
            fontSize: 11, fontWeight: 800,
            padding: '4px 10px', borderRadius: 6,
          }}>−{pct}%</div>
        )}

        {/* Popular badge */}
        {product.isBestSeller && !hasDiscount && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: '#111111', color: '#FFFFFF',
            fontSize: 10, fontWeight: 700,
            padding: '4px 10px', borderRadius: 6,
          }}>✦ Populyar</div>
        )}

        {/* Low stock */}
        {lowStock && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#FF6A00', color: '#FFFFFF',
            fontSize: 10, fontWeight: 700,
            padding: '4px 8px', borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Zap size={10} fill="#FFFFFF" />Son {stock}
          </div>
        )}

        {/* Out of stock */}
        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#999', letterSpacing: 1 }}>STOKDA YOX</span>
          </div>
        )}

        {/* Image navigation — show on hover if multiple images */}
        {totalImgs > 1 && hovered && (
          <>
            <button onClick={prevImg} style={{
              position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.92)', border: '1px solid #EDEBE7',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}><ChevronLeft size={14} /></button>
            <button onClick={nextImg} style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.92)', border: '1px solid #EDEBE7',
              borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}><ChevronRight size={14} /></button>
            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 4,
            }}>
              {images.map((_, i) => (
                <div key={i} style={{
                  width: i === imgIdx ? 16 : 5, height: 5,
                  borderRadius: 3, background: i === imgIdx ? '#FF6A00' : 'rgba(0,0,0,0.25)',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>
          </>
        )}

        {/* Swipe hint on mobile — show if multiple images */}
        {totalImgs > 1 && !hovered && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.45)', color: '#FFFFFF',
            fontSize: 9, fontWeight: 600, padding: '3px 8px',
            borderRadius: 100, letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>⟵⟶</span> {totalImgs}
          </div>
        )}

        {/* Quick add — hover */}
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
                width: '100%', padding: '11px 0',
                background: '#FF6A00', color: '#FFFFFF',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E55E00'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF6A00'}
            >
              <ShoppingBag size={13} /> Sifariş et
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 14px 16px' }}>
        {product.category && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#999999',
            letterSpacing: 0.8, textTransform: 'uppercase' as const,
            display: 'block', marginBottom: 5,
            fontFamily: "'Inter', sans-serif",
          }}>{product.category}</span>
        )}

        <h3 style={{
          margin: '0 0 10px', fontSize: 14, fontWeight: 600,
          color: '#111111', lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
          display: '-webkit-box' as any,
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
          overflow: 'hidden',
        }}>{product.name}</h3>

        {/* Price row — NO duplicate discount badge here */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            {hasDiscount && minOld !== null && (
              <span style={{
                fontSize: 11, color: '#BBBBBB',
                textDecoration: 'line-through',
                display: 'block', lineHeight: 1, marginBottom: 2,
                fontFamily: "'Inter', sans-serif",
              }}>{minOld.toFixed(2)} ₼</span>
            )}
            <span style={{
              fontSize: 18, fontWeight: 800,
              color: hasDiscount ? '#FF6A00' : '#111111',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.5px',
            }}>
              {min.toFixed(2)}{!samePrice ? `–${max.toFixed(2)}` : ''} ₼
            </span>
          </div>

          {product.variants && product.variants.length > 1 && (
            <span style={{
              fontSize: 10, color: '#999',
              background: '#F5F2EC', borderRadius: 6,
              padding: '3px 8px', fontWeight: 500,
              fontFamily: "'Inter', sans-serif", flexShrink: 0,
            }}>{product.variants.length} variant</span>
          )}
        </div>

        {/* Free delivery tag */}
        <div style={{
          marginTop: 10, fontSize: 11, color: '#555',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: "'Inter', sans-serif",
        }}>
          <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
          Ödənişsiz çatdırılma
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;