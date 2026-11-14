// Telegram sifariş botu (Ravio_Sifaris_Bot).
// İş axını: WhatsApp-dan gələn sifariş mesajı bota yapışdırılır → bot hər məhsul üçün
// ayrı albom (məhsul şəkli + müştəri şəkli + qısa məlumat) göndərir → albom WhatsApp-da
// istehsalçıya "Share" edilir.
//
// Lazım olan Vercel mühit dəyişənləri:
//   TELEGRAM_BOT_TOKEN       — BotFather-dən alınan token
//   TELEGRAM_OWNER_ID        — sahibin Telegram ID-si (bir neçə nəfər üçün vergüllə)
//   TELEGRAM_WEBHOOK_SECRET  — setWebhook zamanı verilən gizli söz (Telegram-ın özündən gəldiyini yoxlayır)
//
// TƏHLÜKƏSİZLİK: yalnız TELEGRAM_OWNER_ID-dəki şəxsin mesajlarına cavab verilir, qalanları
// səssiz buraxılır. Server yalnız ravio/Sanity və imgbb şəkil linklərinə sorğu atır.
import { timingSafeEqual } from 'node:crypto';
import {
  parseOrder,
  productImageFile,
  sanityImageUrl,
  isCustomerPhotoUrl,
  sanityLookupUrl,
  buildCaption,
  esc,
} from '../lib/telegramOrder.js';

export const config = { maxDuration: 30 };

const TG = 'https://api.telegram.org';
const MAX_UNITS = 20; // bir sifarişdə maksimum albom sayı (səhv/sui-istifadə qorusu)
const MAX_CUSTOMER_PHOTOS = 8; // albom limiti 10 şəkildir (1 məhsul + 8 müştəri)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // Telegram foto limiti

// Telegram eyni update-i təkrar göndərə bilər — son baxılanları yadda saxlayırıq (best-effort)
const seen = new Set();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

async function tg(method, payload, files = []) {
  const url = `${TG}/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
  let init;
  if (files.length) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    for (const f of files) fd.append(f.field, new Blob([f.buf], { type: f.type }), f.name);
    init = { method: 'POST', body: fd };
  } else {
    init = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) };
  }
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(`Telegram ${method}: ${j.description || r.status}`);
  return j;
}

const say = (chatId, text) => tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });

async function download(url) {
  try {
    // redirect: 'manual' — yönləndirmə izlənmir (server başqa ünvana aparılmasın)
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const type = r.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length || buf.length > MAX_IMAGE_BYTES) return null;
    return { buf, type };
  } catch {
    return null;
  }
}

async function lookupProduct(file) {
  try {
    const r = await fetch(sanityLookupUrl(file), { signal: AbortSignal.timeout(5000) });
    const j = await r.json();
    return j?.result || null;
  } catch {
    return null;
  }
}

// images: [{ url, buf?, type? }] — buf varsa fayl kimi yüklənir, yoxdursa Telegram linkdən özü götürür
async function sendUnit(chatId, caption, images) {
  const fits = caption.length <= 1024;
  if (!images.length) return say(chatId, caption);

  const items = [];
  const files = [];
  images.forEach((img, i) => {
    let media = img.url;
    if (img.buf) {
      media = `attach://f${i}`;
      files.push({ field: `f${i}`, buf: img.buf, type: img.type, name: `photo${i}.jpg` });
    }
    items.push({ type: 'photo', media, ...(i === 0 && fits ? { caption, parse_mode: 'HTML' } : {}) });
  });

  try {
    if (items.length === 1) {
      const it = items[0];
      const payload = { chat_id: chatId, photo: it.media, ...(fits ? { caption, parse_mode: 'HTML' } : {}) };
      await tg('sendPhoto', payload, files);
    } else {
      await tg('sendMediaGroup', { chat_id: chatId, media: items }, files);
    }
    if (!fits) await say(chatId, caption.slice(0, 4000));
  } catch (err) {
    // Albom alınmadısa: əvvəlcə mətn, sonra şəkillər fayl kimi (heç vaxt məlumat itməsin)
    console.error('Albom göndərilmədi, ehtiyat üsul:', err.message);
    await say(chatId, caption.slice(0, 4000));
    for (const img of images) {
      try {
        if (img.buf) {
          await tg('sendDocument', { chat_id: chatId }, [{ field: 'document', buf: img.buf, type: img.type, name: 'photo.jpg' }]);
        } else {
          await tg('sendDocument', { chat_id: chatId, document: img.url });
        }
      } catch {
        await say(chatId, esc(img.url));
      }
    }
  }
}

async function handleOrder(chatId, text) {
  const { title, products } = parseOrder(text);
  if (!products.length) {
    return say(chatId, 'Sifariş tapılmadı. WhatsApp-dan gələn mesajı <b>tam</b> kopyalayıb yapışdır.');
  }

  const total = Math.min(
    products.reduce((s, p) => s + p.qty, 0),
    MAX_UNITS,
  );
  let unitNo = 0;

  for (const p of products) {
    // Şəkilləri və kodu hər məhsul üçün BİR dəfə hazırlayırıq, ədədlər üçün təkrar istifadə edirik
    const file = p.productImage ? productImageFile(p.productImage) : null;
    const [productImg, lookup, ...customerImgs] = await Promise.all([
      file ? download(sanityImageUrl(file)) : null,
      file ? lookupProduct(file) : null,
      ...p.customerPhotos
        .filter(isCustomerPhotoUrl)
        .slice(0, MAX_CUSTOMER_PHOTOS)
        .map(async (url) => ({ url, ...(await download(url)) })),
    ]);

    const images = [];
    if (file) images.push({ url: sanityImageUrl(file), ...(productImg || {}) });
    images.push(...customerImgs);

    const code = lookup?._id ? lookup._id.replace(/^drafts\./, '').slice(0, 8) : '';
    const product = { ...p, name: p.name || lookup?.name || '' };

    for (let i = 0; i < p.qty && unitNo < total; i++) {
      unitNo += 1;
      const caption = buildCaption({ title, unitNo, total, product, code });
      await sendUnit(chatId, caption, images);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!process.env.TELEGRAM_BOT_TOKEN || !secret) return res.status(503).json({ ok: false, error: 'not configured' });
  if (!safeEqual(req.headers['x-telegram-bot-api-secret-token'] || '', secret)) {
    return res.status(401).json({ ok: false });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const msg = update?.message;
    if (!msg || msg.chat?.type !== 'private') return res.status(200).json({ ok: true });

    if (seen.has(update.update_id)) return res.status(200).json({ ok: true, duplicate: true });
    seen.add(update.update_id);
    if (seen.size > 200) seen.delete(seen.values().next().value);

    const chatId = msg.chat.id;
    const text = msg.text || msg.caption || '';
    const owners = String(process.env.TELEGRAM_OWNER_ID || '').split(',').map((s) => s.trim()).filter(Boolean);
    const isOwner = owners.includes(String(msg.from?.id));

    if (/^\/start\b/.test(text)) {
      // Hər kəs yalnız ÖZ ID-sini görür (TELEGRAM_OWNER_ID-ni təyin etmək üçün)
      await say(
        chatId,
        isOwner
          ? 'Salam! WhatsApp-dan gələn sifariş mesajını bura yapışdır, hər məhsul üçün hazır albom göndərəcəm.'
          : `Sənin Telegram ID-n: <code>${esc(msg.from?.id)}</code>`,
      );
      return res.status(200).json({ ok: true });
    }

    if (!isOwner) return res.status(200).json({ ok: true }); // yadlara səssiz
    if (text.trim()) await handleOrder(chatId, text);
  } catch (err) {
    console.error('Telegram bot xətası:', err.message);
  }
  // Telegram-a həmişə 200 qaytarırıq ki, eyni mesajı təkrar-təkrar göndərməsin
  return res.status(200).json({ ok: true });
}
