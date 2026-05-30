/**
 * inject-seo.mjs
 *
 * vite build-dan SONRA işləyir.
 * Sanity-dən hər məhsulun məlumatını çəkir,
 * dist/index.html-i template kimi istifadə edərək
 * dist/mehsullar/[slug]/index.html yaradır.
 *
 * Google botu bu statik HTML-i görür → məhsul indekslənir.
 * Puppeteer yoxdur, Vercel-də 100% işləyir.
 */

import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// ── Sanity client ─────────────────────────────────────────────
const client = createClient({
  projectId: 'w7scii42',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-02-09',
});

// ── Köməkçi funksiyalar ───────────────────────────────────────

/** HTML xüsusi simvollarını escape et */
function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Sanity asset URL-inə ölçü parametrləri əlavə et */
function ogImage(url) {
  if (!url) return 'https://ravio.az/og-ravio.png';
  return `${url}?w=1200&h=630&fit=crop&auto=format`;
}

/** HTML template-dəki meta tagları məhsula uyğun dəyişdir */
function injectMeta(template, { title, desc, url, image }) {
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/,
    `<title>${esc(title)}</title>`);

  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/,
    `$1${url}$2`);

  html = html.replace(/(<meta name="description" content=")[^"]*(")/,
    `$1${esc(desc)}$2`);

  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/,
    `$1${esc(title)}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/,
    `$1${esc(desc)}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/,
    `$1${url}$2`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/,
    `$1${image}$2`);

  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/,
    `$1${esc(title)}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${esc(desc)}$2`);
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${image}$2`);

  return html;
}

/** Məhsul üçün Schema.org JSON-LD əlavə et */
function injectProductSchema(html, product) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    image: product.image,
    url: product.url,
    brand: { '@type': 'Brand', name: 'Ravio' },
  };

  if (product.price) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'AZN',
      price: String(product.price),
      availability: 'https://schema.org/InStock',
      url: product.url,
    };
  }

  const tag = `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return html.replace('</head>', `${tag}\n</head>`);
}

/** Məhsul üçün Google botu oxuya biləcəyi statik body mətn bloku əlavə et */
function injectVisibleProductContent(html, product) {
  const priceText = product.price
    ? `<span itemprop="price" content="${product.price}">${product.price} ₼</span>`
    : '';

  const contentBlock = `
  <!-- SEO: Google botu üçün statik məhsul məlumatı -->
  <div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap" aria-hidden="true" itemscope itemtype="https://schema.org/Product">
    <h1 itemprop="name">${esc(product.name)} — Ravio Bakı</h1>
    <p itemprop="description">${esc(product.desc)}</p>
    ${priceText ? `<div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      Qiymət: ${priceText} AZN — Bakıda pulsuz çatdırılma ilə
    </div>` : ''}
    <p>Ravio fərdi hədiyyə mağazası. Lazer qravirə. Bakıda istehsal.</p>
  </div>`;

  return html.replace('<div id="root"></div>', `${contentBlock}\n    <div id="root"></div>`);
}
// ── Əsas funksiya ─────────────────────────────────────────────
async function run() {
  console.log('\n🚀 inject-seo: başladı...\n');

  // 1. Sanity-dən məhsulları çək
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current)] | order(_createdAt desc) {
      name,
      "slug": slug.current,
      description,
      "firstImageUrl": variants[0].images[0].asset->url,
      "price": coalesce(variants[0].discountPrice, variants[0].price)
    }
  `);

  console.log(`📦 ${products.length} məhsul tapıldı\n`);

  // 2. dist/index.html-i template kimi oxu
  const template = readFileSync('dist/index.html', 'utf-8');

  let ok = 0;
  let fail = 0;

  // 3. Hər məhsul üçün ayrı HTML yarat
  for (const p of products) {
    try {
      const title = `${p.name} | Ravio`;
      const rawDesc = p.description
        ? p.description.slice(0, 155)
        : `${p.name} — Ravio-dan fərdi hədiyyə. Bakıda pulsuz çatdırılma.`;
      const pageUrl  = `https://ravio.az/mehsullar/${p.slug}`;
      const image    = ogImage(p.firstImageUrl);

      let html = injectMeta(template, {
        title,
        desc: rawDesc,
        url: pageUrl,
        image,
      });

      html = injectProductSchema(html, {
        name: p.name,
        desc: rawDesc,
        url: pageUrl,
        image,
        price: p.price,
      });

      html = injectVisibleProductContent(html, {
        name: p.name,
        desc: rawDesc,
        price: p.price,
      });

      const dir = `dist/mehsullar/${p.slug}`;
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/index.html`, html, 'utf-8');
      ok++;
      console.log(`  ✅ /mehsullar/${p.slug}`);
    } catch (err) {
      fail++;
      console.error(`  ❌ /mehsullar/${p.slug} — ${err.message}`);
    }
  }

  // 4. /mehsullar siyahı səhifəsi üçün HTML
  try {
    const html = injectMeta(template, {
      title: 'Bütün Məhsullar | Ravio',
      desc:  'Ravio-nun bütün fərdi hədiyyələri — lazer yazılı qolbaq, təsbeh, domino, giftbox. Bakıda pulsuz çatdırılma, 1–3 iş günü.',
      url:   'https://ravio.az/mehsullar',
      image: 'https://ravio.az/og-ravio.png',
    });
    mkdirSync('dist/mehsullar', { recursive: true });
    writeFileSync('dist/mehsullar/index.html', html, 'utf-8');
    console.log(`  ✅ /mehsullar (siyahı səhifəsi)`);
  } catch (err) {
    console.error(`  ❌ /mehsullar — ${err.message}`);
  }

  // ── C işi: Kateqoriya səhifələrini prerender et ───────────────
  const CATEGORIES = [
    {
      slug: 'qolbaqlar',
      title: 'Lazer Yazılı Qolbaqlar — Fərdi Hədiyyə | Ravio Bakı',
      desc:  'Bakıda fərdi lazer yazılı qolbaqlar. Ad, tarix, mesaj yazılır. Pulsuz metro çatdırılma, 1–3 iş günündə hazır.',
      h1:   'Lazer Yazılı Qolbaqlar Bakıda',
    },
    {
      slug: 'tesbehler',
      title: 'Fərdi Qravürlü Təsbehlər | Ravio Bakı',
      desc:  'Ağac və daş materiallardan lazer qravürlü fərdi təsbehlər. Bakıda özəl hədiyyə. Pulsuz metro çatdırılma.',
      h1:   'Fərdi Qravürlü Təsbehlər',
    },
    {
      slug: 'domino',
      title: 'Hədiyyəlik Domino Dəsti — Lazer Yazılı | Ravio Bakı',
      desc:  'Fərdi lazer yazılı domino dəstləri. Korporativ hədiyyə, ad günü üçün ideal. Bakı daxili pulsuz çatdırılma.',
      h1:   'Hədiyyəlik Domino Dəsti',
    },
    {
      slug: 'hediyelik_qutular',
      title: 'Hədiyyəlik Qutular — Premium Qablaşdırma | Ravio Bakı',
      desc:  'Ravio premium hədiyyəlik qutular. Lent, köpük yastıq, bağlama + qeyd kartı. Hər hədiyyəni özəl edir.',
      h1:   'Hədiyyəlik Qutular',
    },
  ];

  let catOk = 0;
  for (const cat of CATEGORIES) {
    try {
      const catUrl = `https://ravio.az/mehsullar/${cat.slug}`;

      let html = injectMeta(template, {
        title: cat.title,
        desc:  cat.desc,
        url:   catUrl,
        image: 'https://ravio.az/og-ravio.png',
      });

      // Kateqoriya üçün BreadcrumbList schema
      const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ravio',      item: 'https://ravio.az' },
          { '@type': 'ListItem', position: 2, name: 'Məhsullar',  item: 'https://ravio.az/mehsullar' },
          { '@type': 'ListItem', position: 3, name: cat.h1,       item: catUrl },
        ],
      };
      const schemaTag = `\n  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;
      html = html.replace('</head>', `${schemaTag}\n</head>`);

      // Google botu üçün görünən H1 + açıqlama bloku
      const bodyBlock = `
  <!-- SEO: Kateqoriya statik məlumatı -->
  <div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap" aria-hidden="true">
    <h1>${esc(cat.h1)}</h1>
    <p>${esc(cat.desc)}</p>
    <p>Ravio — Bakıda fərdi hədiyyə mağazası. Lazer qravirə xidməti. Pulsuz çatdırılma.</p>
  </div>`;
      html = html.replace('<div id="root"></div>', `${bodyBlock}\n    <div id="root"></div>`);

      mkdirSync(`dist/mehsullar/${cat.slug}`, { recursive: true });
      writeFileSync(`dist/mehsullar/${cat.slug}/index.html`, html, 'utf-8');
      catOk++;
      console.log(`  ✅ /mehsullar/${cat.slug}`);
    } catch (err) {
      console.error(`  ❌ /mehsullar/${cat.slug} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Tamamlandı: ${ok}/${products.length} məhsul + ${catOk}/${CATEGORIES.length} kateqoriya HTML-i yaradıldı`);
  if (fail > 0) console.warn(`⚠️  ${fail} məhsul zamanı xəta baş verdi`);
  console.log('');
}

run().catch(err => {
  console.error('\n❌ Kritik xəta:', err);
  process.exit(1);
});
