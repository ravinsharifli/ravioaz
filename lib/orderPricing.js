// lib/orderPricing.js — sifariş sətrinin qiymət düsturu (təmiz funksiya, asılılıq yoxdur).
//
// Həm brauzer (lib/cartPricing.ts → səbətdə say dəyişəndə), həm də server (api/order.js →
// sifarişin yenidən yoxlanması) EYNİ funksiyanı çağırır; beləliklə iki yerdəki düstur
// bir-birindən uzaqlaşa bilməz.
// DİQQƏT: components/ProductPage.tsx-dəki handleAddToCart hələ də öz daxili nüsxəsini işlədir
// (eyni düstur). Orada qiymət düsturu dəyişərsə, burada da dəyişin — scripts/order.test.mjs
// bu funksiyanı köhnə (referans) düsturla müqayisə edir.

/**
 * @param {{ baseUnit: number, quantity: number, boxFee?: number,
 *           customerType?: 'new' | 'loyal' | null, couponValue?: number, bulkPerUnit?: number }} p
 */
export function computeLine({ baseUnit, quantity, boxFee = 0, customerType = null, couponValue = 0, bulkPerUnit = 0 }) {
  const q = Math.max(1, Math.floor(quantity) || 1);

  const bulkOff = q >= 2 ? bulkPerUnit : 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * q;

  const productSub = effectiveUnit * q + boxFee;

  const discRate = customerType === 'loyal' ? 20 : customerType === 'new' ? 10 : 0;
  const customerDisc = customerType ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase = productSub - customerDisc;

  const couponDiscount = couponValue > 0 ? Math.min(couponValue, couponBase) : 0;
  const finalPrice = Math.max(0, couponBase - couponDiscount);

  return { quantity: q, effectiveUnit, bulkDiscTotal, productSub, customerDisc, couponDiscount, finalPrice };
}
