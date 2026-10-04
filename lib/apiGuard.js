// lib/apiGuard.js — /api/* endpoint-lərini ən sadə sui-istifadədən qoruyur (asılılıq yoxdur).
//
// DİQQƏT: bu "tam təhlükəsizlik" DEYİL — kimsə curl ilə Origin başlığını saxtalaşdıra bilər.
// Məqsəd: (1) başqa sayt/botların brauzerdən çağırışını bağlamaq, (2) sadə spam-ı yavaşlatmaq,
// (3) Meta-ya və imgbb-yə yalnız MƏNTİQLİ məlumat getməsini təmin etmək.
// Rate-limit yaddaşda saxlanılır: Vercel hər instansiya üçün ayrıca sayır, ona görə "best-effort"dur.

const PROD_HOSTS = new Set(['ravio.az', 'www.ravio.az']);

/** Sorğu ravio.az-dan gəlibmi? (Preview/localhost yalnız production olmayan mühitdə) */
export function isAllowedOrigin(req) {
  const raw = req?.headers?.origin || req?.headers?.referer || '';
  if (!raw) return false;
  let host = '';
  try {
    host = new URL(raw).hostname;
  } catch {
    return false;
  }
  if (PROD_HOSTS.has(host)) return true;
  if (process.env.VERCEL_ENV !== 'production') {
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  }
  return false;
}

const buckets = new Map();

/** true qaytarırsa — limit aşılıb, sorğu rədd edilməlidir */
export function rateLimited(req, key, max = 10, windowMs = 60_000) {
  const ip = String(req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
  const id = `${key}:${ip}`;
  const now = Date.now();
  const rec = buckets.get(id);
  if (!rec || now - rec.start > windowMs) {
    buckets.set(id, { start: now, n: 1 });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (now - v.start > windowMs) buckets.delete(k);
    }
    return false;
  }
  rec.n += 1;
  return rec.n > max;
}

export function parseBody(req) {
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    return b && typeof b === 'object' ? b : null;
  } catch {
    return null;
  }
}

// CartDrawer.tsx makeOrderNumber(): RV-YYYYMMDD-HHMMSS
export const ORDER_NUMBER_RE = /^RV-\d{8}-\d{6}$/;
export const ALLOWED_EVENTS = new Set(['Contact', 'Lead', 'InitiateCheckout', 'AddToCart', 'ViewContent']);

/** Maşın tərəfindən yaranan sahələrdə SƏRT, istifadəçinin yazdığı sahədə (telefon) YUMŞAQ */
export function validatePurchase(body) {
  if (!body) return 'bad body';
  if (!ORDER_NUMBER_RE.test(String(body.orderNumber || ''))) return 'bad orderNumber';
  const value = Number(body.value);
  if (!Number.isFinite(value) || value <= 0 || value > 5000) return 'bad value';
  if (body.items !== undefined && (!Array.isArray(body.items) || body.items.length > 30)) return 'bad items';
  return null;
}

/** Meta-ya göndərilən məhsul siyahısını təmizləyir */
export function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 30).map((i) => ({
    productId: String(i?.productId ?? '').slice(0, 100),
    quantity: Math.min(500, Math.max(1, Math.floor(Number(i?.quantity) || 1))),
    unitPrice: Math.min(5000, Math.max(0, Number(i?.unitPrice) || 0)),
  })).filter((i) => i.productId);
}

/** Telefon uyğunsuzdursa Meta-ya göndərilmir (sifariş izləməsi yenə də işləyir) */
export function cleanPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 13 ? digits : '';
}
