
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
}

export interface CartItem extends Product {
  cartId: string; // Səbətdəki hər giriş üçün unikal ID
  quantity: number;
  customText?: string;
  customerName?: string;
  phone?: string;
  birthDate?: string;
  isGift?: boolean;
  isFirstOrSecondOrder?: boolean;
  deliveryType: 'standard' | 'urgent' | 'express';
  deliveryDetails?: string;
}

export type Category = 'Bütün məhsullar' | 'Elektronika' | 'Geyim' | 'Ev & Dekorsiya' | 'Dəst hədiyyələr' | 'Aksesuarlar' | 'Foto çərçivə' | 'Çap xidmətləri' | 'Özəl hədiyyələr';

export type AppView = 'home' | 'about' | 'contact' | 'delivery' | 'reviews';
