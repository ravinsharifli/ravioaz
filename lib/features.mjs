// lib/features.mjs — saytın "açar"ları (feature flags).
//
// Bu faylı HƏM React kodu (TS), HƏM build skriptləri (generate-sitemap.mjs, inject-seo.mjs,
// scripts/check-english-toggle.mjs) oxuyur — ona görə düz .mjs-dir (lib/slug.mjs kimi).
// Dəyər TƏK yerdə dəyişir.
//
// ENGLISH_ENABLED
//   false → İngilis versiya DAYANDIRILIB (silinməyib):
//           • ravio.az/en və /en/... → Azərbaycanca ekvivalentə daimi (308) yönləndirilir (vercel.json)
//           • sitemap.xml və hreflang yalnız Azərbaycan dilindədir; /en HTML-ləri build-də yaradılmır
//           • AZ/EN dil düyməsi gizlədilib
//           • İngilis kod (en.json, nameEn/descriptionEn sahələri, /en marşrutları) və Sanity-dəki
//             tərcümələr TOXUNULMAZ saxlanılır
//   true  → İngilis versiya yenidən açılır. Bunun üçün həm də:
//           (1) vercel.json-dan /en ilə başlayan iki yönləndirməni silin,
//           (2) public/llms.txt-ə İngilis versiya sətrini qaytarın.
//           Build bunu yoxlayır (scripts/check-english-toggle.mjs): uyğunsuzluq olsa build dayanır
//           və nə etməli olduğunu yazır.
//
// Ətraflı: README.md → "İngilis versiya (/en)".

/** @type {boolean} */
export const ENGLISH_ENABLED = false;
