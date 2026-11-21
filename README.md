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
| `npm test` | `api/` qoruma testləri + sifariş qeydi və qiymət düsturu testləri (66 yoxlama) |
| `npm run studio` | Sanity Studio-nu lokal açır |
| `npm run studio:deploy` | Studio-nu (sxem dəyişiklikləri daxil) yayımlayır |

## Qovluqlar

```
App.tsx, index.tsx     Giriş nöqtəsi, marşrutlar (AZ və /en EYNİ siyahıdan qurulur)
components/            Səhifə və komponentlər (pages/, home/, catalog/)
lib/                   Qiymət, səbət, SEO, Sanity sorğuları, ortaq köməkçilər
constants/             contact.ts (WhatsApp nömrəsi), defaults.ts, seo.ts
i18n/                  az.json / en.json (açar sayı bərabər olmalıdır)
schemas/               Sanity sxemləri: product, category, siteSettings, audienceCategory, blogPost, order
api/                   Vercel serverless: şəkil yükləmə, Meta CAPI (Lead), sifariş qeydi, satış izləmə (Purchase — bağlıdır)
public/                Statik fayllar (sw.js, robots.txt, llms.txt, pricing.md, sitemap.xml ...)
generate-sitemap.mjs   Build addımı 1: sitemap.xml (Sanity-dən)
inject-seo.mjs         Build addımı 3: hər məhsul/kateqoriya üçün hazır SEO HTML
seo-categories.mjs     Kateqoriya SEO mətnlərinin TƏK mənbəyi
```

## Build necə işləyir

`scripts/check-english-toggle.mjs` (açar yoxlaması) → `generate-sitemap.mjs` → `vite build` → `inject-seo.mjs`.

Son addım Sanity-dən məlumatı oxuyub hər səhifənin başlıq / təsvir / JSON-LD məlumatını **hazır HTML-ə** yazır.
Google, WhatsApp və Facebook önizləmələri çox vaxt JavaScript işlətmir — yalnız bu ilkin HTML-i görürlər.
`inject-seo.mjs` uğursuz olarsa build dayanır və köhnə sayt canlı qalır. Yalnız təcili halda `SEO_SOFT_FAIL=1`
ilə build davam etdirilə bilər (sonra mütləq düzəlt).

## İngilis versiya (`/en`) — hazırda DAYANDIRILIB

Qərar (21 noyabr 2026): əvvəlcə Azərbaycan bazarına və Azərbaycanca məzmuna fokuslanırıq. İngilis versiya **silinməyib**, söndürülüb.

| Nə | Vəziyyət |
|---|---|
| `ravio.az/en` və `/en/...` | Azərbaycanca ekvivalentə daimi (308) yönləndirilir — `vercel.json` (ehtiyat: `components/EnglishPausedRedirect.tsx`) |
| `sitemap.xml`, hreflang | Yalnız Azərbaycan (`az` + `x-default`); `/en` HTML-ləri build-də yaradılmır |
| AZ/EN dil düyməsi | Gizlidir (Navbar) |
| İngilis kod və tərcümələr | Toxunulmayıb: `i18n/locales/en.json`, `/en` marşrutları, Sanity-dəki `nameEn` / `descriptionEn` və s. |

**Yenidən açmaq üçün (3 addım):**

1. `lib/features.mjs` → `ENGLISH_ENABLED = true`
2. `vercel.json` → `"redirects"` blokundakı iki `/en` yönləndirməsini silin
3. `public/llms.txt` → İngilis versiya sətrini qaytarın: `- [English version of the site](https://ravio.az/en)`

Bunlardan biri unudulsa `npm run build` (`scripts/check-english-toggle.mjs`) dayanır və nəyin çatışmadığını yazır.
Açdıqdan sonra Search Console-da sitemap-i yenidən göndərin.

## Vercel-də lazım olan gizli dəyişənlər (Settings → Environment Variables)

| Ad | Nə üçün |
|---|---|
| `IMGBB_API_KEY` | Müştərinin yüklədiyi şəkil (`api/upload-image.js`) |
| `META_CAPI_TOKEN` | Meta Conversions API (`api/capi.js`, `api/track-purchase.js`) |
| `SANITY_WRITE_TOKEN` | Sifariş qeydi (`api/order.js`). Sanity → API → Tokens → "Editor" səlahiyyətli token. **Olmasa sifariş qeydi yazılmır** (sifariş axınına təsiri yoxdur) |
| `ORDER_HASH_SECRET` | *İstəyə bağlı.* Telefon hash-i üçün gizli söz. Boşdursa `SANITY_WRITE_TOKEN` istifadə olunur. Sonradan dəyişmə — köhnə hash-lər uyğun gəlməz |
| `PURCHASE_WEBHOOK_SECRET` | *İstəyə bağlı.* `api/track-purchase.js` (real "Purchase") yalnız bu açarla (`x-ravio-secret` başlığı) açılır. **Boşdursa endpoint bağlıdır (503)** |
| `META_TEST_EVENT_CODE` | *İstəyə bağlı.* Yalnız test zamanı; bitəndə sil |

## Reklam siqnalı və sifariş qeydi

- **WhatsApp düyməsinə basılanda "Purchase" YOX, "Lead" göndərilir** (GA4 `generate_lead`, Meta Pixel `Lead`,
  server-side `/api/capi` — hamısı eyni `event_id` = sifariş nömrəsi ilə, dublikat sayılmır). Çünki bu an hələ
  beh ödənilməyib. Real **"Purchase"** yalnız beh təsdiqlənəndən sonra `api/track-purchase.js` ilə, **server-to-server**
  göndərilməlidir (Make.com və ya Sanity webhook; `x-ravio-secret` başlığı ilə). Brauzerdən çağırıla bilməz.
- **Sifariş qeydi (`api/order.js`)** WhatsApp açıldıqdan SONRA, gözlənilmədən çağırılır; uğursuz olsa sifarişə təsiri yoxdur.
  Məbləği Sanity-dəki real qiymətlərlə yenidən hesablayır (`lib/orderPricing.js` — brauzerdəki səbətlə EYNİ funksiya),
  fərq varsa `totalsMismatch` işarələyir. Studio-da **Sifarişlər** bölməsində görünür (statusu siz yeniləyirsiniz).
- **Məxfilik qaydası:** Sanity dataset-i **public**-dir (sayt məlumatı apicdn-dən oxuyur) — orada yazılan hər şey
  internetdən oxuna bilər. Ona görə sifariş qeydinə **ad, telefon, ünvan, doğum tarixi, şəkil YAZILMIR**; telefon
  yalnız bərpa edilə bilməyən HMAC hash kimi saxlanır. Bu qaydanı pozma.
- **Quraşdırma (bir dəfə):** (1) Sanity → API → Tokens → "Editor" token yarat; (2) Vercel → Environment Variables →
  `SANITY_WRITE_TOKEN` (Production + Preview) əlavə et və yenidən deploy et; (3) `npm run studio:deploy`.
- **Xeyriyyə sayğacı və rəylər:** Studio → Sayt tənzimləmələri → *🐾 Xeyriyyə sayğacı* (məbləğ, tarix, qəbz şəkilləri).
  Məbləğ boşdursa sayt heç nə göstərmir. Ana səhifədəki rəy bölməsi məhsullardakı REAL rəylərdən oxuyur
  (3-dən az rəy varsa görünmür).

## Dəyişiklik edəndə nələri yeniləmək lazımdır

- **Yeni kateqoriya (öz SEO mətni ilə):** `seo-categories.mjs` + Sanity-də kateqoriya.
- **Telefon / WhatsApp nömrəsi:** `constants/contact.ts` + `index.html` (OnlineStore) + `public/llms.txt` + `public/pricing.md` + `i18n/locales/*.json`.
- **Sanity sxemi dəyişdi:** `npm run studio:deploy` (MCP və ya GitHub vasitəsilə yayılmır).
- **Sayt faylları dəyişdi (şəkil, ikon):** `public/sw.js` içində 3 keş adındakı versiyanı artır (hazırda `v10` → `v11`).
- **`public/ga-init.js` və ya `public/meta-pixel.js` dəyişdi:** `index.html`-dəki `?v=2` rəqəmini artır (köhnə brauzer keşini yarmaq üçün).
- **Yeni mətn əlavə etdin:** həm `az.json`, həm `en.json`-a EYNİ açarla yaz.

## Bilərəkdən belə saxlananlar (silməyin)

- `components/pages/HomePage.tsx` — hero banner müvəqqəti `/* */` ilə söndürülüb. `reelPosts`, `heroSlides` və
  `UnifiedHeroCarousel` import-u onu geri qaytarmaq üçündür. TypeScript "istifadə olunmur" desə də toxunma.
- `styled-components` — saytda işlənmir, amma **Sanity Studio-nun məcburi asılılığıdır**.
- WhatsApp sifariş mətni (`CartDrawer.tsx` → `buildMessage`) Azərbaycancadır — istehsalata gedir, müştəriyə yox.
- `schemas/slugify.js` və `lib/slug.mjs` ayrı funksiyalardır (boşluq/tire qaydası fərqlidir) — birləşdirmək mövcud URL-ləri dəyişdirər.
