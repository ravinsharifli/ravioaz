// WhatsApp sifariş mesajını (components/CartDrawer.tsx → buildMessage) oxuyub
// istehsalçı üçün hazır "məhsul kartı"na çevirən təmiz funksiyalar.
// Burada şəbəkə sorğusu YOXDUR — yalnız mətn emalı (test etmək asan olsun deyə).
//
// Mesaj iki formada gələ bilər: hər məlumat ayrı sətirdə (WhatsApp-dan birbaşa)
// və ya hamısı bir sətirdə (kopyalama zamanı sətirlər birləşəndə). Parser hər ikisini
// "etiket:" sözlərinə görə oxuyur, sətir sayına güvənmir.

const PROJECT_ID = 'w7scii42';
const DATASET = 'production';
export const IMG_FILE = /^[a-f0-9]{20,64}-\d{1,5}x\d{1,5}\.(jpg|jpeg|png|webp|gif)$/i;

// Etiketlər: uzun olanlar əvvəldə olmalıdır ("Yazı forması" "Yazı"dan əvvəl)
const LABEL_RE = /(?<=^|\s)(YAZILAR\s*\(\d+\)|Yazı forması|Əlavə qeyd|Xüsusi istək|Müştəri şəkli(?:\s*\d+)?|Məhsul şəkli|Model|Rəng|Say|Qutu|Yazı|Ad)\s*:/g;

function cleanValue(v) {
  // Birləşmiş formada dəyərin sonuna " -" ayırıcısı yapışır, onu atırıq
  return String(v).replace(/\s+-\s*$/, '').trim();
}

function parseProduct(part) {
  const marks = [...part.matchAll(LABEL_RE)].map((m) => ({
    label: m[1].replace(/\s+/g, ' '),
    start: m.index,
    end: m.index + m[0].length,
  }));

  const f = { texts: [], customerPhotos: [] };
  marks.forEach((mk, i) => {
    const raw = part.slice(mk.end, i + 1 < marks.length ? marks[i + 1].start : part.length);
    const val = cleanValue(raw);

    if (mk.label.startsWith('Müştəri şəkli')) {
      const url = val.match(/https?:\/\/\S+/)?.[0];
      if (url && !f.customerPhotos.includes(url)) f.customerPhotos.push(url);
    } else if (mk.label === 'Məhsul şəkli') {
      f.productImage = val.match(/https?:\/\/\S+/)?.[0] || '';
    } else if (mk.label.startsWith('YAZILAR')) {
      f.texts = val.split('\n').map((l) => l.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean);
    } else if (mk.label === 'Yazı') {
      if (val) f.texts = [val];
    } else if (mk.label === 'Ad') f.name = val;
    else if (mk.label === 'Model') f.model = val;
    else if (mk.label === 'Rəng') f.color = val;
    else if (mk.label === 'Say') f.qty = Math.max(1, parseInt(val, 10) || 1);
    else if (mk.label === 'Qutu') f.box = val;
    else if (mk.label === 'Yazı forması') f.font = val;
    else if (mk.label === 'Əlavə qeyd') f.note = val;
    else if (mk.label === 'Xüsusi istək') f.special = val;
  });

  return {
    name: f.name || '',
    model: f.model || '',
    color: f.color || '',
    qty: f.qty || 1,
    box: f.box || '',
    texts: f.texts,
    font: f.font || '',
    note: f.note || '',
    special: f.special || '',
    productImage: f.productImage || '',
    customerPhotos: f.customerPhotos,
  };
}

// Sifariş mətnindən: { title, products[] }. Məhsul tapılmasa products = [].
export function parseOrder(raw) {
  const text = String(raw || '').normalize('NFC').replace(/\r/g, '');
  const title = (text.match(/SİFARİŞ:\s*(.*?)\s*(?=MƏHSUL\s*\d|\n|$)/) || [])[1] || '';

  // Çatdırılma, müştəri, məbləğ və "istehsalçı üçün qeyd" hissələri lazım deyil:
  // istehsalçıya müştərinin telefonu/ünvanı/qiyməti getməməlidir.
  const cut = text.search(/İSTEHSALÇI ÜÇÜN QEYD|─{3,}|ÇATDIRILMA/);
  const body = cut === -1 ? text : text.slice(0, cut);

  const products = body
    .split(/MƏHSUL\s*\d+/)
    .slice(1)
    .map(parseProduct)
    .filter((p) => p.name || p.productImage || p.customerPhotos.length);

  return { title: title.trim(), products };
}

// ravio.az/api/img?f=... və ya cdn.sanity.io linkindən fayl adını çıxarır (başqa hostlar rədd edilir)
export function productImageFile(url) {
  try {
    const u = new URL(url);
    if ((u.hostname === 'ravio.az' || u.hostname === 'www.ravio.az') && u.pathname === '/api/img') {
      const f = u.searchParams.get('f');
      return f && IMG_FILE.test(f) ? f : null;
    }
    if (u.hostname === 'cdn.sanity.io') {
      const m = u.pathname.match(new RegExp(`/images/${PROJECT_ID}/${DATASET}/([^/]+)$`));
      return m && IMG_FILE.test(m[1]) ? m[1] : null;
    }
  } catch { /* yanlış link */ }
  return null;
}

export function sanityImageUrl(file) {
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${file}`;
}

// Müştəri şəkli yalnız imgbb-dən qəbul edilir (serverin ixtiyari saytlara sorğu atmaması üçün)
export function isCustomerPhotoUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (u.hostname === 'i.ibb.co' || u.hostname === 'ibb.co');
  } catch {
    return false;
  }
}

// Sanity-də məhsulu şəkil faylına görə tapmaq üçün (kod və ad üçün)
export function sanityLookupUrl(file) {
  const ref = 'image-' + file.replace(/\.(\w+)$/, '-$1');
  const q = '*[_type=="product" && $ref in variants[].images[].asset._ref][0]{_id,name}';
  return (
    `https://${PROJECT_ID}.apicdn.sanity.io/v2024-01-01/data/query/${DATASET}` +
    `?perspective=published&query=${encodeURIComponent(q)}&$ref=${encodeURIComponent(JSON.stringify(ref))}`
  );
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cap = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));
const real = (s) => s && s !== '—' && s !== '-';

// Bir fiziki məhsul (bir qutu) üçün Telegram başlığı (HTML)
export function buildCaption({ title, unitNo, total, product: p, code }) {
  const lines = [];
  if (title) lines.push(`🧾 ${esc(cap(title, 80))}`);
  lines.push(`🔢 Məhsul ${unitNo}/${total}`);
  lines.push(`📦 <b>${esc(cap(p.name || 'Məhsul', 150))}</b>`);
  if (code) lines.push(`🔖 Kod: <code>${esc(code)}</code>`);
  lines.push('🔢 Say: 1 ədəd');

  if (p.texts.length === 1) lines.push(`✍️ Yazı: <b>${esc(cap(p.texts[0], 200))}</b>`);
  else if (p.texts.length > 1) {
    lines.push('✍️ Yazılar:');
    p.texts.slice(0, 6).forEach((t, i) => lines.push(`${i + 1}. <b>${esc(cap(t, 100))}</b>`));
  }
  if (p.texts.length && real(p.font)) lines.push(`🔤 Yazı tipi: ${esc(cap(p.font, 60))}`);

  const info = [
    real(p.model) ? `Model: ${p.model}` : '',
    real(p.color) ? `Rəng: ${p.color}` : '',
    real(p.box) ? `Qutu: ${p.box}` : '',
  ].filter(Boolean);
  if (info.length) lines.push(`ℹ️ ${esc(cap(info.join(' · '), 200))}`);
  if (real(p.note)) lines.push(`📝 Qeyd: ${esc(cap(p.note, 250))}`);
  if (real(p.special)) lines.push(`⭐ Xüsusi istək: ${esc(cap(p.special, 250))}`);
  if (total > 1) lines.push('⚠️ Ayrı qutu və ayrı paketdə hazırlansın');
  return lines.join('\n');
}
