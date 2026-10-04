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
import { join, dirname } from 'path';
import { CATEGORY_PAGES } from './seo-categories.mjs';

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
function lcpPreloadTag(url, sizes, widths = [240, 480, 720], fetchPriority = 'high') {
  if (!url) return '';
  const srcset = widths.map((w) => `${sanityWebP(url, w)} ${w}w`).join(', ');
  // href yalnız imagesrcset-i dəstəkləməyən köhnə brauzerlər üçün ehtiyatdır.
  // DİQQƏT: default widths ProductPage.tsx-dəki əsl <img srcSet> ilə eynidir ([240, 480, 720]).
  const href = sanityWebP(url, widths[Math.min(1, widths.length - 1)]);
  return (
    `<link rel="preload" as="image" href="${esc(href)}" ` +
    `imagesrcset="${esc(srcset)}" imagesizes="${esc(sizes)}" fetchpriority="${esc(fetchPriority)}">`
  );
}

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

/** Bot üçün ilkin HTML-də istifadə olunan sabit mətnlər (AZ + EN) */
const SHELL_TEXT = {
  az: {
    home: 'Ana səhifə',
    products: 'Məhsullar',
    viewAll: 'Bütün məhsullara bax',
    price: 'Qiymət',
    orderCta: 'Məhsula bax və sifariş et',
    madeToOrder: 'Ravio-da fərdi sifarişlə hazırlanır. Bütün Azərbaycana ödənişsiz çatdırılma.',
    altSuffix: 'fərdi hədiyyə, Bakı',
  },
  en: {
    home: 'Home',
    products: 'Products',
    viewAll: 'View all products',
    price: 'Price',
    orderCta: 'View product and order',
    madeToOrder: 'Made to order at Ravio. Free delivery across Azerbaijan.',
    altSuffix: 'personalized gift, Baku',
  },
};

/** Ana səhifənin Google bot üçün ilkin məzmunu */
function homeSeoContent(lang = 'az') {
  if (lang === 'en') {
    return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <h1>Personalized Laser-Engraved Gifts in Baku — Ravio</h1>
      <p>
        At Ravio you can order laser-engraved bracelets, personalized prayer beads,
        dominoes and gift boxes. Every piece is made specially for you.
        Free delivery across Azerbaijan, ready in 1–3 business days.
      </p>
      <nav aria-label="Product categories">
        <a href="/en/mehsullar">All products</a> ·
        <a href="/en/mehsullar/boyunbagilar">Laser-engraved necklaces</a> ·
        <a href="/en/mehsullar/qolbaqlar">Laser-engraved bracelets</a> ·
        <a href="/en/mehsullar/tesbehler">Personalized prayer beads</a>
      </nav>
    </main>
  `;
  }
  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <h1>Lazer Yazılı Qolbaq və Fərdi Hədiyyələr Bakıda — Ravio</h1>
      <p>
        Ravio-da lazer yazılı qolbaq, fərdi təsbeh, domino və hədiyyəlik qutular
        sifariş edə bilərsiniz. Hər məhsul sizin üçün özəl hazırlanır.
        Bütün Azərbaycana ödənişsiz çatdırılma və 1–3 iş günündə hazırlıq.
      </p>
      <nav aria-label="Məhsul kateqoriyaları">
        <a href="/mehsullar">Bütün məhsullar</a> ·
        <a href="/mehsullar/boyunbagilar">Lazer yazılı boyunbağılar</a> ·
        <a href="/mehsullar/qolbaqlar">Lazer yazılı qolbaqlar</a> ·
        <a href="/mehsullar/tesbehler">Fərdi təsbehlər</a>
      </nav>
    </main>
  `;
}

/** Məhsul səhifəsinin Google bot üçün ilkin məzmunu */
function productSeoContent({ name, desc, image, price, slug, lang = 'az' }) {
  const T = SHELL_TEXT[lang];
  const imageHtml = image
    ? `
      <img
        src="${esc(sanityWebP(image, 900))}"
        alt="${esc(name)} — ${T.altSuffix}"
        style="max-width:420px;width:100%;height:auto"
      />
    `
    : '';

  const priceHtml = price
    ? `<p><strong>${T.price}: ${esc(price)} AZN</strong></p>`
    : '';

  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <nav aria-label="Breadcrumb">
        <a href="${pathFor('/', lang)}">${T.home}</a> /
        <a href="${pathFor('/mehsullar', lang)}">${T.products}</a> /
        <span>${esc(name)}</span>
      </nav>

      <article>
        <h1>${esc(name)}</h1>
        ${imageHtml}
        <p>${esc(desc)}</p>
        ${priceHtml}
        <p>${T.madeToOrder}</p>
        <a href="${pathFor(`/mehsullar/${slug}`, lang)}">${T.orderCta}</a>
      </article>
    </main>
  `;
}

/** Kateqoriya və məhsullar səhifəsi üçün ilkin məzmun */
function simpleSeoContent({ h1, desc, lang = 'az' }) {
  return `
    <main style="max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif">
      <h1>${esc(h1)}</h1>
      <p>${esc(desc)}</p>
      <a href="${pathFor('/mehsullar', lang)}">${SHELL_TEXT[lang].viewAll}</a>
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

  // Hər variantın real qiyməti (endirimli qiymət varsa o) və stok vəziyyəti
  const variants = Array.isArray(product.variantPrices) ? product.variantPrices : [];
  const effectivePrices = variants
    .map(v => (v.discountPrice ?? v.price))
    .filter(p => typeof p === 'number' && p > 0);
  const anyInStock = variants.length === 0 || variants.some(v => v.inStock !== false);
  const availability = anyInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'AZN' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'AZ' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
    },
  };
  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'AZ',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  };

  if (effectivePrices.length === 0) {
    // Variant məlumatı yoxdursa, ilk şəkil/qiymət fallback-ı ilə tək Offer
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'AZN',
      price: product.price ? String(product.price) : '0',
      availability,
      url: product.url,
      shippingDetails,
      hasMerchantReturnPolicy: returnPolicy,
    };
  } else {
    const min = Math.min(...effectivePrices);
    const max = Math.max(...effectivePrices);
    if (min === max) {
      schema.offers = {
        '@type': 'Offer',
        priceCurrency: 'AZN',
        price: String(min),
        availability,
        url: product.url,
        shippingDetails,
        hasMerchantReturnPolicy: returnPolicy,
      };
    } else {
      schema.offers = {
        '@type': 'AggregateOffer',
        priceCurrency: 'AZN',
        lowPrice: String(min),
        highPrice: String(max),
        offerCount: effectivePrices.length,
        availability,
        url: product.url,
        shippingDetails,
        hasMerchantReturnPolicy: returnPolicy,
      };
    }
  }

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

// ── Çoxdilli (AZ/EN) köməkçilər ───────────────────────────────
const SITE = 'https://ravio.az';
const LANGS = ['az', 'en'];
const LOCALES = {
  az: JSON.parse(readFileSync('i18n/locales/az.json', 'utf-8')),
  en: JSON.parse(readFileSync('i18n/locales/en.json', 'utf-8')),
};

/** i18n/locales/*.json-dan mətn oxuyur ("home.meta.title" kimi). Açar tapılmasa build DAYANIR. */
function tr(lang, path, vars = {}) {
  const val = path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), LOCALES[lang]);
  if (typeof val !== 'string') throw new Error(`i18n açarı tapılmadı: ${lang}:${path}`);
  return val.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(vars[k] ?? ''));
}

/** i18n/useLocalizedNav.ts-dəki withLangPrefix ilə EYNİ qayda: "/" → "/en", "/x" → "/en/x" */
function pathFor(pathAz, lang) {
  if (lang !== 'en') return pathAz;
  return pathAz === '/' ? '/en' : `/en${pathAz}`;
}
function urlFor(pathAz, lang) {
  return `${SITE}${pathFor(pathAz, lang)}`;
}

/** lib/categorySlug.ts-dəki toCategorySlug-un eynisi (kateqoriya adı → URL slug) */
function toCategorySlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** hreflang: hər dil səhifəsi digər dilin qarşılığına və x-default-a (AZ) işarə edir */
function hreflangTags(pathAz) {
  const az = urlFor(pathAz, 'az');
  return [
    `<link rel="alternate" hreflang="az" href="${az}" />`,
    `<link rel="alternate" hreflang="en" href="${urlFor(pathAz, 'en')}" />`,
    `<link rel="alternate" hreflang="x-default" href="${az}" />`,
  ].join('\n  ');
}

/** İngilis səhifələrdə <html lang>, og:locale və WebSite inLanguage dəyişir */
function applyLang(html, lang) {
  if (lang !== 'en') return html;
  return html
    .replace('<html lang="az">', '<html lang="en">')
    .replace(/(<meta property="og:locale" content=")[^"]*(")/, '$1en_US$2')
    .replace('"inLanguage": "az"', '"inLanguage": "en"');
}

/** Bir səhifənin bütün dil-asılı meta-sını (title, description, canonical, og:*, hreflang) təyin edir */
function finalizePage(html, { lang, pathAz, title, desc, image }) {
  let out = injectMeta(html, {
    title,
    desc,
    url: urlFor(pathAz, lang),
    image: image || `${SITE}/og-ravio.png`,
  });
  out = applyLang(out, lang);
  return out.replace('</head>', `  ${hreflangTags(pathAz)}\n</head>`);
}

function writePage(file, html) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, 'utf-8');
}

/** lang=az → dist/<parts>/index.html ; lang=en → dist/en/<parts>/index.html */
function distFile(lang, ...parts) {
  return join('dist', ...(lang === 'en' ? ['en'] : []), ...parts, 'index.html');
}

function jsonLdTag(schema) {
  return `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

// ── Əsas funksiya ─────────────────────────────────────────────
async function run() {
  console.log('\n🚀 inject-seo: başladı...\n');

  // 1. Sanity-dən məhsulları çək (AZ + EN sahələri)
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current)] | order(_createdAt desc) {
      name,
      nameEn,
      "slug": slug.current,
      description,
      descriptionEn,
      "firstImageUrl": variants[0].images[0].asset->url,
      "price": coalesce(variants[0].discountPrice, variants[0].price),
      "variantPrices": variants[]{ price, discountPrice, inStock }
    }
  `);

  console.log(`📦 ${products.length} məhsul tapıldı\n`);
  const missingEn = products.filter((p) => !(p.nameEn && p.nameEn.trim()) || !(p.descriptionEn && p.descriptionEn.trim()));
  if (missingEn.length) {
    console.warn(`⚠️  ${missingEn.length} məhsulun İngilis tərcüməsi (nameEn/descriptionEn) yoxdur — EN səhifədə Azərbaycanca mətn görünəcək:`);
    missingEn.slice(0, 15).forEach((p) => console.warn(`    - ${p.slug}`));
  }
  if (products.length === 0) {
    throw new Error('Sanity 0 məhsul qaytardı — boş saytın dərc olunmaması üçün build dayandırıldı');
  }

  // 1a. Kateqoriyalar: ad + İngilis adı + məhsul sayı. Məhsulu olmayan kateqoriya
  // nə prerender olunur, nə sitemap-ə düşür (boş/"thin" səhifə Google-a pis siqnaldır).
  const categoryDocs = await client.fetch(`
    *[_type == "category"]{
      name,
      nameEn,
      "count": count(*[_type == "product" && references(^._id)])
    }
  `);
  const activeCategories = categoryDocs
    .filter((c) => c?.name && c.count > 0)
    .map((c) => ({ slug: toCategorySlug(c.name), name: c.name, nameEn: c.nameEn || c.name }));
  const emptyCategories = categoryDocs.filter((c) => c?.name && !(c.count > 0)).map((c) => c.name);
  if (emptyCategories.length) {
    console.log(`ℹ️  Boş kateqoriyalar atlandı: ${emptyCategories.join(', ')}\n`);
  }

  // 1b. Ana səhifə LCP namizədləri: real PageSpeed testində (Moto G Power,
  // dar mobil viewport) LCP elementi HƏMIŞƏ hero yox, ProductGrid-in İLK kartının
  // şəkli olaraq ölçülür. Ona görə HƏR İKİSİNİ preload edirik.
  const heroSettings = await client.fetch(`
    *[_type == "siteSettings"][0]{
      "heroImage": heroSlides[isActive != false][0].image.asset->url
    }
  `);

  // Ana səhifə grid-i bestSellerOrder asc sırası ilə göstərir (ProductGrid.tsx,
  // App.tsx PRODUCTS_QUERY) — grid-in İLK kartı budur.
  const firstGridProductRaw = await client.fetch(`
    *[_type == "product"] | order(bestSellerOrder asc) [0]{
      "firstImageUrl": variants[0].images[0].asset->url,
      name,
      nameEn
    }
  `);

  // 2. dist/index.html-i template kimi oxu
  let template = readFileSync('dist/index.html', 'utf-8');

  // Kritik CSS-i BÜTÜN prerender olunan səhifələr üçün İLK addım olaraq inline
  // edirik — beləliklə bütün səhifələr render-blocking CSS sorğusundan azad olur.
  template = inlineMainCss(template);

  // ── 3. Ana səhifə: AZ → dist/index.html, EN → dist/en/index.html ──────────
  // Widths/sizes UnifiedHeroCarousel.tsx və ProductGrid-dəki əsl <img> ilə EYNİ
  // olmalıdır, əks halda brauzer preload edilən şəkli yox, başqasını yükləyir.
  for (const homeLang of LANGS) {
    const firstGridProduct = firstGridProductRaw
      ? {
          ...firstGridProductRaw,
          name: homeLang === 'en'
            ? (firstGridProductRaw.nameEn || firstGridProductRaw.name)
            : firstGridProductRaw.name,
        }
      : null;

    const preloadTags = [];

    // Real PageSpeed ölçmələri (2026-07) göstərir ki, mobil LCP elementi
    // grid kartıdır, hero YOX — ona görə "high" prioritet BURAYA gedir,
    // hero isə "auto" alır.
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

    let homeHtml = injectStaticRoot(template, homeSeoContent(homeLang));

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

    if (homeLang === 'en') {
      homeHtml = finalizePage(homeHtml, {
        lang: 'en',
        pathAz: '/',
        title: tr('en', 'home.meta.title'),
        desc: tr('en', 'home.meta.description'),
        image: `${SITE}/og-ravio.png`,
      });
    } else {
      // AZ ana səhifə: meta index.html template-indən gəlir, yalnız hreflang əlavə olunur
      homeHtml = homeHtml.replace('</head>', `  ${hreflangTags('/')}\n</head>`);
    }

    const homeFile = distFile(homeLang);
    writePage(homeFile, homeHtml);
    console.log(`  ok Ana səhifə -> ${homeFile} (${preloadTags.length} LCP preload tag)\n`);
  }

  let ok = 0;
  let fail = 0;

  // 4. Hər məhsul üçün ayrı HTML — AZ və EN
  for (const lang of LANGS) {
    for (const p of products) {
      try {
        const cleanName = cleanBrandSuffix(lang === 'en' ? (p.nameEn || p.name) : p.name);
        const title = brandTitle(cleanName);
        const rawSource = lang === 'en' ? p.descriptionEn : p.description;
        const rawDesc = rawSource
          ? shortDescription(rawSource)
          : lang === 'en'
            ? `${cleanName} — personalized gift from Ravio. Free delivery across Azerbaijan.`
            : `${cleanName} — Ravio-dan fərdi hədiyyə. Bütün Azərbaycana ödənişsiz çatdırılma.`;
        const pathAz = `/mehsullar/${p.slug}`;
        const pageUrl = urlFor(pathAz, lang);
        const image = ogImage(p.firstImageUrl);

        let html = injectStaticRoot(
          template,
          productSeoContent({
            name: cleanName,
            desc: rawDesc,
            image: p.firstImageUrl,
            price: p.price,
            slug: p.slug,
            lang,
          }),
        );
        html = finalizePage(html, { lang, pathAz, title, desc: rawDesc, image });

        // Məhsul səhifəsinin LCP şəkli — məhsulun öz şəklidir.
        // Sizes: mobil 90vw, tablet/desktop 50vw | max 640px (widths: [240, 480, 720])
        if (p.firstImageUrl) {
          const prodPreload = lcpPreloadTag(
            p.firstImageUrl,
            '(max-width: 640px) 90vw, (max-width: 1280px) 50vw, 640px'
          );
          html = html.replace('</head>', `${prodPreload}\n</head>`);
        }

        // Product schema.org JSON-LD — real qiymət aralığı və stok vəziyyəti ilə
        html = injectProductSchema(html, {
          name: cleanName,
          desc: rawDesc,
          image,
          url: pageUrl,
          price: p.price,
          variantPrices: p.variantPrices,
        });

        writePage(distFile(lang, 'mehsullar', p.slug), html);
        ok++;
        console.log(`  ✅ ${pathFor(pathAz, lang)}`);
      } catch (err) {
        fail++;
        console.error(`  ❌ [${lang}] /mehsullar/${p.slug} — ${err.message}`);
      }
    }
  }

  // 5. /mehsullar siyahı səhifəsi — AZ və EN
  for (const lang of LANGS) {
    try {
      const desc = tr(lang, 'productsPage.meta.description');
      let html = injectStaticRoot(
        template,
        simpleSeoContent({
          h1: lang === 'en'
            ? 'Personalized Gifts and Laser-Engraved Products'
            : 'Fərdi Hədiyyələr və Lazer Yazılı Məhsullar',
          desc,
          lang,
        }),
      );
      html = finalizePage(html, { lang, pathAz: '/mehsullar', title: tr(lang, 'productsPage.meta.title'), desc });
      writePage(distFile(lang, 'mehsullar'), html);
      console.log(`  ✅ ${pathFor('/mehsullar', lang)} (siyahı səhifəsi)`);
    } catch (err) {
      fail++;
      console.error(`  ❌ [${lang}] /mehsullar — ${err.message}`);
    }
  }

  // ── Kateqoriya səhifələrini prerender et (AZ + EN) ───────────────────────
  // AZ mətnləri seo-categories.mjs-dən (əl ilə yazılmış); orada olmayan yeni
  // kateqoriya üçün runtime ilə (SlugPage.tsx) eyni ümumi şablon işlənir.
  let catOk = 0;
  for (const lang of LANGS) {
    for (const cat of activeCategories) {
      try {
        const pathAz = `/mehsullar/${cat.slug}`;
        const catUrl = urlFor(pathAz, lang);
        const seo = CATEGORY_PAGES.find((c) => c.slug === cat.slug);
        const label = lang === 'en' ? cat.nameEn : cat.name;
        const title = lang === 'az' && seo ? seo.title : `${label} | Ravio`;
        const desc = lang === 'az' && seo ? seo.desc : `${label} — ${tr(lang, 'slugPage.categoryDescSuffix')}`;
        const h1 = lang === 'az' && seo ? seo.h1 : label;

        let html = injectStaticRoot(template, simpleSeoContent({ h1, desc, lang }));
        html = finalizePage(html, { lang, pathAz, title, desc });

        // Kateqoriya üçün BreadcrumbList + CollectionPage schema
        html = html.replace('</head>', `${jsonLdTag({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: h1,
          description: desc,
          url: catUrl,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ravio', item: lang === 'en' ? `${SITE}/en` : SITE },
              { '@type': 'ListItem', position: 2, name: SHELL_TEXT[lang].products, item: urlFor('/mehsullar', lang) },
              { '@type': 'ListItem', position: 3, name: h1, item: catUrl },
            ],
          },
        })}\n</head>`);

        writePage(distFile(lang, 'mehsullar', cat.slug), html);
        catOk++;
        console.log(`  ✅ ${pathFor(pathAz, lang)}`);
      } catch (err) {
        console.error(`  ❌ [${lang}] /mehsullar/${cat.slug} — ${err.message}`);
      }
    }
  }

  console.log(`\n🎉 Tamamlandı: ${ok}/${products.length * LANGS.length} məhsul + ${catOk}/${activeCategories.length * LANGS.length} kateqoriya HTML-i yaradıldı`);
  if (fail > 0) console.warn(`⚠️  ${fail} səhifə zamanı xəta baş verdi`);

  // ── "Kimə alırsan?" səhifələri (Sanity-dən dinamik, AZ + EN) ─────────────
  const audienceCategories = await client.fetch(`
    *[_type == "audienceCategory" && isActive != false && defined(slug.current)] | order(order asc, name asc) {
      name, nameEn, "slug": slug.current
    }
  `);

  let audOk = 0;
  for (const lang of LANGS) {
    for (const ac of audienceCategories) {
      try {
        const pathAz = `/kime/${ac.slug}`;
        const acUrl = urlFor(pathAz, lang);
        const acName = lang === 'en' ? (ac.nameEn || ac.name) : ac.name;
        const acTitle = tr(lang, 'audiencePage.metaTitleTemplate', { name: acName });
        const acDesc = tr(lang, 'audiencePage.metaDescriptionTemplate', { name: acName });

        let html = injectStaticRoot(template, simpleSeoContent({ h1: acName, desc: acDesc, lang }));
        html = finalizePage(html, { lang, pathAz, title: acTitle, desc: acDesc });
        html = html.replace('</head>', `${jsonLdTag({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: acName,
          description: acDesc,
          url: acUrl,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Ravio', item: lang === 'en' ? `${SITE}/en` : SITE },
              { '@type': 'ListItem', position: 2, name: acName, item: acUrl },
            ],
          },
        })}\n</head>`);

        writePage(distFile(lang, 'kime', ac.slug), html);
        audOk++;
        console.log(`  ✅ ${pathFor(pathAz, lang)}`);
      } catch (err) {
        console.error(`  ❌ [${lang}] /kime/${ac.slug} — ${err.message}`);
      }
    }
  }
  console.log(`🎯 ${audOk}/${audienceCategories.length * LANGS.length} "Kimə alırsan?" HTML-i yaradıldı\n`);

  // ── Statik səhifələr (Haqqımızda, Çatdırılma, Blog siyahısı) — AZ + EN ──
  // Əvvəl bu səhifələrə girişdə "/" səhifəsinin canonical-ı gəlirdi (yanlış siqnal).
  const STATIC_PAGES = [
    { pathAz: '/haqqimizda', titleKey: 'about.seoTitle', descKey: 'about.seoDesc', h1: { az: 'Haqqımızda', en: 'About Us' } },
    { pathAz: '/catdirilma', titleKey: 'delivery.seoTitle', descKey: 'delivery.seoDesc', h1: { az: 'Çatdırılma', en: 'Delivery' } },
    { pathAz: '/blog', titleKey: 'blogListPage.meta.title', descKey: 'blogListPage.meta.description', h1: { az: 'Blog', en: 'Blog' } },
  ];
  let staticOk = 0;
  for (const lang of LANGS) {
    for (const sp of STATIC_PAGES) {
      try {
        const title = tr(lang, sp.titleKey);
        const desc = tr(lang, sp.descKey);
        let html = injectStaticRoot(template, simpleSeoContent({ h1: sp.h1[lang], desc, lang }));
        html = finalizePage(html, { lang, pathAz: sp.pathAz, title, desc });
        writePage(distFile(lang, sp.pathAz.slice(1)), html);
        staticOk++;
        console.log(`  ✅ ${pathFor(sp.pathAz, lang)}`);
      } catch (err) {
        console.error(`  ❌ [${lang}] ${sp.pathAz} — ${err.message}`);
      }
    }
  }
  console.log(`📄 ${staticOk}/${STATIC_PAGES.length * LANGS.length} statik səhifə HTML-i yaradıldı\n`);

  // ── Blog yazılarını prerender et (Sanity-dən dinamik) ─────────────────────
  const blogPosts = await client.fetch(`
    *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
      title, "slug": slug.current, excerpt, seoTitle, seoDescription,
      "coverImageUrl": coverImage.asset->url, publishedAt
    }
  `);

  let blogOk = 0;
  for (const post of blogPosts) {
    try {
      const postUrl = `https://ravio.az/blog/${post.slug}`;
      const postTitle = post.seoTitle || `${post.title} | Ravio Blog`;
      const postDesc = post.seoDescription || post.excerpt || '';

      let html = injectMeta(template, {
        title: postTitle,
        desc: postDesc,
        url: postUrl,
        image: post.coverImageUrl || 'https://ravio.az/og-ravio.png',
      });
      html = injectStaticRoot(html, simpleSeoContent({ h1: post.title, desc: postDesc }));

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: postDesc,
        image: post.coverImageUrl || 'https://ravio.az/og-ravio.png',
        datePublished: post.publishedAt,
        author: { '@type': 'Organization', name: 'Ravio' },
        publisher: { '@type': 'Organization', name: 'Ravio', logo: { '@type': 'ImageObject', url: 'https://ravio.az/og-ravio.png' } },
        mainEntityOfPage: postUrl,
      };
      const schemaTag = `\n  <script type="application/ld+json">${JSON.stringify(schema)}</script>`;
      html = html.replace('</head>', `${schemaTag}\n</head>`);

      mkdirSync(`dist/blog/${post.slug}`, { recursive: true });
      writeFileSync(`dist/blog/${post.slug}/index.html`, html, 'utf-8');
      blogOk++;
      console.log(`  ✅ /blog/${post.slug}`);
    } catch (err) {
      console.error(`  ❌ /blog/${post.slug} — ${err.message}`);
    }
  }
  console.log(`📰 ${blogOk}/${blogPosts.length} blog yazısı HTML-i yaradıldı`);
  console.log('');

  // ── Yekun yoxlama: səssiz uğursuzluğa YOL YOXDUR ──────────────────────────
  // (Əvvəl bu skript xəta verəndə "uğurlu" çıxırdı — nəticədə heç bir HTML
  // yaranmadan həftələrlə dərc olunurdu.)
  const problems = [];
  const mustContain = (file, needle) => {
    try {
      if (!readFileSync(file, 'utf-8').includes(needle)) problems.push(`${file}: "${needle}" tapılmadı`);
    } catch {
      problems.push(`${file}: fayl yaradılmayıb`);
    }
  };
  mustContain('dist/index.html', 'data-seo-shell');
  mustContain('dist/index.html', 'hreflang="en"');
  mustContain('dist/en/index.html', '<html lang="en">');
  mustContain('dist/en/index.html', `<link rel="canonical" href="${SITE}/en"`);
  const expectedProducts = products.length * LANGS.length;
  if (ok / expectedProducts < 0.95) problems.push(`məhsul səhifələri: ${ok}/${expectedProducts}`);
  const expectedCats = activeCategories.length * LANGS.length;
  if (expectedCats > 0 && catOk / expectedCats < 0.95) problems.push(`kateqoriya səhifələri: ${catOk}/${expectedCats}`);
  if (problems.length) {
    throw new Error(`Yekun yoxlama uğursuz:\n   - ${problems.join('\n   - ')}`);
  }
  console.log('✅ SEO yekun yoxlama keçdi (AZ+EN ana səhifə, hreflang, məhsul və kateqoriya HTML-ləri)\n');
}

run().catch((err) => {
  console.error('\n❌ inject-seo UĞURSUZ OLDU:', err.message || err);
  if (process.env.SEO_SOFT_FAIL === '1') {
    console.error('⚠️  SEO_SOFT_FAIL=1 olduğu üçün build davam edir (YALNIZ təcili hal üçün; sonra düzəlt!).');
    process.exit(0);
  }
  process.exit(1);
});
