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

// ── Metro cədvəli — hər günün öz saatları ──────────────────────
export interface DaySchedule {
  day: string;
  allDayOpen: boolean;
  timeSlots: string[];
}

export interface MetroStation {
  name: string;
  isActive: boolean;
  daySchedules: DaySchedule[];
}

export interface MetroSchedule {
  stations: MetroStation[];
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