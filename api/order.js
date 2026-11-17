// api/order.js — sifarişin QEYDİ (müştərinin şəxsi məlumatı SAXLANMIR).
//
// NƏYİ SAXLAYIR: sifariş nömrəsi, məhsullar və sayları, məbləğin SERVER tərəfindən Sanity-dəki
// real qiymətlərlə YENİDƏN hesablanmış variantı, brauzerin göndərdiyi məbləğlə fərq, çatdırılma
// növü, UTM mənbəyi və telefonun HMAC hash-i ("daimi müştəri" iddiasını yoxlamaq üçün).
// NƏYİ SAXLAMIR: ad, telefon, ünvan, doğum tarixi, müştəri şəkilləri — bunlar yalnız WhatsApp
// mesajındadır. SƏBƏB: Sanity dataset-i "public"-dir (sayt məlumatı apicdn-dən oxuyur) — orada
// yazılan hər sənəd internetdən oxuna bilər. Ona görə şəxsi məlumat bura YAZILMIR.
//
// Bu endpoint "fire-and-forget"dir: müştərinin WhatsApp keçidindən SONRA, gözlənilmədən çağırılır.
// Uğursuz olsa sifariş axınına heç bir təsiri yoxdur (CartDrawer.tsx handleWhatsApp).
//
// Quraşdırma (Vercel → Settings → Environment Variables):
//   SANITY_WRITE_TOKEN   — Sanity-də "Editor" səlahiyyətli API token (olmasa endpoint heç nə yazmır)
//   ORDER_HASH_SECRET    — (ixtiyari) telefon hash-i üçün gizli söz; olmasa SANITY_WRITE_TOKEN istifadə olunur
import crypto from 'crypto';
import { isAllowedOrigin, rateLimited, parseBody, ORDER_NUMBER_RE, cleanPhone } from '../lib/apiGuard.js';
import { sanityQuery, sanityMutate } from '../lib/sanityServer.js';
import { computeLine } from '../lib/orderPricing.js';

const BULK_DISCOUNT_FALLBACK = 1; // constants/defaults.ts → BULK_DISCOUNT_PER_UNIT ilə eyni
const TOLERANCE = 0.011; // qəpik yuvarlaqlaşdırma fərqi

const PRODUCTS_QUERY = `*[_type == "product" && _id in $ids]{
  _id, name,
  variants[]{ modelName, colorName, price, discountPrice },
  customBoxOptions[]{ id, name, price, isActive },
  hasCoupons, coupons[]{ code, discountValue }
}`;
const BULK_QUERY = `*[_type == "siteSettings"][0].bulkDiscountPerUnit`;

const CUSTOMER_TYPES = new Set(['new', 'loyal']);
const DELIVERY_TYPES = new Set(['kuryer', 'metro', 'post']);
const UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'];

const clip = (v, n) => String(v ?? '').slice(0, n);
const round2 = (n) => Math.round(n * 100) / 100;

/** Brauzerdən gələn məlumatı yoxlayır və yalnız lazım olan sahələri saxlayır (ağ siyahı). */
export function normalizeOrder(body) {
  if (!body) return { error: 'bad body' };
  if (!ORDER_NUMBER_RE.test(String(body.orderNumber || ''))) return { error: 'bad orderNumber' };

  const clientTotal = Number(body.clientTotal);
  if (!Number.isFinite(clientTotal) || clientTotal < 0 || clientTotal > 20000) return { error: 'bad clientTotal' };

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return { error: 'bad items' };

  const items = [];
  for (const raw of body.items) {
    const productId = clip(raw?.productId, 100);
    const variantIndex = Number.isInteger(raw?.variantIndex) ? raw.variantIndex : -1;
    const quantity = Number.isInteger(raw?.quantity) ? raw.quantity : 0;
    if (!productId || variantIndex < 0 || variantIndex > 100 || quantity < 1 || quantity > 99) {
      return { error: 'bad item' };
    }
    const lineTotal = Number(raw?.clientTotal);
    items.push({
      productId,
      variantIndex,
      quantity,
      boxId: raw?.boxId ? clip(raw.boxId, 100) : null,
      couponCode: raw?.couponCode ? clip(raw.couponCode, 40) : null,
      customerType: CUSTOMER_TYPES.has(raw?.customerType) ? raw.customerType : null,
      hasCustomText: Boolean(raw?.hasCustomText),
      hasPhoto: Boolean(raw?.hasPhoto),
      clientTotal: Number.isFinite(lineTotal) ? lineTotal : null,
    });
  }

  const utm = {};
  if (body.utm && typeof body.utm === 'object') {
    for (const k of UTM_KEYS) if (body.utm[k]) utm[k] = clip(body.utm[k], 80);
  }

  return {
    order: {
      orderNumber: String(body.orderNumber),
      clientTotal,
      items,
      delivery: DELIVERY_TYPES.has(body.delivery) ? body.delivery : null,
      deliveryDate: clip(body.deliveryDate, 40),
      lang: body.lang === 'en' ? 'en' : 'az',
      utm,
      phone: body.phone,
    },
  };
}

function hashPhone(digits, secret) {
  const normalized = digits.startsWith('994') ? digits : digits.startsWith('0') ? `994${digits.slice(1)}` : `994${digits}`;
  return crypto.createHmac('sha256', secret).update(normalized).digest('hex').slice(0, 32);
}

/** Bir sifariş sətrini Sanity-dəki REAL məlumatlarla yenidən hesablayır. */
function priceItem(item, product, bulkPerUnit) {
  const issues = [];
  if (!product) return { serverTotal: 0, productName: '', variantLabel: '', boxName: null, issues: ['product-not-found'] };

  const variant = product.variants?.[item.variantIndex];
  if (!variant) return { serverTotal: 0, productName: product.name || '', variantLabel: '', boxName: null, issues: ['variant-not-found'] };

  // Qutu: ProductPage ilə eyni qayda — id tapılmasa ilk aktiv qutu
  const boxes = (product.customBoxOptions || [])
    .filter((b) => b?.isActive !== false)
    .map((b) => ({ id: b.id && String(b.id).trim() ? String(b.id).trim() : b.name, name: b.name, price: b.price ?? 0 }));
  let boxFee = 0;
  let boxName = null;
  if (item.boxId) {
    const box = boxes.find((b) => b.id === item.boxId) ?? boxes[0];
    if (box) {
      boxFee = box.price;
      boxName = box.name || null;
    } else {
      issues.push('box-not-found');
    }
  }

  // Kupon: yalnız bu məhsulun öz kuponları (hasCoupons açıqdırsa)
  let couponValue = 0;
  if (item.couponCode) {
    const coupons = product.hasCoupons ? product.coupons || [] : [];
    const found = coupons.find((c) => c?.code === item.couponCode);
    if (found) couponValue = Number(found.discountValue) || 0;
    else issues.push('coupon-not-valid');
  }

  const line = computeLine({
    baseUnit: variant.discountPrice ?? variant.price ?? 0,
    quantity: item.quantity,
    boxFee,
    customerType: item.customerType,
    couponValue,
    bulkPerUnit,
  });

  if (item.clientTotal !== null && Math.abs(line.finalPrice - item.clientTotal) > TOLERANCE) {
    issues.push('line-total-differs');
  }

  return {
    serverTotal: line.finalPrice,
    productName: product.name || '',
    variantLabel: [variant.modelName, variant.colorName].filter(Boolean).join(' / '),
    boxName,
    issues,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  if (rateLimited(req, 'order', 10)) {
    return res.status(429).json({ ok: false, error: 'Too many requests' });
  }

  const { order, error } = normalizeOrder(parseBody(req));
  if (error) {
    return res.status(400).json({ ok: false, error });
  }

  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) {
    console.error('SANITY_WRITE_TOKEN Vercel-də quraşdırılmayıb — sifariş qeydi yazılmadı');
    return res.status(200).json({ ok: false, reason: 'not-configured' });
  }

  try {
    const ids = [...new Set(order.items.map((i) => i.productId))];
    const [products, bulkSetting] = await Promise.all([
      sanityQuery(PRODUCTS_QUERY, { ids }, token),
      sanityQuery(BULK_QUERY, {}, token),
    ]);
    const byId = new Map((products || []).map((p) => [p._id, p]));
    const bulkPerUnit = Number.isFinite(Number(bulkSetting)) && bulkSetting !== null ? Number(bulkSetting) : BULK_DISCOUNT_FALLBACK;

    const priced = order.items.map((item) => ({ item, ...priceItem(item, byId.get(item.productId), bulkPerUnit) }));
    const serverTotal = round2(priced.reduce((sum, p) => sum + p.serverTotal, 0));
    const hasIssues = priced.some((p) => p.issues.length > 0);
    const totalsMismatch = hasIssues || Math.abs(serverTotal - order.clientTotal) > TOLERANCE;

    const docId = `order-${order.orderNumber}`;

    // "Daimi müştəri" iddiası: telefon hash-i ilə bu nömrədən əvvəl qeydə alınmış sifariş varmı?
    const digits = cleanPhone(order.phone);
    let phoneHash = null;
    let previousOrders = null;
    if (digits) {
      phoneHash = hashPhone(digits, process.env.ORDER_HASH_SECRET || token);
      try {
        previousOrders = await sanityQuery(
          'count(*[_type == "order" && phoneHash == $h && _id != $id])',
          { h: phoneHash, id: docId },
          token,
        );
      } catch (e) {
        console.error('Əvvəlki sifariş sayı alınmadı (sifariş yenə yazılır):', e?.message);
      }
    }
    const claimedLoyal = order.items.some((i) => i.customerType === 'loyal');

    const doc = {
      _id: docId,
      _type: 'order',
      orderNumber: order.orderNumber,
      createdAt: new Date().toISOString(),
      status: 'new',
      lang: order.lang,
      deliveryMethod: order.delivery,
      deliveryDate: order.deliveryDate || null,
      itemsCount: order.items.length,
      unitsCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      clientTotal: round2(order.clientTotal),
      serverTotal,
      totalsMismatch,
      issues: [...new Set(priced.flatMap((p) => p.issues))],
      customerTypeClaimed: order.items.find((i) => i.customerType)?.customerType ?? null,
      loyalNoHistory: claimedLoyal && previousOrders === 0,
      previousOrders: previousOrders ?? null,
      phoneHash,
      couponCodes: [...new Set(order.items.map((i) => i.couponCode).filter(Boolean))],
      utm: order.utm,
      items: priced.map((p, idx) => ({
        _key: `i${idx}`,
        _type: 'orderItem',
        productId: p.item.productId,
        productName: p.productName,
        variantLabel: p.variantLabel,
        quantity: p.item.quantity,
        boxName: p.boxName,
        couponCode: p.item.couponCode,
        customerType: p.item.customerType,
        hasCustomText: p.item.hasCustomText,
        hasPhoto: p.item.hasPhoto,
        serverTotal: round2(p.serverTotal),
        clientTotal: p.item.clientTotal,
        issues: p.issues,
      })),
    };

    await sanityMutate([{ createIfNotExists: doc }], token);
    return res.status(200).json({ ok: true, serverTotal, mismatch: totalsMismatch });
  } catch (err) {
    console.error('Sifariş qeydi xətası (sifarişə təsiri yoxdur):', err?.message || err);
    return res.status(200).json({ ok: false });
  }
}
