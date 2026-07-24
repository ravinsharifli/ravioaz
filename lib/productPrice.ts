import { Product } from '../types';

export function getProductPriceRange(product: Product) {
  const variants = product.variants || [];
  if (!variants.length) return { min: 0, max: 0 };
  const prices = variants.map((v) => v.discountPrice ?? v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
