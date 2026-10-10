# Ravio.az

Lazer yazılı fərdi hədiyyələr mağazası — https://ravio.az

**Texnologiya:** React 19 + TypeScript + Vite (sayt) · Sanity (məhsullar/məzmun) · Vercel (yayım + `api/` funksiyaları)

## Əmrlər

| Əmr | Nə edir |
|---|---|
| `npm install` | Asılılıqları qurur |
| `npm run dev` | Saytı lokal açır (http://localhost:3000) |
| `npm run build` | Sitemap → Vite build → hər səhifə üçün hazır SEO HTML (Vercel bunu özü işlədir) |
| `npm run typecheck` | TypeScript xətalarını yoxlayır — **hər dəyişiklikdən sonra işlət** |
| `npm test` | `api/` qoruma testləri (26 test) |
| `npm run studio` | Sanity Studio-nu lokal açır |
| `npm run studio:deploy` | Studio-nu (sxem dəyişiklikləri daxil) yayımlayır |

## Qovluqlar

```
App.tsx, index.tsx     Giriş nöqtəsi, marşrutlar (AZ və /en EYNİ siyahıdan qurulur)
components/            Səhifə və komponentlər (pages/, home/, catalog/)
lib/                   Qiymət, səbət, SEO, Sanity sorğuları, ortaq köməkçilər
constants/             contact.ts (WhatsApp nömrəsi), defaults.ts, seo.ts
i18n/                  az.json / en.json (açar sayı bərabər olmalıdır)
schemas/               Sanity sxemləri: product, category, siteSettings, audienceCategory, blogPost
api/                   Vercel serverless: şəkil yükləmə, Meta CAPI, satış izləmə
public/                Statik fayllar (sw.js, robots.txt, llms.txt, pricing.md, sitemap.xml ...)
generate-sitemap.mjs   Build addımı 1: sitemap.xml (Sanity-dən)
inject-seo.mjs         Build addımı 3: hər məhsul/kateqoriya üçün hazır SEO HTML
seo-categories.mjs     Kateqoriya SEO mətnlərinin TƏK mənbəyi
```

## Build necə işləyir

`generate-sitemap.mjs` → `vite build` → `inject-seo.mjs`.

Son addım Sanity-dən məlumatı oxuyub hər səhifənin başlıq / təsvir / JSON-LD məlumatını **hazır HTML-ə** yazır.
Google, WhatsApp və Facebook önizləmələri çox vaxt JavaScript işlətmir — yalnız bu ilkin HTML-i görürlər.
`inject-seo.mjs` uğursuz olarsa build dayanır və köhnə sayt canlı qalır. Yalnız təcili halda `SEO_SOFT_FAIL=1`
ilə build davam etdirilə bilər (sonra mütləq düzəlt).

## Vercel-də lazım olan gizli dəyişənlər (Settings → Environment Variables)

| Ad | Nə üçün |
|---|---|
| `IMGBB_API_KEY` | Müştərinin yüklədiyi şəkil (`api/upload-image.js`) |
| `META_CAPI_TOKEN` | Meta Conversions API (`api/capi.js`, `api/track-purchase.js`) |
| `META_TEST_EVENT_CODE` | *İstəyə bağlı.* Yalnız test zamanı; bitəndə sil |

## Dəyişiklik edəndə nələri yeniləmək lazımdır

- **Yeni kateqoriya (öz SEO mətni ilə):** `seo-categories.mjs` + Sanity-də kateqoriya.
- **Telefon / WhatsApp nömrəsi:** `constants/contact.ts` + `index.html` (LocalBusiness) + `public/llms.txt` + `public/pricing.md` + `i18n/locales/*.json`.
- **Sanity sxemi dəyişdi:** `npm run studio:deploy` (MCP və ya GitHub vasitəsilə yayılmır).
- **Sayt faylları dəyişdi (şəkil, ikon):** `public/sw.js` içində 3 keş adındakı versiyanı artır (`ravio-v9` → `v10`).
- **Yeni mətn əlavə etdin:** həm `az.json`, həm `en.json`-a EYNİ açarla yaz.

## Bilərəkdən belə saxlananlar (silməyin)

- `components/pages/HomePage.tsx` — hero banner müvəqqəti `/* */` ilə söndürülüb. `reelPosts`, `heroSlides` və
  `UnifiedHeroCarousel` import-u onu geri qaytarmaq üçündür. TypeScript "istifadə olunmur" desə də toxunma.
- `styled-components` — saytda işlənmir, amma **Sanity Studio-nun məcburi asılılığıdır**.
- WhatsApp sifariş mətni (`CartDrawer.tsx` → `buildMessage`) Azərbaycancadır — istehsalata gedir, müştəriyə yox.
- `schemas/slugify.js` və `lib/slug.mjs` ayrı funksiyalardır (boşluq/tire qaydası fərqlidir) — birləşdirmək mövcud URL-ləri dəyişdirər.
