export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  rating: number;
  description?: string;
  images: string[];
  availableColors?: string[];
  stockQuantity?: number;
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