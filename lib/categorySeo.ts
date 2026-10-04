// ─────────────────────────────────────────────────────────────────────────────
// DİQQƏT: Bu fayl seo-categories.mjs ilə SİNXRON olmalıdır (orada dəyişəndə burada da dəyiş).
// Səbəb: build zamanı prerender olunan başlıq/təsvir (seo-categories.mjs) ilə brauzerdə
// Helmet-in qoyduğu başlıq (bu fayl) fərqli olarsa, Google JS-i işlədəndən sonra
// zəif/ümumi başlığı görür. Köhnə "domino" və "hediyelik_qutular" açarları silindi —
// bu kateqoriyalar artıq mövcud deyil.
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_SEO: Record<string, { title: string; description: string; h1: string }> = {
  qolbaqlar: {
    title: "Lazer Yazılı Qolbaqlar — Fərdi Hədiyyə | Ravio",
    description: "Fərdi lazer yazılı qolbaqlar — ad, tarix, mesaj, koordinat. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günündə hazır.",
    h1: "Lazer Yazılı Qolbaqlar",
  },
  boyunbagilar: {
    title: "Lazer Yazılı Boyunbağılar — Fərdi Hədiyyə | Ravio",
    description: "Ad, tarix və ya şəxsi mesajla fərdiləşdirilmiş lazer yazılı boyunbağılar. Bütün Azərbaycana ödənişsiz çatdırılma, 1–3 iş günündə hazır.",
    h1: "Lazer Yazılı Boyunbağılar",
  },
  tesbehler: {
    title: "Fərdi Qravürlü Təsbehlər | Ravio",
    description: "Lazer qravürlü fərdi təsbehlər — əqiq, hematit, riyolit daşlar. Azərbaycanın hər şəhərinə ödənişsiz çatdırılma.",
    h1: "Fərdi Qravürlü Təsbehlər",
  },
  "avto-aksessuarlar": {
    title: "Avtomobil üçün Fərdi Hədiyyələr | Ravio",
    description: "Şəxsi yazılı lipa nömrə və digər avtomobil aksesuarları. Sürücüyə original hədiyyə, bütün Azərbaycana ödənişsiz çatdırılma.",
    h1: "Avtomobil üçün Fərdi Hədiyyələr",
  },
  "dest-hediyyeler": {
    title: "Hədiyyə Dəstləri — Fərdi Qablaşdırma | Ravio",
    description: "Bir neçə məhsulu özündə birləşdirən hazır hədiyyə dəstləri. Ad günü, toy, korporativ hədiyyə üçün ideal seçim.",
    h1: "Hədiyyə Dəstləri",
  },
  saatlar: {
    title: "Fərdi Yazılı Saatlar — Hədiyyəlik | Ravio",
    description: "Arxa hissəsi şəxsi mesajla qravürlənmiş saatlar. Sevdiyin insana zamanla qalan hədiyyə.",
    h1: "Fərdi Yazılı Saatlar",
  },
  pulqabi: {
    title: "Fərdi Yazılı Pulqabı — Dəri Hədiyyə | Ravio",
    description: "Ad və ya mesajla qravürlənmiş dəri pulqabılar. Kişilərə praktik və şəxsi hədiyyə seçimi.",
    h1: "Fərdi Yazılı Pulqabı",
  },
  breloklar: {
    title: "Lazer Yazılı Breloklar — Fərdi Hədiyyə | Ravio",
    description: "Açar üçün şəxsi yazılı metal və dəri breloklar. Kiçik, sərfəli və hər gün istifadə olunan hədiyyə.",
    h1: "Lazer Yazılı Breloklar",
  },
  alisqanlar: {
    title: "Fərdi Yazılı Alışqanlar — Hədiyyəlik | Ravio",
    description: "Ad və ya mesajla qravürlənmiş metal alışqanlar. Kişilərə unudulmaz, praktik hədiyyə.",
    h1: "Fərdi Yazılı Alışqanlar",
  },
  geyim: {
    title: "Fərdi Dizaynlı Geyim — Hoodie, Köynək | Ravio",
    description: "Şəxsi yazı və dizaynla hazırlanan hoodie və köynəklər. Özünə görə hədiyyə.",
    h1: "Fərdi Dizaynlı Geyim",
  },
  "foto-cerciveler": {
    title: "Fərdi Foto Çərçivələr — Hədiyyəlik | Ravio",
    description: "Şəkil və yazı ilə fərdiləşdirilmiş divar çərçivələri, A4/A5/A6 ölçülərində. Ev üçün isti hədiyyə.",
    h1: "Fərdi Foto Çərçivələr",
  },
  "diger-hediyyeler": {
    title: "Digər Fərdi Hədiyyələr | Ravio",
    description: "Fincan, güzgü, qələm dəsti və digər fərdi yazılı kiçik hədiyyələr. Hər zövqə uyğun seçim.",
    h1: "Digər Hədiyyələr",
  },
};
