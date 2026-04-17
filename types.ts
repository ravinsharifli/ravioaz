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
  allowBoxSelection?: boolean;
}

// Metro cədvəli — checkbox sistemi
// availableDays:      boş günlər (seçilmiş = çatdırılma var)
// availableTimeSlots: boş saatlar (seçilmiş = çatdırılma var)
export interface MetroStationEntry {
  name: string;
  isActive: boolean;
  availableDays: string[];
  availableTimeSlots: string[];
}

export interface MetroSchedule {
  stations: MetroStationEntry[];
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
  customerType: 'new' | 'loyal' | null;
  deliveryType: 'standard' | 'urgent' | 'express';
  deliveryDetails: string;
  bulkDiscountAmount?: number;
  boxType?: string;
  boxPrice?: number;
  couponCode?: string;
  couponDiscount?: number;
  hasQrCode?: boolean;
  lazerPrice?: number;
  deliveryMethod?: 'metro' | 'kuryer';
  metroStation?: string;
  metroDay?: string;
  metroTime?: string;
  finalTotal?: number;
  behAmount?: number;
}

export type AppView = 'home' | 'about' | 'contact' | 'delivery' | 'reviews';