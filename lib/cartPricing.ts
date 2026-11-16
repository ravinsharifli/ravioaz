import { Product, CartItem, Coupon } from '../types';
import { BULK_DISCOUNT_PER_UNIT } from '../constants/defaults';
import { computeLine } from './orderPricing.js';

/**
 * Səbətdə məhsulun sayı (quantity) birbaşa dəyişdirildikdə bütün qiymətə bağlı
 * sahələri (bulkDiscountAmount, customerDiscount, couponDiscount, finalTotal,
 * behAmount) YENİDƏN hesablayır.
 *
 * VACİB: Düstur (lib/orderPricing.js) ProductPage.tsx-dəki handleAddToCart məntiqi ilə
 * BİRƏBİR eynidir (bulk endirim → müştəri tipi endirimi → kupon endirimi ardıcıllığı).
 * Əgər ProductPage.tsx-də qiymət düsturu dəyişərsə, orderPricing.js də uyğun
 * yenilənməlidir — əks halda səbətdə sayı dəyişdikdə məbləğ məhsul
 * səhifəsindəkindən fərqli çıxa bilər.
 */
export function recalcCartItemForQuantity(
  item: CartItem,
  newQuantity: number,
  coupons: Coupon[],
  bulkDiscountPerUnit: number = BULK_DISCOUNT_PER_UNIT,
): CartItem {
  const coupon = item.couponCode
    ? coupons.find((c) => c.code === item.couponCode)
    : undefined;

  // Düstur lib/orderPricing.js-dədir — server (api/order.js) də eyni funksiyanı işlədir.
  const line = computeLine({
    baseUnit: item.discountPrice ?? item.price,
    quantity: newQuantity,
    boxFee: item.boxPrice ?? 0,
    customerType: item.customerType,
    couponValue: coupon ? coupon.discountValue : 0,
    bulkPerUnit: bulkDiscountPerUnit,
  });

  return {
    ...item,
    quantity: line.quantity,
    bulkDiscountAmount: line.bulkDiscTotal,
    customerDiscount: line.customerDisc > 0 ? line.customerDisc : undefined,
    couponDiscount: line.couponDiscount > 0 ? line.couponDiscount : undefined,
    finalTotal: line.finalPrice,
    behAmount: Math.ceil(line.finalPrice * 0.5),
  };
}

/**
 * Səbətdəki bir məhsul üçün icazə verilən maksimum say.
 * Stok say ilə deyil, sadə "stokda var/yox" açarı ilə izlənir: variant
 * stokda deyilsə əlavə sifariş verilə bilməz (0), stokdadırsa təsadüfən
 * həddindən artıq rəqəm yazılmasının qarşısını almaq üçün təhlükəsiz
 * tavan (99) tətbiq olunur.
 */
export function getMaxQuantityForItem(item: CartItem, product: Product | undefined): number {
  const variant = product?.variants?.[item.variantIndex];
  if (variant && variant.inStock === false) return 0;
  return 99;
}
