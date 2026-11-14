// Işlət:  node scripts/telegram.test.mjs
// /api/telegram botunu və sifariş mesajı oxuyucusunu yoxlayır (asılılıq yoxdur, real şəbəkə yoxdur).
import { parseOrder } from '../lib/telegramOrder.js';
import handler from '../api/telegram.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ← ' + extra}`); };

const IMG = 'https://ravio.az/api/img?f=1e35dedd9ef0e67b4c0f96fc5df742369a418336-960x1280.jpg';
const CUST = 'https://i.ibb.co/sp6ynky2/cf03fcaae440.jpg';

// 1) Real nümunə — 1 ədəd (sətirlər birləşmiş formada)
const ONE = `SİFARİŞ: Ravio - 14.11.26-17:13:14 MƏHSUL 1 - Ad: Açılan Polad Boyunbağı - Fotolu Madalyon - Model: Oval formada - Rəng: Gümüşü - Say: 1 ədəd - Qutu: Özəl qutu - Yazı: Seni sevirem - Yazı forması: Times New Roman İtalic - Əlavə qeyd: Seliqeli yazilsin - Xüsusi istək: Müştəri şəkli: ${CUST} - Məhsul şəkli: ${IMG} ───────────────── ÇATDIRILMA - Növ: Ünvana çatdırılma - Ünvan/Metro: Yasamal rayonu, Mireli Seyidov 13 - Tarix: 17 Noyabr 2026 - Saat: Gün ərzində MÜŞTƏRİ - Ad: Ravin - Telefon: 0558603040 - Doğum tarixi: 08 Sentyabr 1991 ───────────────── MƏBLƏĞ - İlkin qiymət: 38.99 ₼ - Yekun məbləğ: 28.33 ₼ - Beh (50%): 15.00 ₼ - Qalıq: 13.33 ₼`;
// 2) Real nümunə — 2 ədəd (istehsalçı qeydi ilə)
const TWO = ONE.replace('Say: 1 ədəd', 'Say: 2 ədəd').replace(`${IMG} ─────`, `${IMG} İSTEHSALÇI ÜÇÜN QEYD - Cəmi 2 məhsul var. Hər məhsul ayrı şəxsə veriləcək. - Zəhmət olmasa hər məhsul ayrı qutu və ayrı paketdə hazırlansın. ─────`);
// 3) Sətirli (WhatsApp-dan birbaşa) forma, çoxlu yazı və 2 müştəri şəkli, 2 müxtəlif məhsul
const MULTI = [
  'SİFARİŞ: Ravio - 15.11.26-09:00:00', '',
  'MƏHSUL 1', '- Ad: Təsbeh', '- Model: —', '- Rəng: Qara', '- Say: 1 ədəd', '',
  '- YAZILAR (2):', '1. Ata', '2. Anam', '- Yazı forması: Monotype Corsiva', '- Əlavə qeyd: Kiçik yazılsın', '- Xüsusi istək:',
  'Müştəri şəkli 1: https://i.ibb.co/aaa/1.jpg', 'Müştəri şəkli 2: https://i.ibb.co/bbb/2.jpg', '',
  `- Məhsul şəkli: ${IMG}`, '',
  'MƏHSUL 2', '- Ad: Pulqabı', '- Model: Klassik', '- Rəng: Qəhvəyi', '- Say: 1 ədəd', '- Yazı: Elnur', '', `- Məhsul şəkli: ${IMG}`, '',
  '─────────────────', 'ÇATDIRILMA', '- Növ: Metro', 'MÜŞTƏRİ', '- Ad: Test', '- Telefon: 0501112233',
].join('\n');

// ── Parser ──
let o = parseOrder(ONE); let p = o.products[0];
ok('parser(1): başlıq', o.title === 'Ravio - 14.11.26-17:13:14', o.title);
ok('parser(1): 1 məhsul', o.products.length === 1, o.products.length);
ok('parser(1): ad', p.name === 'Açılan Polad Boyunbağı - Fotolu Madalyon', p.name);
ok('parser(1): model/rəng/qutu', p.model === 'Oval formada' && p.color === 'Gümüşü' && p.box === 'Özəl qutu', JSON.stringify(p));
ok('parser(1): yazı və yazı tipi', p.texts[0] === 'Seni sevirem' && p.font === 'Times New Roman İtalic', JSON.stringify([p.texts, p.font]));
ok('parser(1): qeyd', p.note === 'Seliqeli yazilsin', p.note);
ok('parser(1): şəkillər', p.customerPhotos[0] === CUST && p.productImage === IMG, JSON.stringify([p.customerPhotos, p.productImage]));
ok('parser(1): Xüsusi istək boşdur', p.special === '', p.special);
ok('parser(1): müştərinin adı/telefonu məhsula qarışmayıb', p.name !== 'Ravin' && !JSON.stringify(p).includes('0558603040'));
o = parseOrder(TWO); p = o.products[0];
ok('parser(2): say = 2', p.qty === 2, p.qty);
ok('parser(2): istehsalçı qeydi məhsul şəklinə qarışmayıb', p.productImage === IMG, p.productImage);
o = parseOrder(MULTI);
ok('parser(3): 2 məhsul', o.products.length === 2, o.products.length);
ok('parser(3): 2 yazı sətri', JSON.stringify(o.products[0].texts) === JSON.stringify(['Ata', 'Anam']), JSON.stringify(o.products[0].texts));
ok('parser(3): 2 müştəri şəkli', o.products[0].customerPhotos.length === 2, o.products[0].customerPhotos.length);
ok('parser(3): ikinci məhsul', o.products[1].name === 'Pulqabı' && o.products[1].texts[0] === 'Elnur', JSON.stringify(o.products[1]));
ok('parser: boş/yad mətn → 0 məhsul', parseOrder('salam necəsən').products.length === 0);

// ── Handler ──
process.env.TELEGRAM_BOT_TOKEN = 'TESTTOKEN'; process.env.TELEGRAM_WEBHOOK_SECRET = 'sirr123'; process.env.TELEGRAM_OWNER_ID = '111';
const tgCalls = []; const outside = [];
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.startsWith('https://api.telegram.org/')) {
    const method = url.split('/').pop();
    let fields = {}; let fileCount = 0;
    if (opts.body instanceof FormData) { for (const [k, v] of opts.body.entries()) { if (typeof v === 'string') fields[k] = v; else fileCount++; } }
    else if (opts.body) fields = JSON.parse(opts.body);
    tgCalls.push({ method, fields, fileCount });
    return { ok: true, status: 200, json: async () => ({ ok: true, result: {} }) };
  }
  if (url.includes('apicdn.sanity.io')) return { ok: true, json: async () => ({ result: { _id: '17820dea-77f1-40b7-9eb6-3093113aa2ce', name: 'Sanity adı' } }) };
  if (url.startsWith('https://cdn.sanity.io/') || url.startsWith('https://i.ibb.co/')) {
    return { ok: true, status: 200, headers: { get: () => 'image/jpeg' }, arrayBuffer: async () => new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]).buffer };
  }
  outside.push(url); throw new Error('gözlənilməyən fetch: ' + url);
};
const mkRes = () => ({ code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
let uid = 1;
const send = async (text, { from = 111, secret = 'sirr123', type = 'private' } = {}) => {
  tgCalls.length = 0; const r = mkRes();
  await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': secret }, body: { update_id: uid++, message: { text, from: { id: from }, chat: { id: from, type } } } }, r);
  return r;
};

let r = mkRes(); await handler({ method: 'GET', headers: {} }, r); ok('bot: GET → 405', r.code === 405);
r = await send(ONE, { secret: 'yanlis' }); ok('bot: səhv gizli söz → 401, heç nə göndərilmir', r.code === 401 && tgCalls.length === 0, r.code);
r = await send(ONE, { from: 999 }); ok('bot: yad istifadəçi → səssiz, heç nə göndərilmir', r.code === 200 && tgCalls.length === 0, tgCalls.length);
r = await send('/start', { from: 999 }); ok('bot: yad /start → yalnız öz ID-sini görür', tgCalls.length === 1 && tgCalls[0].fields.text.includes('999') && !tgCalls[0].fields.text.includes('sirr'), JSON.stringify(tgCalls));

r = await send(ONE);
ok('1 ədəd: 1 albom (sendMediaGroup, 2 fayl)', tgCalls.length === 1 && tgCalls[0].method === 'sendMediaGroup' && tgCalls[0].fileCount === 2, JSON.stringify(tgCalls.map(c => [c.method, c.fileCount])));
const media = JSON.parse(tgCalls[0].fields.media); const cap = media[0].caption;
ok('1 ədəd: başlıq ilk şəkildədir, 2 şəkil var', media.length === 2 && !!cap && !media[1].caption, JSON.stringify(media));
ok('1 ədəd: başlıqda ad/kod/say/yazı/tip/qeyd', ['Açılan Polad Boyunbağı', '17820dea', 'Say: 1 ədəd', 'Seni sevirem', 'Times New Roman İtalic', 'Seliqeli yazilsin', 'Oval formada', 'Özəl qutu'].every(s => cap.includes(s)), cap);
ok('1 ədəd: telefon/ünvan/qiymət istehsalçıya getmir', !/0558603040|Yasamal|28\.33|Ravin/.test(cap), cap);
ok('1 ədəd: "ayrı paket" xəbərdarlığı yoxdur', !cap.includes('Ayrı qutu'), cap);

r = await send(TWO);
ok('2 ədəd: 2 ayrı albom', tgCalls.length === 2 && tgCalls.every(c => c.method === 'sendMediaGroup'), JSON.stringify(tgCalls.map(c => c.method)));
ok('2 ədəd: 1/2 və 2/2 nömrələri, ayrı paket qeydi', JSON.parse(tgCalls[0].fields.media)[0].caption.includes('Məhsul 1/2') && JSON.parse(tgCalls[1].fields.media)[0].caption.includes('Məhsul 2/2') && JSON.parse(tgCalls[1].fields.media)[0].caption.includes('Ayrı qutu'));

r = await send(MULTI);
ok('2 məhsul: 2 albom, birincidə 3 şəkil (1 məhsul + 2 müştəri)', tgCalls.length === 2 && JSON.parse(tgCalls[0].fields.media).length === 3, JSON.stringify(tgCalls.map(c => c.method)));
const c3 = JSON.parse(tgCalls[0].fields.media)[0].caption;
ok('2 məhsul: çoxlu yazılar və qeyd görünür, "—" model gizlədilir', c3.includes('1. <b>Ata</b>') && c3.includes('2. <b>Anam</b>') && c3.includes('Monotype Corsiva') && !c3.includes('Model') && c3.includes('Məhsul 1/2'), c3);

r = await send('salam necəsən'); ok('mənasız mətn → izahat mesajı', tgCalls.length === 1 && tgCalls[0].method === 'sendMessage' && tgCalls[0].fields.text.includes('tapılmadı'));
r = await send(ONE.replace(CUST, 'https://evil.example/x.jpg'));
ok('yad host-dan müştəri şəkli yüklənmir (SSRF qorusu)', outside.length === 0 && !outside.some(u => u.includes('evil')), JSON.stringify(outside));
const evil = JSON.stringify(tgCalls); ok('yad host linki Telegram-a da ötürülmür', !evil.includes('evil.example'), evil);
delete process.env.TELEGRAM_WEBHOOK_SECRET;
r = await send(ONE); ok('quraşdırılmayıb → 503', r.code === 503, r.code);

console.log(`\nNƏTİCƏ: ${pass} keçdi, ${fail} uğursuz`);
process.exit(fail ? 1 : 0);
