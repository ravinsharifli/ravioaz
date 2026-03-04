export interface ProductVariant {
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
  category: string;
  description?: string;
  variants: ProductVariant[];
  isPremium?: boolean;
  premiumOrder?: number;
  premiumSize?: 'large' | 'small-top' | 'small-bottom';
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
  deliveryType: 'standard' | 'urgent' | 'express';
  deliveryDetails: string;
}

export type AppView = 'home' | 'about' | 'contact' | 'delivery' | 'reviews';