import { Product, CartItem, Coupon } from '../types';

/**
 * Səbətdə məhsulun sayı (quantity) birbaşa dəyişdirildikdə bütün qiymətə bağlı
 * sahələri (bulkDiscountAmount, customerDiscount, couponDiscount, finalTotal,
 * behAmount) YENİDƏN hesablayır.
 *
 * VACİB: Bu düstur ProductPage.tsx-dəki handleAddToCart məntiqi ilə BİRƏBİR
 * eynidir (bulk endirim → müştəri tipi endirimi → kupon endirimi ardıcıllığı).
 * Əgər ProductPage.tsx-də qiymət düsturu dəyişərsə, bu funksiya da uyğun
 * yenilənməlidir — əks halda səbətdə sayı dəyişdikdə məbləğ məhsul
 * səhifəsindəkindən fərqli çıxa bilər.
 */
export function recalcCartItemForQuantity(
  item: CartItem,
  newQuantity: number,
  product: Product | undefined,
  coupons: Coupon[],
): CartItem {
  const q = Math.max(1, Math.floor(newQuantity) || 1);

  const baseUnit = item.discountPrice ?? item.price;
  const bulkOff = q >= 2 ? (product?.bulkDiscountAmount ?? 1) : 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * q;

  const boxFee = item.boxPrice ?? 0;
  const productSub = effectiveUnit * q + boxFee;

  const discRate = item.customerType === 'loyal' ? 20 : item.customerType === 'new' ? 10 : 0;
  const customerDisc = item.customerType ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase = productSub - customerDisc;

  const coupon = item.couponCode
    ? coupons.find((c) => c.code === item.couponCode && c.isActive)
    : undefined;
  const couponDiscount = coupon
    ? coupon.discountType === 'percent'
      ? Math.round(couponBase * coupon.discountValue / 100 * 100) / 100
      : Math.min(coupon.discountValue, couponBase)
    : 0;

  const finalPrice = Math.max(0, couponBase - couponDiscount);

  return {
    ...item,
    quantity: q,
    bulkDiscountAmount: bulkDiscTotal,
    customerDiscount: customerDisc > 0 ? customerDisc : undefined,
    couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
    finalTotal: finalPrice,
    behAmount: Math.ceil(finalPrice * 0.5),
  };
}

/**
 * Səbətdəki bir məhsul üçün icazə verilən maksimum say.
 * Konkret variantın stok sayı bəlludursa (0-dan böyükdürsə) onu tavan kimi
 * götürür; stok izlənmirsə (və ya məhsul kataloqdan silinibsə), fərz
 * ediləndən artıq təsadüfi rəqəm yazılmasının qarşısını almaq üçün
 * məntiqli təhlükəsiz tavan (99) tətbiq olunur.
 */
export function getMaxQuantityForItem(item: CartItem, product: Product | undefined): number {
  const variant = product?.variants?.[item.variantIndex];
  if (variant && typeof variant.stock === 'number' && variant.stock > 0) {
    return variant.stock;
  }
  return 99;
}
