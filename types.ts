export interface ColorVariant {
  colorName: string;
  stock: number;
  price: number;
  discountPrice?: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;        // fallback üçün saxlanılır
  discountPrice?: number;
  rating: number;
  description?: string;
  images: string[];
  colorVariants?: ColorVariant[];
  isPremium?: boolean;
  premiumOrder?: number;
  premiumSize?: 'large' | 'small-top' | 'small-bottom';
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  selectedColors?: string[];
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