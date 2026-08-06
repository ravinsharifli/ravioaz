import { Product, CartItem, Coupon } from '../types';
import { BULK_DISCOUNT_PER_UNIT } from '../constants/defaults';

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
  bulkDiscountPerUnit: number = BULK_DISCOUNT_PER_UNIT,
): CartItem {
  const q = Math.max(1, Math.floor(newQuantity) || 1);

  const baseUnit = item.discountPrice ?? item.price;
  const bulkOff = q >= 2 ? bulkDiscountPerUnit : 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * q;

  const boxFee = item.boxPrice ?? 0;
  const productSub = effectiveUnit * q + boxFee;

  const discRate = item.customerType === 'loyal' ? 20 : item.customerType === 'new' ? 10 : 0;
  const customerDisc = item.customerType ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase = productSub - customerDisc;

  const coupon = item.couponCode
    ? coupons.find((c) => c.code === item.couponCode)
    : undefined;
  const couponDiscount = coupon
    ? Math.min(coupon.discountValue, couponBase)
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
