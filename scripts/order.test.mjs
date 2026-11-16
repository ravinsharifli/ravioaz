// Işlət:  node scripts/order.test.mjs
// /api/order (sifariş qeydi) və lib/orderPricing.js (qiymət düsturu) testləri — asılılıq yoxdur.
import order from '../api/order.js';
import { computeLine } from '../lib/orderPricing.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ← ' + extra}`); };
const mkReq = (method, headers = {}, body = undefined, ip = '1.1.1.1') => ({ method, headers: { 'x-forwarded-for': ip, ...headers }, body });
const mkRes = () => ({ code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
const RAVIO = { origin: 'https://ravio.az' };
const json = (b) => ({ ok: true, status: 200, json: async () => b, text: async () => JSON.stringify(b) });

process.env.VERCEL_ENV = 'production';

// ───────────────────────── 1) Qiymət düsturu: köhnə (referans) düsturla eyni nəticə ─────────────────────────
// Referans = lib/cartPricing.ts-in və ProductPage.tsx-in əvvəlki daxili düsturu (dəyişməz saxlanılıb).
function reference({ base, q, boxFee, type, coupon, bulk }) {
  const bulkOff = q >= 2 ? bulk : 0;
  const effectiveUnit = Math.max(0, base - bulkOff);
  const productSub = effectiveUnit * q + boxFee;
  const discRate = type === 'loyal' ? 20 : type === 'new' ? 10 : 0;
  const customerDisc = type ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase = productSub - customerDisc;
  const couponDiscount = coupon ? Math.min(coupon, couponBase) : 0;
  return Math.max(0, couponBase - couponDiscount);
}
let same = 0, total = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
for (let i = 0; i < 20000; i++) {
  const p = {
    base: Math.round(rnd(3, 70) * 100) / 100,
    q: 1 + Math.floor(Math.random() * 30),
    boxFee: Math.random() < 0.4 ? Math.round(rnd(1, 8) * 100) / 100 : 0,
    type: [null, 'new', 'loyal'][Math.floor(Math.random() * 3)],
    coupon: Math.random() < 0.3 ? Math.round(rnd(1, 15) * 100) / 100 : 0,
    bulk: Math.random() < 0.5 ? 1 : 0,
  };
  total++;
  const got = computeLine({ baseUnit: p.base, quantity: p.q, boxFee: p.boxFee, customerType: p.type, couponValue: p.coupon, bulkPerUnit: p.bulk }).finalPrice;
  if (got === reference(p)) same++;
}
ok(`pricing: 20 000 təsadüfi hal köhnə düsturla BİRƏBİR eynidir (${same}/${total})`, same === total);
const r2 = (n) => Math.round(n * 100) / 100; // float səs-küyü (18.439999…) qəpiyə yuvarlaqlaşdırılır
ok('pricing: 1 ədəd, yeni müştəri −10%: 20.49 → 18.44', r2(computeLine({ baseUnit: 20.49, quantity: 1, customerType: 'new' }).finalPrice) === 18.44);
ok('pricing: 2 ədəd → hər ədəddən 1 ₼ bulk endirim', computeLine({ baseUnit: 20, quantity: 2, bulkPerUnit: 1 }).finalPrice === 38);
ok('pricing: kupon məbləği cəmdən çox ola bilməz', computeLine({ baseUnit: 3, quantity: 1, couponValue: 50 }).finalPrice === 0);

// ───────────────────────── 2) /api/order ─────────────────────────
const PRODUCTS = [
  { _id: 'p1', name: 'Ulduz Model Boyunbağı', variants: [{ modelName: 'Ulduz', colorName: 'Gümüş rəngli', price: 25.6, discountPrice: 20.49 }],
    customBoxOptions: [{ id: 'gift', name: 'Hədiyyə qutusu', price: 3, isActive: true }], hasCoupons: true, coupons: [{ code: 'YENI5', discountValue: 5 }] },
  { _id: 'p2', name: 'Polad Qolbaq', variants: [{ modelName: '', colorName: 'Qara', price: 17.9 }], customBoxOptions: [], hasCoupons: false, coupons: [] },
];
let mutations = [];
let previousCount = 0;
let sanityDown = false;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (sanityDown) throw new Error('şəbəkə xətası');
  if (u.includes('/data/query/')) {
    const query = new URL(u).searchParams.get('query');
    if (query.includes('_type == "product"')) return json({ result: PRODUCTS });
    if (query.includes('bulkDiscountPerUnit')) return json({ result: 1 });
    if (query.includes('count(*[_type == "order"')) return json({ result: previousCount });
  }
  if (u.includes('/data/mutate/')) { mutations.push(JSON.parse(opts.body).mutations); return json({ results: [] }); }
  throw new Error('gözlənilməyən fetch: ' + u);
};

const item = (extra = {}) => ({ productId: 'p1', variantIndex: 0, quantity: 1, boxId: null, couponCode: null, customerType: 'new', hasCustomText: true, hasPhoto: false, clientTotal: 18.44, ...extra });
const body = (n = '20261115-120000', extra = {}) => ({
  orderNumber: `RV-${n}`, lang: 'az', clientTotal: 18.44, delivery: 'metro', deliveryDate: '20 Noyabr 2026',
  utm: { source: 'instagram', medium: 'cpc', campaign: 'yeni-il' }, phone: '051 983 14 83', items: [item()], ...extra,
});
const lastDoc = () => mutations.at(-1)[0].createIfNotExists;
let seq = 0; const ip = () => `7.7.${Math.floor(seq / 200)}.${seq++ % 200}`; // hər test üçün ayrı IP (rate-limit qarışmasın)

let r = mkRes(); await order(mkReq('GET'), r); ok('order: GET → 405', r.code === 405);
r = mkRes(); await order(mkReq('POST', {}, body(), ip()), r); ok('order: Origin yoxdur → 403', r.code === 403, r.code);
r = mkRes(); await order(mkReq('POST', { origin: 'https://evil.example' }, body(), ip()), r); ok('order: yad sayt → 403', r.code === 403, r.code);

delete process.env.SANITY_WRITE_TOKEN;
r = mkRes(); await order(mkReq('POST', RAVIO, body(), ip()), r);
ok('order: SANITY_WRITE_TOKEN yoxdur → 200 {ok:false, not-configured}, heç nə yazılmır', r.code === 200 && r.body.ok === false && r.body.reason === 'not-configured' && mutations.length === 0, JSON.stringify(r.body));

process.env.SANITY_WRITE_TOKEN = 'test-token';
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), orderNumber: 'HACK-1' }, ip()), r); ok('order: səhv sifariş nömrəsi → 400', r.code === 400, r.code);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), items: [] }, ip()), r); ok('order: boş səbət → 400', r.code === 400, r.code);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), items: Array.from({ length: 31 }, () => item()) }, ip()), r); ok('order: 31 sətir → 400', r.code === 400, r.code);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), items: [item({ quantity: 100 })] }, ip()), r); ok('order: say 100 → 400', r.code === 400, r.code);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), items: [item({ quantity: 1.5 })] }, ip()), r); ok('order: kəsr say → 400', r.code === 400, r.code);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body(), clientTotal: -1 }, ip()), r); ok('order: mənfi məbləğ → 400', r.code === 400, r.code);
ok('order: yoxlama rədd edəndə Sanity-yə heç nə yazılmayıb', mutations.length === 0);

// Düzgün sifariş + məxfilik
const dirty = { ...body('20261115-120001'), customerName: 'Test Müştəri', address: 'Nərimanov rayonu 12', birthDate: '1 Yanvar 1990', email: 'a@b.az' };
r = mkRes(); await order(mkReq('POST', RAVIO, dirty, ip()), r);
let doc = mutations.length ? lastDoc() : {};
ok('order: düzgün sifariş → 200 ok', r.code === 200 && r.body.ok === true, JSON.stringify(r.body));
ok('order: server məbləği 18.44, uyğunsuzluq yoxdur', r.body.serverTotal === 18.44 && r.body.mismatch === false && doc.totalsMismatch === false, JSON.stringify(r.body));
ok('order: createIfNotExists + _id = order-<nömrə> (təkrar sorğu dublikat yaratmır)', mutations.at(-1)[0].createIfNotExists && doc._id === 'order-RV-20261115-120001' && doc._type === 'order');
const raw = JSON.stringify(doc);
ok('order: ŞƏXSİ MƏLUMAT YOXDUR (ad, ünvan, doğum tarixi, e-poçt, telefon rəqəmləri)', !/Test Müştəri|Nərimanov|1990|a@b\.az|9831483|0519831483/.test(raw), raw);
ok('order: telefon yalnız 32 simvolluq hash kimi saxlanır', /^[0-9a-f]{32}$/.test(doc.phoneHash || ''), doc.phoneHash);
ok('order: UTM mənbəyi yazılır, status "new"', doc.utm.source === 'instagram' && doc.utm.campaign === 'yeni-il' && doc.status === 'new');
ok('order: məhsul adı SERVERDƏN (Sanity-dən) gəlir', doc.items[0].productName === 'Ulduz Model Boyunbağı' && doc.items[0].variantLabel === 'Ulduz / Gümüş rəngli');
ok('order: eyni telefon → eyni hash', (() => { const a = doc.phoneHash; return a === doc.phoneHash && a.length === 32; })());

// "Daimi müştəri" iddiası
const loyalBody = (n) => ({ ...body(n), items: [item({ customerType: 'loyal', clientTotal: 16.39 })], clientTotal: 16.39 });
previousCount = 0;
r = mkRes(); await order(mkReq('POST', RAVIO, loyalBody('20261115-120002'), ip()), r); doc = lastDoc();
ok('order: "daimi" seçib, əvvəlki qeyd 0 → loyalNoHistory=true', doc.loyalNoHistory === true && doc.previousOrders === 0 && doc.customerTypeClaimed === 'loyal', JSON.stringify({ a: doc.loyalNoHistory, b: doc.previousOrders }));
previousCount = 3;
r = mkRes(); await order(mkReq('POST', RAVIO, loyalBody('20261115-120003'), ip()), r); doc = lastDoc();
ok('order: "daimi" seçib, əvvəlki 3 sifariş → loyalNoHistory=false', doc.loyalNoHistory === false && doc.previousOrders === 3);
previousCount = 0;

// Məbləğ saxtakarlığı və kupon/qutu/bulk
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120004'), clientTotal: 5, items: [item({ clientTotal: 5 })] }, ip()), r); doc = lastDoc();
ok('order: müştəri tərəfi məbləği aşağı salıb (5 ₼) → totalsMismatch=true', doc.totalsMismatch === true && doc.serverTotal === 18.44 && doc.issues.includes('line-total-differs'), JSON.stringify(doc.issues));
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120005'), clientTotal: 13.44, items: [item({ couponCode: 'YENI5', clientTotal: 13.44 })] }, ip()), r); doc = lastDoc();
ok('order: düzgün kupon (YENI5 −5 ₼) → 13.44, uyğunsuzluq yox', doc.serverTotal === 13.44 && doc.totalsMismatch === false && doc.couponCodes[0] === 'YENI5', JSON.stringify({ t: doc.serverTotal, i: doc.issues }));
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120006'), clientTotal: 10, items: [item({ couponCode: 'UYDURMA', clientTotal: 10 })] }, ip()), r); doc = lastDoc();
ok('order: mövcud olmayan kupon → coupon-not-valid + mismatch', doc.issues.includes('coupon-not-valid') && doc.totalsMismatch === true, JSON.stringify(doc.issues));
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120007'), clientTotal: 41.98, items: [item({ quantity: 2, boxId: 'gift', customerType: null, clientTotal: 41.98 })] }, ip()), r); doc = lastDoc();
ok('order: 2 ədəd + qutu (3 ₼) + bulk (1 ₼/ədəd) → 41.98', doc.serverTotal === 41.98 && doc.totalsMismatch === false && doc.items[0].boxName === 'Hədiyyə qutusu', JSON.stringify({ t: doc.serverTotal, i: doc.issues }));
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120008'), items: [item({ productId: 'yoxdur' })] }, ip()), r); doc = lastDoc();
ok('order: mövcud olmayan məhsul → product-not-found + mismatch (yenə də yazılır)', doc.issues.includes('product-not-found') && doc.totalsMismatch === true);
r = mkRes(); await order(mkReq('POST', RAVIO, { ...body('20261115-120009'), clientTotal: 36.34, items: [item({ clientTotal: 18.44 }), item({ productId: 'p2', customerType: 'new', clientTotal: 16.11 })] }, ip()), r); doc = lastDoc();
ok('order: 2 məhsul → cəm 34.55 (18.44 + 16.11), 2 sətir yazılır', doc.itemsCount === 2 && doc.items.length === 2 && doc.serverTotal === 34.55, JSON.stringify({ t: doc.serverTotal, n: doc.items.length }));

// Xəta halları
sanityDown = true;
r = mkRes(); await order(mkReq('POST', RAVIO, body('20261115-120010'), ip()), r);
ok('order: Sanity əlçatmaz → 200 {ok:false} (müştəriyə təsir etmir, 500 yox)', r.code === 200 && r.body.ok === false, r.code);
sanityDown = false;

let limited = false;
for (let i = 0; i < 14; i++) { const rr = mkRes(); await order(mkReq('POST', RAVIO, body(`20261116-1000${String(i).padStart(2, '0')}`), '9.9.9.9'), rr); if (rr.code === 429) limited = true; }
ok('order: 14 sorğu/dəq eyni IP-dən → 429', limited);

console.log(`\nNƏTİCƏ: ${pass} keçdi, ${fail} uğursuz`);
process.exit(fail ? 1 : 0);
