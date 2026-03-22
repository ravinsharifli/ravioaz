export interface BulkTier {
  minQty: number;
  maxQty?: number;
  discountAmount: number;
  label?: string;
}

export interface Variant {
  modelName?: string;
  colorName?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category?: string;
  description?: string;
  variants: Variant[];
  isPremium?: boolean;
  premiumOrder?: number;
  premiumSize?: string;
  isBestSeller?: boolean;
  bestSellerOrder?: number;
  orderCount?: number;
  hasBulkDiscount?: boolean;
  bulkDiscountNote?: string;
  bulkTiers?: BulkTier[];
}

export interface CartItem {
  cartId: string;
  productId: string;
  productName: string;
  variantIndex: number;
  modelName: string;
  colorName: string;
  images: string[];
  price: number;
  discountPrice?: number;
  quantity: number;
  specialRequest?: string;
  customText?: string;
  customerName: string;
  phone: string;
  birthDate: string;
  isGift: boolean;
  isFirstOrSecondOrder: boolean;
  customerType: 'new' | 'loyal';
  deliveryType: 'standard' | 'urgent' | 'express';
  deliveryDetails: string;
  bulkDiscountAmount?: number;
}

export type AppView = 'home' | 'about' | 'contact' | 'delivery' | 'reviews';