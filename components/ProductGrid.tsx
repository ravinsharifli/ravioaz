import React from 'react';
import { ShoppingCart, Plus, Eye, Tag } from 'lucide-react';
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
    <div className="w-full">
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">{title}</h2>
          <div className="h-0.5 w-12 bg-gradient-to-r from-[#FF8C00] to-transparent mt-2 rounded-full" />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {products.map((product) => {
          const firstVariant = product.variants?.[0];
          if (!firstVariant) return null;
          const firstImage = firstVariant.images?.[0];
          const { min, max, minOld, hasDiscount, discountPercent } = getPriceRange(product);
          const samePrice = min === max;

          return (
            <div key={product.id}
              onClick={() => onViewProduct(product)}
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,140,0,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)')}>

              {/* Şəkil */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden" style={{ aspectRatio: '1/1' }}>
                {firstImage ? (
                  <img src={firstImage} alt={product.name}
                    className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">Şəkil yoxdur</div>
                )}

                {/* Endirim badge */}
                {hasDiscount && (
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md shadow-orange-200">
                      <Tag className="h-2.5 w-2.5" />
                      -{discountPercent}%
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[#FF8C00]" />
                    <span className="text-xs font-black text-[#1A1A1A]">Bax</span>
                  </div>
                </div>

                {/* Sürətli əlavə et */}
                <button
                  onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                  className="absolute bottom-2.5 right-2.5 z-20 bg-white/90 backdrop-blur p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#FF8C00] hover:text-white text-gray-600">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Məlumat */}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#FF8C00] transition-colors duration-200">
                  {product.name}
                </h3>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    {hasDiscount && (
                      <span className="text-[11px] font-medium text-gray-400 line-through block leading-none mb-0.5">
                        {minOld!.toFixed(2)} AZN
                      </span>
                    )}
                    <span className="text-base font-black text-[#FF8C00] leading-none">
                      {samePrice ? `${min.toFixed(2)}` : `${min.toFixed(2)} - ${max.toFixed(2)}`}
                      <span className="text-xs font-bold ml-1">AZN</span>
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-[#FF8C00] transition-colors duration-300">
                    <ShoppingCart className="h-4 w-4 text-[#FF8C00] group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-[#FF8C00] opacity-40" />
          </div>
          <p className="text-gray-400 font-medium">Bu kateqoriyada hələlik məhsul yoxdur.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;