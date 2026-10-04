// Işlət:  node scripts/api-guard.test.mjs
// /api/capi, /api/track-purchase və /api/upload-image qoruma qaydalarını yoxlayır (asılılıq yoxdur).
import capi from '../api/capi.js';
import track from '../api/track-purchase.js';
import upload from '../api/upload-image.js';

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ← ' + extra}`); };
const mkReq = (method, headers = {}, body = undefined, ip = '1.1.1.1') => ({ method, headers: { 'x-forwarded-for': ip, ...headers }, body });
const mkRes = () => ({ code: 200, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
const RAVIO = { origin: 'https://ravio.az' };

process.env.META_CAPI_TOKEN = 'tok'; process.env.IMGBB_API_KEY = 'secret-key'; process.env.VERCEL_ENV = 'production';
const calls = [];
globalThis.fetch = async (url, opts) => {
  calls.push({ url: String(url), body: opts?.body });
  if (String(url).includes('graph.facebook.com')) return { ok: true, json: async () => ({ events_received: 1 }) };
  if (String(url).includes('api.imgbb.com')) return { ok: true, status: 200, json: async () => ({ success: true, data: { url: 'https://i.ibb.co/abc/x.jpg', delete_url: 'SECRET' } }) };
  throw new Error('gözlənilməyən fetch: ' + url);
};
const graphCalls = () => calls.filter(c => c.url.includes('graph.facebook.com')).length;
const goodBody = (n = '20261004-101530') => ({ orderNumber: `RV-${n}`, value: 49.9, phone: '051 983 14 83', items: [{ productId: 'p1', quantity: 2, unitPrice: 24.95 }] });

let r = mkRes(); await track(mkReq('GET'), r); ok('track: GET → 405', r.code === 405);
r = mkRes(); await track(mkReq('POST', {}, goodBody()), r); ok('track: Origin yoxdur → 403', r.code === 403, r.code);
r = mkRes(); await track(mkReq('POST', { origin: 'https://evil.example' }, goodBody()), r); ok('track: yad sayt → 403', r.code === 403, r.code);
r = mkRes(); await track(mkReq('POST', { origin: 'https://ravioaz-git-x.vercel.app' }, goodBody()), r); ok('track: production-da *.vercel.app → 403', r.code === 403, r.code);
r = mkRes(); await track(mkReq('POST', RAVIO, goodBody('20261004-101530')), r); ok('track: düzgün sorğu → 200', r.code === 200 && r.body.ok === true, JSON.stringify(r.body));
ok('track: Meta-ya 1 sorğu getdi', graphCalls() === 1, graphCalls());
const sent = JSON.parse(calls.find(c => c.url.includes('graph.facebook.com')).body);
ok('track: event_id = sifariş nömrəsi, value=49.9', sent.data[0].event_id === 'RV-20261004-101530' && sent.data[0].custom_data.value === 49.9, JSON.stringify(sent.data[0].custom_data));
ok('track: telefon HASH olunub', !JSON.stringify(sent).includes('9831483') && sent.data[0].user_data.ph?.[0]?.length === 64);
r = mkRes(); await track(mkReq('POST', RAVIO, goodBody('20261004-101530')), r); ok('track: eyni sifariş təkrar → duplicate, yeni Meta sorğusu YOX', r.code === 200 && r.body.duplicate === true && graphCalls() === 1, JSON.stringify(r.body) + graphCalls());
r = mkRes(); await track(mkReq('POST', RAVIO, { ...goodBody('20261004-111111'), orderNumber: 'HACK-1' }), r); ok('track: səhv sifariş nömrəsi → 400', r.code === 400, r.code);
r = mkRes(); await track(mkReq('POST', RAVIO, { ...goodBody('20261004-121212'), value: 99999 }), r); ok('track: absurd məbləğ → 400', r.code === 400, r.code);
r = mkRes(); await track(mkReq('POST', RAVIO, { ...goodBody('20261004-131313'), value: -5 }), r); ok('track: mənfi məbləğ → 400', r.code === 400, r.code);
r = mkRes(); await track(mkReq('POST', RAVIO, { ...goodBody('20261004-141414'), phone: '12' }), r); ok('track: qısa telefon → sifariş yenə izlənir (200)', r.code === 200, r.code);
let last429 = false;
for (let i = 0; i < 14; i++) { const rr = mkRes(); await track(mkReq('POST', RAVIO, goodBody(`20261005-1000${String(i).padStart(2, '0')}`), '9.9.9.9'), rr); if (rr.code === 429) last429 = true; }
ok('track: 14 sorğu/dəq eyni IP-dən → 429', last429);
r = mkRes(); await capi(mkReq('POST', RAVIO, { event: 'Contact' }, '2.2.2.2'), r); ok('capi: Contact → 200', r.code === 200 && r.body.ok === true, JSON.stringify(r.body));
r = mkRes(); await capi(mkReq('POST', RAVIO, { event: 'Purchase' }, '2.2.2.3'), r); ok('capi: Purchase icazəli deyil → 400', r.code === 400, r.code);
r = mkRes(); await capi(mkReq('POST', {}, { event: 'Contact' }, '2.2.2.4'), r); ok('capi: Origin yoxdur → 403', r.code === 403, r.code);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16]), Buffer.alloc(200, 1)]).toString('base64');
r = mkRes(); await upload(mkReq('POST', RAVIO, { image: jpeg }, '3.3.3.1'), r); ok('upload: JPEG → 200 + url', r.code === 200 && r.body.url === 'https://i.ibb.co/abc/x.jpg', JSON.stringify(r.body));
ok('upload: cavabda açar/delete_url YOXDUR', !JSON.stringify(r.body).includes('secret') && !JSON.stringify(r.body).includes('SECRET'));
ok('upload: imgbb sorğusu açarla SERVERDƏN gedir', calls.some(c => c.url.includes('api.imgbb.com') && c.url.includes('secret-key')));
r = mkRes(); await upload(mkReq('POST', RAVIO, { image: Buffer.from('salam dünya bu şəkil deyil').toString('base64') }, '3.3.3.2'), r); ok('upload: şəkil olmayan fayl → 400', r.code === 400, r.code);
r = mkRes(); await upload(mkReq('POST', RAVIO, { image: 'A'.repeat(4_100_000) }, '3.3.3.3'), r); ok('upload: həddindən böyük → 400', r.code === 400, r.code);
r = mkRes(); await upload(mkReq('POST', { origin: 'https://evil.example' }, { image: jpeg }, '3.3.3.4'), r); ok('upload: yad sayt → 403', r.code === 403, r.code);
r = mkRes(); await upload(mkReq('POST', RAVIO, { image: 'data:image/jpeg;base64,' + jpeg }, '3.3.3.5'), r); ok('upload: data: URL prefiksi qəbul olunur', r.code === 200, r.code);
delete process.env.IMGBB_API_KEY;
r = mkRes(); await upload(mkReq('POST', RAVIO, { image: jpeg }, '3.3.3.6'), r); ok('upload: açar quraşdırılmayıb → 500 (sirr sızmır)', r.code === 500 && !JSON.stringify(r.body).includes('secret'), r.code);
process.env.VERCEL_ENV = 'preview';
r = mkRes(); await capi(mkReq('POST', { origin: 'https://ravioaz-git-test.vercel.app' }, { event: 'Contact' }, '4.4.4.1'), r); ok('capi: preview mühitində *.vercel.app icazəlidir', r.code === 200, r.code);
console.log(`\nNƏTİCƏ: ${pass} keçdi, ${fail} uğursuz`);
process.exit(fail ? 1 : 0);
