import React from 'react';
import { Star, ShoppingCart, Plus, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onViewProduct }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-black text-[#1A1A1A]">Populyar Məhsullar</h2>
        <div className="flex space-x-2">
           <button className="bg-gray-100 h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#FF8C00] hover:text-white transition-all">{"<"}</button>
           <button className="bg-gray-100 h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#FF8C00] hover:text-white transition-all">{">"}</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            onClick={() => onViewProduct(product)}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-50 hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-50 transition-all duration-500 cursor-pointer"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Endirim nişanı */}
              {(product as any).discountPrice && (
                <div className="absolute top-3 left-3 bg-[#FF8C00] text-white text-[10px] font-black px-2 py-1 rounded-full">
                  -{Math.round(((product.price - (product as any).discountPrice) / product.price) * 100)}%
                </div>
              )}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="bg-white/90 backdrop-blur p-3 rounded-full shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                    <Eye className="h-5 w-5 text-[#FF8C00]" />
                 </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="absolute bottom-3 right-3 bg-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#FF8C00] hover:text-white z-10"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-1 mb-1">
                <Star className="h-3 w-3 fill-[#FF8C00] text-[#FF8C00]" />
                <span className="text-[10px] font-bold text-gray-400">{product.rating}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-[#FF8C00] transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                {(product as any).discountPrice ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 line-through">
                      {product.price.toFixed(2)} AZN
                    </span>
                    <span className="text-base font-black text-[#FF8C00]">
                      {(product as any).discountPrice.toFixed(2)} AZN
                    </span>
                  </div>
                ) : (
                  <span className="text-base font-black text-[#1A1A1A]">
                    {product.price.toFixed(2)} AZN
                  </span>
                )}
                <ShoppingCart className="h-4 w-4 text-gray-300 group-hover:text-[#FF8C00] transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
           <p className="text-gray-400 font-bold italic">Bu kateqoriyada hələlik məhsul yoxdur.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;