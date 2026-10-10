// seo-categories.mjs
// Kateqoriya SEO mətnlərinin (başlıq, təsvir, H1) TƏK mənbəyi. Yeni kateqoriya üçün
// əl ilə yazılmış mətn istəyirsənsə, yalnız bu faylı redaktə et.
// Bunu oxuyanlar: inject-seo.mjs (build zamanı prerender) və lib/categorySeo.ts (brauzer).
// (generate-sitemap.mjs bunu işlətmir — sitemap kateqoriyaları birbaşa Sanity-dən götürür.)

export const CATEGORY_PAGES = [
  {
    slug: 'qolbaqlar',
    title: 'Lazer Yazılı Qolbaqlar — Fərdi Hədiyyə | Ravio',
    desc: 'Fərdi lazer yazılı qolbaqlar — ad, tarix, mesaj, koordinat. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günündə hazır.',
    h1: 'Lazer Yazılı Qolbaqlar',
  },
  {
    slug: 'boyunbagilar',
    title: 'Lazer Yazılı Boyunbağılar — Fərdi Hədiyyə | Ravio',
    desc: 'Ad, tarix və ya şəxsi mesajla fərdiləşdirilmiş lazer yazılı boyunbağılar. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günündə hazır.',
    h1: 'Lazer Yazılı Boyunbağılar',
  },
  {
    slug: 'tesbehler',
    title: 'Fərdi Qravürlü Təsbehlər | Ravio',
    desc: 'Lazer qravürlü fərdi təsbehlər — əqiq, hematit, riyolit daşlar. Azərbaycanın hər şəhərinə ödənişsiz çatdırılma.',
    h1: 'Fərdi Qravürlü Təsbehlər',
  },
  {
    slug: 'avto-aksessuarlar',
    title: 'Avtomobil üçün Fərdi Hədiyyələr | Ravio',
    desc: 'Şəxsi yazılı lipa nömrə və digər avtomobil aksesuarları. Sürücüyə original hədiyyə, bütün Azərbaycana ödənişsiz çatdırılma.',
    h1: 'Avtomobil üçün Fərdi Hədiyyələr',
  },
  {
    slug: 'dest-hediyyeler',
    title: 'Hədiyyə Dəstləri — Fərdi Qablaşdırma | Ravio',
    desc: 'Bir neçə məhsulu özündə birləşdirən hazır hədiyyə dəstləri. Ad günü, toy, korporativ hədiyyə üçün ideal seçim.',
    h1: 'Hədiyyə Dəstləri',
  },
  {
    slug: 'saatlar',
    title: 'Fərdi Yazılı Saatlar — Hədiyyəlik | Ravio',
    desc: 'Arxa hissəsi şəxsi mesajla qravürlənmiş saatlar. Sevdiyin insana zamanla qalan hədiyyə.',
    h1: 'Fərdi Yazılı Saatlar',
  },
  {
    slug: 'pulqabi',
    title: 'Fərdi Yazılı Pulqabı — Dəri Hədiyyə | Ravio',
    desc: 'Ad və ya mesajla qravürlənmiş dəri pulqabılar. Kişilərə praktik və şəxsi hədiyyə seçimi.',
    h1: 'Fərdi Yazılı Pulqabı',
  },
  {
    slug: 'breloklar',
    title: 'Lazer Yazılı Breloklar — Fərdi Hədiyyə | Ravio',
    desc: 'Açar üçün şəxsi yazılı metal və dəri breloklar. Kiçik, sərfəli və hər gün istifadə olunan hədiyyə.',
    h1: 'Lazer Yazılı Breloklar',
  },
  {
    slug: 'alisqanlar',
    title: 'Fərdi Yazılı Alışqanlar — Hədiyyəlik | Ravio',
    desc: 'Ad və ya mesajla qravürlənmiş metal alışqanlar. Kişilərə unudulmaz, praktik hədiyyə.',
    h1: 'Fərdi Yazılı Alışqanlar',
  },
  {
    slug: 'geyim',
    title: 'Fərdi Dizaynlı Geyim — Hoodie, Köynək | Ravio',
    desc: 'Şəxsi yazı və dizaynla hazırlanan hoodie və köynəklər. Özünə görə hədiyyə.',
    h1: 'Fərdi Dizaynlı Geyim',
  },
  {
    slug: 'foto-cerciveler',
    title: 'Fərdi Foto Çərçivələr — Hədiyyəlik | Ravio',
    desc: 'Şəkil və yazı ilə fərdiləşdirilmiş divar çərçivələri, A4/A5/A6 ölçülərində. Ev üçün isti hədiyyə.',
    h1: 'Fərdi Foto Çərçivələr',
  },
  {
    slug: 'diger-hediyyeler',
    title: 'Digər Fərdi Hədiyyələr | Ravio',
    desc: 'Fincan, güzgü, qələm dəsti və digər fərdi yazılı kiçik hədiyyələr. Hər zövqə uyğun seçim.',
    h1: 'Digər Hədiyyələr',
  },
];
