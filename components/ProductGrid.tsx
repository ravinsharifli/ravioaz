import React, { useState } from 'react';
import { C, F } from '../tokens';
import { ShoppingBag, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { toWebP } from '../lib/image';

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
        <p style={{ fontSize: 15, fontFamily: F.sans }}>Bu kateqoriyada məhsul yoxdur</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ravio-product-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1200px) {
          .ravio-product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .ravio-product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
        @media (max-width: 400px) {
          .ravio-product-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
      `}</style>
      <div className="ravio-product-grid">
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
    </>
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
  const [hovered, setHovered]       = useState(false);
  const [imgIdx, setImgIdx]         = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const allImages = (product.variants || []).flatMap(v => v.images || []).filter(Boolean);
  const images    = allImages.length > 0 ? allImages : [];
  const totalImgs = images.length;

  const nextImg = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setImgIdx(i => (i + 1) % totalImgs); };
  const prevImg = (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); setImgIdx(i => (i - 1 + totalImgs) % totalImgs); };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setImgIdx(i => diff > 0 ? (i + 1) % totalImgs : (i - 1 + totalImgs) % totalImgs);
    setTouchStart(null);
  };

  // ── SEO: <a> tag işlədirik ki Google hər məhsul URL-ini tapa bilsin ──
  // onClick-də e.preventDefault() linki açmır, modal açır (istifadəçi üçün eyni)
  const productUrl = product.slug ? `/mehsullar/${product.slug}` : '#';

  return (
    <a
      href={productUrl}
      onClick={(e) => { e.preventDefault(); onView(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: C.white, borderRadius: 12,
        overflow: 'hidden', cursor: 'pointer',
        border: hovered ? '1px solid #E0DDD8' : '1px solid #EDEBE7',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: C.bg }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <img
            src={toWebP(images[imgIdx], 480)}
            alt={`${product.name} — fərdi hədiyyə, Bakı | Ravio`}
            loading="lazy"
            decoding="async"
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

        {hasDiscount && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: C.primary, color: C.white,
            fontSize: 10, fontWeight: 800,
            padding: '3px 8px', borderRadius: 6,
          }}>−{pct}%</div>
        )}

        {product.isBestSeller && !hasDiscount && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: C.black, color: C.white,
            fontSize: 10, fontWeight: 700,
            padding: '3px 8px', borderRadius: 6,
          }}>✦ Populyar</div>
        )}

        {lowStock && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: C.primary, color: C.white,
            fontSize: 10, fontWeight: 700,
            padding: '3px 7px', borderRadius: 6,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Zap size={9} fill={C.white} />Son {stock}
          </div>
        )}

        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,255,255,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1 }}>STOKDA YOX</span>
          </div>
        )}

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
          </>
        )}

        {totalImgs > 1 && (
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 4,
          }}>
            {images.map((_, i) => (
              <div key={i} style={{
                width: i === imgIdx ? 16 : 5, height: 5,
                borderRadius: 3, background: i === imgIdx ? C.primary : 'rgba(0,0,0,0.25)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
        )}

        {!outOfStock && (
          <div
            className="card-quick-add"
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0 8px 8px',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.25s, transform 0.25s',
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); onAdd(); }}
              style={{
                width: '100%', padding: '10px 0',
                background: C.primary, color: C.white,
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: F.sans,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              <ShoppingBag size={12} /> Sifariş et
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '10px 10px 12px' }}>
        {product.category && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#999999',
            letterSpacing: 0.8, textTransform: 'uppercase' as const,
            display: 'block', marginBottom: 4,
            fontFamily: F.sans,
          }}>{product.category}</span>
        )}

        <h3 style={{
          margin: '0 0 8px', fontSize: 13, fontWeight: 600,
          color: C.black, lineHeight: 1.35,
          fontFamily: F.sans,
          display: '-webkit-box' as any,
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
          overflow: 'hidden',
        }}>{product.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' as const }}>
          <div>
            {hasDiscount && minOld !== null && (
              <span style={{
                fontSize: 10, color: '#BBBBBB',
                textDecoration: 'line-through',
                display: 'block', lineHeight: 1, marginBottom: 2,
                fontFamily: F.sans,
              }}>{minOld.toFixed(2)} ₼</span>
            )}
            <span style={{
              fontSize: 16, fontWeight: 800,
              color: hasDiscount ? C.primary : C.black,
              fontFamily: F.sans,
              letterSpacing: '-0.5px',
            }}>
              {min.toFixed(2)}{!samePrice ? `–${max.toFixed(2)}` : ''} ₼
            </span>
          </div>

          {product.variants && product.variants.length > 1 && (
            <span style={{
              fontSize: 11, color: '#999',
              background: C.bg, borderRadius: 6,
              padding: '3px 6px', fontWeight: 500,
              fontFamily: F.sans, flexShrink: 0,
            }}>{product.variants.length} var.</span>
          )}
        </div>

        <div style={{
          marginTop: 8, fontSize: 11, color: '#555',
          display: 'flex', alignItems: 'center', gap: 3,
          fontFamily: F.sans,
        }}>
          <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
          Ödənişsiz çatdırılma
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .card-quick-add {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        }
      `}</style>
    </a>
  );
};

export default ProductGrid;