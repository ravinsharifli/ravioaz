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
import { join } from 'path';

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
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Məhsul adının sonunda Ravio iki dəfə yazılmasın */
function cleanBrandSuffix(value) {
  return String(value || '')
    .replace(/\s*\|\s*Ravio\s*$/i, '')
    .trim();
}

/** Title üçün brend adı yalnız bir dəfə əlavə olunur */
function brandTitle(value) {
  return `${cleanBrandSuffix(value)} | Ravio`;
}

/** Description sözün ortasında kəsilməsin */
function shortDescription(value) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= 155) return text;

  const cut = text.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  const safeCut = lastSpace > 100 ? cut.slice(0, lastSpace) : cut;

  return `${safeCut}…`;
}

/** Sanity asset URL-inə ölçü parametrləri əlavə et */
function ogImage(url) {
  if (!url) return 'https://ravio.az/og-ravio.png';
  return `${url}?w=1200&h=630&fit=crop&auto=format`;
}

/**
 * Sanity şəkil URL-ini WebP + ölçü ilə optimallaşdırır.
 * lib/image.ts-dəki toWebP funksiyasının Node.js versiyası.
 */
function sanityWebP(url, width, quality = 80) {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', String(quality));
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * LCP şəklini preload et — brauzer preload scanner HTML-dən tapır,
 * JS-i gözləmədən şəkli dərhal yükləyir.
 * imagesrcset + imagesizes sayəsində brauzer ən uyğun ölçünü seçir.
 *
 * fetchPriority parametri: eyni səhifədə 2 preload olanda (hero + ilk grid kartı)
 * hər ikisinə "high" versək, brauzer bant genişliyini bölür və HEÇ BİRİ tez
 * bitmir. Ona görə yalnız real LCP namizədinə "high" veririk, digərinə "auto".
 */
/**
 * Google üçün ilkin HTML məzmunu root-a əlavə edir.
 * React yükləndikdən sonra bu məzmun createRoot tərəfindən əvəz olunur.
 */
function injectStaticRoot(html, content) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-seo-shell>${content}</div>`,
  );
}

/** Ana səhifənin Google bot üçün ilkin məzmunu */
function homeSeoContent() {
  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <h1>Lazer Yazılı Qolbaq və Fərdi Hədiyyələr Bakıda — Ravio</h1>
      <p>
        Ravio-da lazer yazılı qolbaq, fərdi təsbeh, domino və hədiyyəlik qutular
        sifariş edə bilərsiniz. Hər məhsul sizin üçün özəl hazırlanır.
        Bütün Azərbaycana ödənişsiz çatdırılma və 1–3 iş günündə hazırlıq.
      </p>
      <nav aria-label="Məhsul kateqoriyaları">
        <a href="/mehsullar/qolbaqlar">Lazer yazılı qolbaqlar</a> ·
        <a href="/mehsullar/tesbehler">Fərdi təsbehlər</a> ·
        <a href="/mehsullar/domino">Hədiyyəlik domino dəstləri</a> ·
        <a href="/mehsullar/hediyelik_qutular">Hədiyyəlik qutular</a>
      </nav>
    </main>
  `;
}

/** Məhsul səhifəsinin Google bot üçün ilkin məzmunu */
function productSeoContent({ name, desc, image, price, slug }) {
  const imageHtml = image
    ? `
      <img
        src="${esc(sanityWebP(image, 900))}"
        alt="${esc(name)} — fərdi hədiyyə, Bakı"
        style="max-width:420px;width:100%;height:auto"
      />
    `
    : '';

  const priceHtml = price
    ? `<p><strong>Qiymət: ${esc(price)} AZN</strong></p>`
    : '';

  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <nav aria-label="Breadcrumb">
        <a href="/">Ana səhifə</a> /
        <a href="/mehsullar">Məhsullar</a> /
        <span>${esc(name)}</span>
      </nav>

      <article>
        <h1>${esc(name)}</h1>
        ${imageHtml}
        <p>${esc(desc)}</p>
        ${priceHtml}
        <p>
          Ravio-da fərdi sifarişlə hazırlanır. Bütün Azərbaycana
          ödənişsiz çatdırılma.
        </p>
        <a href="/mehsullar/${esc(slug)}">Məhsula bax və sifariş et</a>
      </article>
    </main>
  `;
}

/** Kateqoriya və məhsullar səhifəsi üçün ilkin məzmun */
function simpleSeoContent({ h1, desc }) {
  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <h1>${esc(h1)}</h1>
      <p>${esc(desc)}</p>
      <a href="/mehsullar">Bütün məhsullara bax</a>
    </main>
  `;
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
    name: cleanBrandSuffix(product.name),
    description: product.desc,
    image: product.image,
    url: product.url,
    brand: { '@type': 'Brand', name: 'Ravio' },
  };

  schema.offers = {
    '@type': 'Offer',
    priceCurrency: 'AZN',
    price: product.price ? String(product.price) : '0',
    availability: 'https://schema.org/InStock',
    url: product.url,
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: '0',
        currency: 'AZN',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'AZ',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 3,
          unitCode: 'DAY',
        },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'AZ',
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    },
  };

  const tag = `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  return html.replace('</head>', `${tag}\n</head>`);
}

/**
 * Kritik CSS-i inline edir — render-blocking <link rel="stylesheet"> sorğusunu
 * aradan qaldırır. Yalnız fayl KİÇİK olduqda (< 15 KB) mənalıdır: bir HTTP
 * gediş-gəlişinin (round-trip) dəyəri, faylı HTML-in içinə yazmaqdan böyükdür.
 * Bizim CSS ~2.7 KB-dır — inline etmək PageSpeed-in bildirdiyi
 * "Render-blocking requests" xəbərdarlığını (~490ms itki) aradan qaldırır.
 */
function inlineMainCss(html, distDir = 'dist') {
  const linkRe = /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/;
  const match = html.match(linkRe);
  if (!match) {
    console.warn('  ⚠️  Inline ediləcək CSS <link> tapılmadı — vite chunk adı dəyişibmi?');
    return html;
  }
  const cssPath = join(distDir, match[1]);
  let cssContent;
  try {
    cssContent = readFileSync(cssPath, 'utf-8');
  } catch (err) {
    console.warn(`  ⚠️  CSS faylı oxuna bilmədi (${cssPath}): ${err.message}`);
    return html;
  }
  if (cssContent.length > 15000) {
    console.warn(`  ⚠️  CSS faylı çox böyükdür (${cssContent.length} bayt) — inline edilmədi, limit aşıldı`);
    return html;
  }
  const inlineTag = `<style>${cssContent}</style>`;
  const result = html.replace(linkRe, inlineTag);
  console.log(`  ok CSS inline edildi (${(cssContent.length / 1024).toFixed(1)} KB) — render-blocking request aradan qalxdı\n`);
  return result;
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

  // 1b. Ana səhifə LCP namizədləri: real PageSpeed testində (Moto G Power,
  // dar mobil viewport) LCP elementi HƏMIŞƏ hero yox, ProductGrid-in İLK kartının
  // şəkli olaraq ölçülür — hero DOM-da əvvəl gəlsə də, mobil ekranda vizual
  // sahəsi (piksel sahəsi) grid kartından kiçik qala bilir və Lighthouse
  // böyük olanı seçir. Ona görə HƏR İKİSİNİ preload edirik: brauzer real
  // LCP-ni hansı olursa seçsin, hər ikisi artıq HTML-də mövcud olur.
  const heroSettings = await client.fetch(`
    *[_type == "siteSettings"][0]{
      "heroImage": heroSlides[isActive != false][0].image.asset->url
    }
  `);

  // Ana səhifə grid-i bestSellerOrder asc sırası ilə göstərir (ProductGrid.tsx,
  // App.tsx PRODUCTS_QUERY) — grid-in İLK kartı budur.
  const firstGridProduct = await client.fetch(`
    *[_type == "product"] | order(bestSellerOrder asc) [0]{
      "firstImageUrl": variants[0].images[0].asset->url,
      name
    }
  `);

  // 2. dist/index.html-i template kimi oxu
  let template = readFileSync('dist/index.html', 'utf-8');

  // Kritik CSS-i BÜTÜN prerender olunan səhifələr üçün İLK addım olaraq inline
  // edirik (template hələ heç bir digər dəyişikliyə uğramamış) — beləliklə
  // həm / (ana səhifə), həm /mehsullar/[slug] səhifələri render-blocking CSS
  // sorğusundan azad olur.
  template = inlineMainCss(template);

  // ── 3. Ana səhifə LCP preload ─────────────────────────────────
  // Hero karusel ilk slaydı homepage-in ən böyük görünən elementidir (LCP).
  // Widths/sizes UnifiedHeroCarousel.tsx-dəki əsl <img> ilə EYNİ olmalıdır,
  // əks halda brauzer preload edilən şəkli yox, başqasını yükləyir.
  // Build zamanı preload tag-ini dist/index.html-ə yazırıq ki,
  // brauzer preload scanner JS-i gözləmədən şəkli tapıb yükləsin.
  {
    const preloadTags = [];

    // Real PageSpeed ölçmələri (2026-07) göstərir ki, mobil LCP elementi
    // grid kartıdır, hero YOX — ona görə "high" prioritet BURAYA gedir,
    // hero isə "auto" alır (yenə preload olunur, sadəcə bant genişliyi
    // ilk növbədə əsl LCP elementinə ayrılır).
    if (firstGridProduct?.firstImageUrl) {
      preloadTags.push(
        lcpPreloadTag(
          firstGridProduct.firstImageUrl,
          '(max-width: 400px) 45vw, (max-width: 900px) 45vw, (max-width: 1200px) 30vw, 25vw',
          [240, 480, 720],
          'high'
        )
      );
    }

    if (heroSettings?.heroImage) {
      preloadTags.push(
        lcpPreloadTag(
          heroSettings.heroImage,
          '(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 420px',
          [400, 640, 900],
          'auto'
        )
      );
    }

    let homeHtml = injectStaticRoot(template, homeSeoContent());

    if (preloadTags.length) {
      homeHtml = homeHtml.replace('</head>', `${preloadTags.join('\n')}\n</head>`);
    }

    // ── Statik LCP şəkli: React mount olmadan ƏVVƏL görünən əsl <img> ──────
    // Preload təkcə bayt yükləməsini sürətləndirir — brauzer şəkli hələ də
    // "render edə" bilmir, çünki DOM-da <img> elementi YOXDUR (React onu yalnız
    // JS icra olunub Sanity fetch bitdikdən sonra yaradır). Elə buna görə
    // "Element render delay" 2+ saniyə idi, halbuki "Resource load duration"
    // cəmi 20ms idi — şəkil artıq yüklənmişdi, sadəcə göstərilməmişdi.
    // Həll: #ravio-skeleton-un içinə əsl <img> əlavə edirik (React #root-u
    // dolduran kimi mövcud CSS qaydası bunu avtomatik gizlədir — JS lazım deyil,
    // useEffect/hydration mismatch riski yoxdur, çünki bu, #root-dan KƏNARdadır).
    if (firstGridProduct?.firstImageUrl) {
      const gridWidths = [240, 480, 720];
      const gridSizes  = '(max-width: 400px) 45vw, (max-width: 900px) 45vw, (max-width: 1200px) 30vw, 25vw';
      const gridSrcset = gridWidths.map(w => `${sanityWebP(firstGridProduct.firstImageUrl, w)} ${w}w`).join(', ');
      const gridSrc    = sanityWebP(firstGridProduct.firstImageUrl, 480);
      const altText    = esc(firstGridProduct.name || 'Ravio məhsulu');

      const skeletonProductBlock = `<div class="ravio-skel-product"><img src="${gridSrc}" srcset="${gridSrcset}" sizes="${gridSizes}" alt="${altText}" fetchpriority="high" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`;

      // index.html-dəki sabit marker-lərə görə insert edirik (string-in özünə
      // görə deyil) — beləliklə index.html-in başqa hissəsi dəyişsə belə bu
      // build addımı qırılmır.
      if (homeHtml.includes('<!-- INJECT_SEO:SKELETON_PRODUCT_SLOT -->')) {
        homeHtml = homeHtml.replace('<!-- INJECT_SEO:SKELETON_PRODUCT_SLOT -->', skeletonProductBlock);
      } else {
        console.warn('  ⚠️  SKELETON_PRODUCT_SLOT marker tapılmadı — index.html dəyişibmi?');
      }

      // Grid skeleton üçün CSS: hero-nun altında, ProductGrid-in həqiqi ilk
      // kartı ilə TƏXMİNƏN eyni mövqedə (max-width 1280px konteyner, 2/3/4 sütun).
      // Dəqiq piksel-piksel uyğunluq lazım deyil — məqsəd LCP şəklinin HTML
      // parse zamanı dərhal görünməsidir, real React kartı yükləndikdə
      // #root dolacaq və bu blok dərhal gizlənəcək.
      const skeletonCss = `.ravio-skel-product{max-width:1280px;margin:24px auto 0;padding:0 clamp(16px,3vw,32px);
        aspect-ratio:1/1;max-height:45vw;overflow:hidden;border-radius:12px;background:#F5F2EC}
      @media (min-width:640px){.ravio-skel-product{max-width:300px}}`;

      if (homeHtml.includes('/* INJECT_SEO:SKELETON_PRODUCT_CSS_SLOT */')) {
        homeHtml = homeHtml.replace('/* INJECT_SEO:SKELETON_PRODUCT_CSS_SLOT */', skeletonCss);
      } else {
        console.warn('  ⚠️  SKELETON_PRODUCT_CSS_SLOT marker tapılmadı — index.html dəyişibmi?');
      }

      console.log(`  ok Statik LCP <img> -> #ravio-skeleton (${firstGridProduct.name})\n`);
    }

    if (preloadTags.length || firstGridProduct?.firstImageUrl) {
      writeFileSync('dist/index.html', homeHtml, 'utf-8');
      console.log(`  ok LCP preload -> / (hero + ilk grid kartı, ${preloadTags.length} preload tag)\n`);
    }
  }

  let ok = 0;
  let fail = 0;

  // 4. Hər məhsul üçün ayrı HTML yarat
  for (const p of products) {
    try {
      const cleanName = cleanBrandSuffix(p.name);
      const title = brandTitle(cleanName);
      const rawDesc = p.description
      ? shortDescription(p.description)
      : `${cleanName} — Ravio-dan fərdi hədiyyə. Bütün Azərbaycana ödənişsiz çatdırılma.`;
      const pageUrl  = `https://ravio.az/mehsullar/${p.slug}`;
      const image    = ogImage(p.firstImageUrl);

      let html = injectMeta(template, {
        title,
        desc: rawDesc,
        url: pageUrl,
        image,
      });

      html = injectStaticRoot(
  html,
  productSeoContent({
    name: cleanName,
    desc: rawDesc,
    image: p.firstImageUrl,
    price: p.price,
    slug: p.slug,
  }),
);

      // Məhsul səhifəsinin LCP şəkli — məhsulun öz şəklidir.
      // Sizes: mobil 90vw, tablet/desktop 50vw | max 640px
      if (p.firstImageUrl) {
        const prodPreload = lcpPreloadTag(
          p.firstImageUrl,
          '(max-width: 640px) 90vw, (max-width: 1280px) 50vw, 640px'
        );
        html = html.replace('</head>', `${prodPreload}\n</head>`);
      }

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

  // 5. /mehsullar siyahı səhifəsi üçün HTML
  try {
    let html = injectMeta(template, {
      title: 'Bütün Məhsullar | Ravio',
      desc:  'Ravio-nun bütün fərdi hədiyyələri — lazer yazılı qolbaq, təsbeh, domino, giftbox. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günü.',
      url:   'https://ravio.az/mehsullar',
      image: 'https://ravio.az/og-ravio.png',
    });
    html = injectStaticRoot(
  html,
  simpleSeoContent({
    h1: 'Fərdi Hədiyyələr və Lazer Yazılı Məhsullar',
    desc: 'Ravio-da lazer yazılı qolbaq, fərdi təsbeh, domino və hədiyyəlik qutular. Bütün Azərbaycana ödənişsiz çatdırılma və 1–3 iş günündə hazırlıq.',
  }),
);
    mkdirSync('dist/mehsullar', { recursive: true });
    writeFileSync('dist/mehsullar/index.html', html, 'utf-8');
    console.log(`  ✅ /mehsullar (siyahı səhifəsi)`);
  } catch (err) {
    console.error(`  ❌ /mehsullar — ${err.message}`);
  }

  // ── Kateqoriya səhifələrini prerender et ─────────────────────
  const CATEGORIES = [
    {
      slug: 'qolbaqlar',
      title: 'Lazer Yazılı Qolbaqlar — Fərdi Hədiyyə | Ravio Bakı',
      desc:  'Bakıda fərdi lazer yazılı qolbaqlar. Ad, tarix, mesaj yazılır. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günündə hazır.',
      h1:   'Lazer Yazılı Qolbaqlar Bakıda',
    },
    {
      slug: 'tesbehler',
      title: 'Fərdi Qravürlü Təsbehlər | Ravio Bakı',
      desc:  'Ağac və daş materiallardan lazer qravürlü fərdi təsbehlər. Bakıda özəl hədiyyə. Bütün Azərbaycana ödənişsiz çatdırılma.',
      h1:   'Fərdi Qravürlü Təsbehlər',
    },
    {
      slug: 'domino',
      title: 'Hədiyyəlik Domino Dəsti — Lazer Yazılı | Ravio Bakı',
      desc:  'Fərdi lazer yazılı domino dəstləri. Korporativ hədiyyə, ad günü üçün ideal. Bütün Azərbaycana ödənişsiz çatdırılma.',
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
      html = injectStaticRoot(
  html,
  simpleSeoContent({
    h1: cat.h1,
    desc: cat.desc,
  }),
);

      // Kateqoriya üçün BreadcrumbList + CollectionPage schema
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: cat.h1,
        description: cat.desc,
        url: catUrl,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ravio',     item: 'https://ravio.az' },
            { '@type': 'ListItem', position: 2, name: 'Məhsullar', item: 'https://ravio.az/mehsullar' },
            { '@type': 'ListItem', position: 3, name: cat.h1,      item: catUrl },
          ],
        },
      };
      const schemaTag = `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
      html = html.replace('</head>', `${schemaTag}\n</head>`);

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

run().catch((err) => {
  console.error('\n⚠️  inject-seo uğursuz (əsas build saxlanılır):', err.message || err);
  process.exit(0);
});
