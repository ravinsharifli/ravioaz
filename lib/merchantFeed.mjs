// lib/merchantFeed.mjs — Google Merchant Center üçün məhsul feed-i (RSS 2.0 + g: sahələri). SAF funksiya, test olunur.
// Oxuyan: generate-feed.mjs (build zamanı Sanity-dən məhsulları çəkir → public/google-feed.xml).
// Yalnız həqiqi məlumat: Sanity-dəki ad, təsvir, şəkil, qiymət, stok. Material/gümüş kimi iddialar YAZILMIR.

const SITE = 'https://ravio.az';

// Google Merchant Center başqasının ticarət markasını (saxta mal şübhəsi) qəbul etmir və hesabı bloklaya bilər.
// Başlığında/təsvirində bu markalar olan məhsullar feed-ə DÜŞMÜR (saytda olduğu kimi qalır). Siyahı genişləndirilə bilər.
// Qeyd: "Kasio", "Zipo", "Roleks" kimi yazılışlar (sayt qərarı) bu qaydaya düşmür.
export const RISKY_BRANDS = /\b(casio|zippo|rolex|armani|nike|adidas|gucci|chanel|louis vuitton|apple|samsung|cartier|pandora)\b/i;

function xml(str) {
  return String(str ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function clip(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim();
}
const azn = (n) => `${Number(n).toFixed(2)} AZN`;

/**
 * @param {Array<{name, slug, description?, seoDescription?, category?, imageUrl?, price?, discountPrice?, inStock?}>} products
 * @returns {{xml: string, included: number, skipped: string[], skippedBrand: string[]}}
 */
export function buildMerchantFeed(products, { site = SITE } = {}) {
  const items = [];
  const skipped = [];
  const skippedBrand = [];
  for (const p of products || []) {
    if (!p || !p.slug || !p.name) continue;
    const price = Number(p.price);
    if (RISKY_BRANDS.test(`${p.name} ${p.description || ''}`)) { skippedBrand.push(p.slug); continue; }
    if (!Number.isFinite(price) || price <= 0 || !p.imageUrl) { skipped.push(p.slug); continue; }
    const discount = Number(p.discountPrice);
    const hasSale = Number.isFinite(discount) && discount > 0 && discount < price;
    const desc = clip(p.description || p.seoDescription || `${p.name} — Ravio-dan fərdi lazer yazılı hədiyyə.`, 5000);
    items.push(`    <item>
      <g:id>${xml(p.slug)}</g:id>
      <g:title>${xml(clip(p.name, 150))}</g:title>
      <g:description>${xml(desc)}</g:description>
      <g:link>${xml(`${site}/mehsullar/${p.slug}`)}</g:link>
      <g:image_link>${xml(p.imageUrl)}</g:image_link>
      <g:availability>${p.inStock === false ? 'out_of_stock' : 'in_stock'}</g:availability>
      <g:price>${azn(price)}</g:price>${hasSale ? `\n      <g:sale_price>${azn(discount)}</g:sale_price>` : ''}
      <g:condition>new</g:condition>
      <g:brand>Ravio</g:brand>
      <g:identifier_exists>no</g:identifier_exists>${p.category ? `\n      <g:product_type>${xml(p.category)}</g:product_type>` : ''}
    </item>`);
  }
  const out = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Ravio</title>
    <link>${site}</link>
    <description>Ravio — Bakıda lazer yazılı fərdi hədiyyələr</description>
${items.join('\n')}
  </channel>
</rss>
`;
  return { xml: out, included: items.length, skipped, skippedBrand };
}
