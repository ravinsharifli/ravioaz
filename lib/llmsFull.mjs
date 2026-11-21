// lib/llmsFull.mjs — public/llms-full.txt mətnini düzəldən SAF funksiya (şəbəkə yoxdur, test oluna bilir).
// Oxuyan: generate-llms.mjs (build zamanı, Sanity-dən məhsulları çəkib bura ötürür).
// Məqsəd: ChatGPT, Gemini kimi AI alətləri HƏR məhsulun adını, qiymətini və linkini bir faylda görsün.

const BASE_URL = 'https://ravio.az';

/** 19.9 → "19.90₼", 4.9 → "4.90₼" */
export function formatAzn(n) {
  return `${Number(n).toFixed(2)}₼`;
}

function priceText(prices) {
  const list = (prices || []).filter((p) => typeof p === 'number' && p > 0);
  if (list.length === 0) return 'qiymət səhifədə';
  const min = Math.min(...list);
  const max = Math.max(...list);
  return min === max ? formatAzn(min) : `${formatAzn(min)} – ${formatAzn(max)}`;
}

function oneLine(text, maxLen = 200) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 120 ? cut.slice(0, sp) : cut)}…`;
}

/**
 * @param {Array<{name:string, slug:string, category?:string, prices?:number[], desc?:string}>} products
 * @param {string} dateStr  YYYY-MM-DD
 */
export function buildLlmsFull(products, dateStr) {
  const valid = (products || []).filter((p) => p && p.name && p.slug);
  const byCat = new Map();
  for (const p of valid) {
    const key = p.category || 'Digər';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key).push(p);
  }
  const cats = [...byCat.keys()].sort((a, b) => a.localeCompare(b, 'az'));

  const lines = [];
  lines.push('# Ravio — Bütün məhsulların tam siyahısı');
  lines.push('');
  lines.push(
    '> Ravio (ravio.az) — Bakıda onlayn fərdi hədiyyə mağazası. Hər məhsula lazerlə ad, tarix, mesaj və ya şəkil həkk edilir. ' +
      'Yalnız onlayn satış (fiziki mağaza yoxdur), bütün Azərbaycana ödənişsiz çatdırılma, hazırlıq 1–3 gün. ' +
      'Sifariş sayt vasitəsilə WhatsApp-a göndərilir (+994519831483).',
  );
  lines.push('');
  lines.push(
    `Qiymətlər AZN ilə, saytda göstərilən cari satış qiymətləridir. Yenilənmə tarixi: ${dateStr}. ` +
      `Cəmi ${valid.length} məhsul. Qısa icmal üçün: ${BASE_URL}/llms.txt`,
  );

  for (const cat of cats) {
    const items = byCat.get(cat).slice().sort((a, b) => a.name.localeCompare(b.name, 'az'));
    lines.push('');
    lines.push(`## ${cat} (${items.length} məhsul)`);
    lines.push('');
    for (const p of items) {
      const desc = oneLine(p.desc);
      lines.push(`- [${p.name}](${BASE_URL}/mehsullar/${p.slug}) — ${priceText(p.prices)}${desc ? `. ${desc}` : ''}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}
