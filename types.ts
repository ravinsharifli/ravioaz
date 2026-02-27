export interface ColorVariant {
  colorName: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  colorVariants?: ColorVariant[];
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  customText?: string;
  customerName?: string;
  phone?: string;
  birthDate?: string;
  isGift?: boolean;
  isFirstOrSecondOrder?: boolean;
  deliveryType: 'standard' | 'urgent' | 'express';
  deliveryDetails?: string;
  selectedColor?: string;
  orderNote?: string;
}

export type Category = 'Bütün məhsullar' | 'Elektronika' | 'Geyim' | 'Ev & Dekorsiya' | 'Dəst hədiyyələr' | 'Aksesuarlar' | 'Foto çərçivə' | 'Çap xidmətləri' | 'Özəl hədiyyələr';

export type AppView = 'home' | 'about' | 'contact' | 'delivery' | 'reviews';