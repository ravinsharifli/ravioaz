// scripts/seo.test.mjs — SEO mərhələ 1: sxem zənginləşdirmə, FAQPage, Google Merchant feed. `npm test` işlədir.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { faqPageSchema } from '../lib/faqSchema.mjs';
import { buildMerchantFeed, RISKY_BRANDS } from '../lib/merchantFeed.mjs';

let pass = 0;
const ok = (name, cond, extra = '') => { if (!cond) { console.error(`FAIL  ${name}  ← ${extra}`); process.exitCode = 1; throw new Error(name); } pass++; console.log(`PASS  ${name}`); };
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf-8');

// ── FAQPage ───────────────────────────────────────────────────────
const faq = faqPageSchema([{ q: 'Çatdırılma ödənişsizdir?', a: 'Bəli.' }, { q: '', a: 'boş sual' }, null, { q: 'Sual', a: '  ' }]);
ok('FAQ: @type FAQPage, yalnız dolu suallar', faq['@type'] === 'FAQPage' && faq.mainEntity.length === 1 && faq.mainEntity[0].acceptedAnswer.text === 'Bəli.');
ok('FAQ: boş siyahı → boş mainEntity (çökmür)', faqPageSchema([]).mainEntity.length === 0 && faqPageSchema(undefined).mainEntity.length === 0);
const i18n = JSON.parse(read('i18n/locales/az.json'));
const inject = read('inject-seo.mjs');
const faqKeys = (inject.match(/faqKeys: \[([^\]]*)\]/) || [])[1].match(/f\d/g);
ok('FAQ: inject-seo sualları DeliveryInfo.tsx-dəki görünən suallarla eynidir', JSON.stringify(faqKeys) === JSON.stringify((read('components/DeliveryInfo.tsx').match(/const faqs = \[([^\]]*)\]/)[1].match(/f\d/g))), String(faqKeys));
ok('FAQ: bütün açarlar az.json-da mövcuddur', faqKeys.every((f) => typeof i18n.delivery.faqs[f]?.q === 'string' && typeof i18n.delivery.faqs[f]?.a === 'string'));
ok('FAQ: inject-seo /catdirilma-ya sxemi əlavə edir', inject.includes('faqPageSchema(') && inject.includes("from './lib/faqSchema.mjs'"));

// ── index.html sxemi ──────────────────────────────────────────────
{
  const html = read('index.html');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const org = blocks.find((b) => b['@type'] === 'OnlineStore');
  ok('Sxem: JSON-LD etibarlı JSON-dur və OnlineStore qalıb (LocalBusiness deyil)', !!org && !blocks.some((b) => b['@type'] === 'LocalBusiness'));
  ok('Sxem: knowsAbout və keywords əlavə olunub', Array.isArray(org.knowsAbout) && org.knowsAbout.length >= 5 && /lazer yazılı hədiyyə/.test(org.keywords));
  ok('Sxem: fiziki məkan xassələri yoxdur (geo, iş saatları, priceRange)', !('geo' in org) && !('openingHours' in org) && !('openingHoursSpecification' in org) && !('priceRange' in org));
  ok('Sxem: Review/AggregateRating YOXDUR (Google öz-rəy qaydası)', !/AggregateRating|"@type":\s*"Review"/.test(html));
  ok('Sxem: gümüş iddiası yoxdur', !/gümüş|silver|925/i.test(JSON.stringify(org)));
}

// ── Merchant feed ─────────────────────────────────────────────────
const sample = [
  { name: 'Polad Qolbaq & "Lazer"', slug: 'polad-qolbaq', description: 'Lazer yazılı <polad> qolbaq.', category: 'Qolbaqlar', imageUrl: 'https://cdn.sanity.io/images/a.jpg', price: 24.9, discountPrice: 19.9, inStock: true },
  { name: 'Brelok', slug: 'brelok', imageUrl: 'https://cdn.sanity.io/images/b.jpg', price: 16.9, inStock: false },
  { name: 'Şəkilsiz', slug: 'sekilsiz', price: 10 },
  { name: 'Qiymətsiz', slug: 'qiymetsiz', imageUrl: 'https://cdn.sanity.io/images/c.jpg' },
  { name: 'Endirim böyükdür', slug: 'sehv-endirim', imageUrl: 'https://cdn.sanity.io/images/d.jpg', price: 10, discountPrice: 12 },
  null,
  { name: '', slug: 'adsiz' },
];
const { xml, included, skipped } = buildMerchantFeed(sample);
ok('Feed: yalnız qiyməti və şəkli olan məhsullar daxil olur', included === 3 && skipped.sort().join() === 'qiymetsiz,sekilsiz', `${included} ${skipped}`);
ok('Feed: etibarlı RSS + g: namespace', xml.startsWith('<?xml') && xml.includes('xmlns:g="http://base.google.com/ns/1.0"') && xml.includes('</rss>'));
ok('Feed: XML simvolları escape olunub', xml.includes('Polad Qolbaq &amp; &quot;Lazer&quot;') && xml.includes('&lt;polad&gt;') && !xml.includes('<polad>'));
ok('Feed: qiymət AZN formatında, endirim sale_price kimi', xml.includes('<g:price>24.90 AZN</g:price>') && xml.includes('<g:sale_price>19.90 AZN</g:sale_price>'));
ok('Feed: endirim qiymətdən böyükdürsə sale_price yazılmır', (xml.match(/<g:sale_price>/g) || []).length === 1);
ok('Feed: stok statusu (bitib → out_of_stock)', xml.includes('<g:availability>in_stock</g:availability>') && xml.includes('<g:availability>out_of_stock</g:availability>'));
ok('Feed: link real məhsul URL-idir, brend Ravio, condition new', xml.includes('<g:link>https://ravio.az/mehsullar/polad-qolbaq</g:link>') && xml.includes('<g:brand>Ravio</g:brand>') && xml.includes('<g:condition>new</g:condition>'));
ok('Feed: təsvir yoxdursa ehtiyat mətn (uydurma iddia yoxdur)', xml.includes('Brelok — Ravio-dan fərdi lazer yazılı hədiyyə.') && !/gümüş|925/i.test(xml));
ok('Feed: boş siyahı çökmür', buildMerchantFeed([]).included === 0 && buildMerchantFeed(undefined).included === 0);
ok('Feed: uzun təsvir 5000 simvola kəsilir', buildMerchantFeed([{ name: 'A', slug: 'a', imageUrl: 'https://x/y.jpg', price: 5, description: 'söz '.repeat(3000) }]).xml.match(/<g:description>([^<]*)</)[1].length <= 5000);

// ── Marka adları (Merchant Center saxta mal siyasəti) ──────────────
{
  const img = 'https://cdn.sanity.io/images/x.jpg';
  const r = buildMerchantFeed([
    { name: 'Casio Saat - Klassik', slug: 'casio', imageUrl: img, price: 38 },
    { name: 'Zippo Alışqan', slug: 'zippo', imageUrl: img, price: 25 },
    { name: 'Rolex Model Qolbaq', slug: 'rolex', imageUrl: img, price: 28 },
    { name: 'Qara cüzdan', slug: 'armani-desc', description: 'Armani Exchange loqolu cüzdan', imageUrl: img, price: 55 },
    { name: 'Kasio Saat', slug: 'kasio', imageUrl: img, price: 31 },
    { name: 'Roleks Modeli Qolbaq', slug: 'roleks', imageUrl: img, price: 27 },
    { name: 'Zipo Alışqan', slug: 'zipo', imageUrl: img, price: 17 },
  ]);
  ok('Marka: Casio/Zippo/Rolex/Armani məhsulları feed-ə düşmür', r.skippedBrand.sort().join() === 'armani-desc,casio,rolex,zippo', String(r.skippedBrand));
  ok('Marka: respelling edilmiş adlar (Kasio, Zipo, Roleks) feed-də qalır', r.included === 3 && r.xml.includes('<g:id>kasio</g:id>') && r.xml.includes('<g:id>zipo</g:id>') && r.xml.includes('<g:id>roleks</g:id>'));
  ok('Marka: adi sözlər pozulmur', !RISKY_BRANDS.test('Pulqabı və Qolbaq Dəsti') && !RISKY_BRANDS.test('Lazer yazılı polad qolbaq'));
}

// ── Konfiqurasiya ─────────────────────────────────────────────────
{
  const pkg = JSON.parse(read('package.json'));
  ok('package.json: build feed-i yaradır, vite build-dən ƏVVƏL', /generate-feed\.mjs && vite build/.test(pkg.scripts.build));
  ok('generate-feed.mjs: xəta olarsa build dayanmır (exit 0)', /process\.exit\(0\)/.test(read('generate-feed.mjs')));
  const vercel = JSON.parse(read('vercel.json'));
  ok('vercel.json: feed Content-Type application/xml', vercel.headers.some((h) => h.source === '/google-feed.xml' && h.headers.some((x) => x.key === 'Content-Type' && x.value.startsWith('application/xml'))));
  ok('Feed faylı .gitignore-dadır (build-də yaranır)', /public\/google-feed\.xml/.test(read('.gitignore')));
}
console.log(`\n✅ seo.test.mjs: ${pass} yoxlama keçdi`);
