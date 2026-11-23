// lib/shellContent.mjs — prerender olunan səhifələrin "robot məzmununu" (JS olmadan görünən HTML) üçün SAF qurucular.
// Niyə ayrı fayl: inject-seo.mjs Sanity tələb edir, bunlar isə şəbəkəsiz test olunur (scripts/agent.test.mjs).
// Bu HTML React yüklənəndə əvəz olunur və vizual olaraq gizlidir (index.html-dəki #root[data-seo-shell] qaydası) → dizayn dəyişmir.

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const MAIN_STYLE = 'max-width:1280px;margin:0 auto;padding:32px 16px;font-family:Inter,Arial,sans-serif';

/**
 * Ana səhifə (AZ). categories: [{slug, name}], items: [{name, path, price}]
 * Mətnlər public/llms.txt və saytdakı real mətnlərlə uyğundur (uydurma məlumat yoxdur).
 */
export function homeShellAz({ categories = [], items = [] } = {}) {
  const catList = categories
    .filter((c) => c && c.slug && c.name)
    .map((c) => `<li><a href="/mehsullar/${esc(c.slug)}">${esc(c.name)}</a></li>`)
    .join('');
  const productList = items
    .filter((it) => it && it.path && it.name)
    .map((it) => `<li><a href="${esc(it.path)}">${esc(it.name)}</a>${it.price ? ` — Qiymət: ${esc(it.price)} AZN` : ''}</li>`)
    .join('');
  return `
    <main style="${MAIN_STYLE}">
      <h1>Lazer Yazılı Qolbaq və Fərdi Hədiyyələr Bakıda — Ravio</h1>
      <p>
        Ravio-da lazer yazılı qolbaq, fərdi təsbeh, domino və hədiyyəlik qutular
        sifariş edə bilərsiniz. Hər məhsul sizin üçün özəl hazırlanır.
        Bütün Azərbaycana ödənişsiz çatdırılma və 1–3 iş günündə hazırlıq.
      </p>
      <p>
        Ravio Bakıda fəaliyyət göstərən onlayn hədiyyə mağazasıdır (fiziki mağaza yoxdur).
        Müştəri öz adını, tarixini, mesajını və ya şəklini seçir, Ravio onu lazer texnologiyası ilə
        məhsula həkk edir. Lazer yazısı materialın içinə işlənir — silinmir, solmur, rəngi dəyişmir.
      </p>
      <nav aria-label="Məhsul kateqoriyaları">
        <a href="/mehsullar">Bütün məhsullar</a> ·
        <a href="/mehsullar/boyunbagilar">Lazer yazılı boyunbağılar</a> ·
        <a href="/mehsullar/qolbaqlar">Lazer yazılı qolbaqlar</a> ·
        <a href="/mehsullar/tesbehler">Fərdi təsbehlər</a>
      </nav>
      ${catList ? `<h2>Kateqoriyalar</h2><ul>${catList}</ul>` : ''}
      <h2>Necə sifariş verilir</h2>
      <ul>
        <li>Saytda məhsulu seçin, yazını yazın və yazı şriftini seçin.</li>
        <li>Məhsulu səbətə əlavə edin — sifariş WhatsApp-a göndərilir.</li>
        <li>Ravio sifarişi təsdiqləyir və hazırlamağa başlayır. Məhsullar sifarişlə hazırlandığı üçün 50% ilkin ödəniş (beh) alınır, qalan hissə çatdırılma zamanı ödənilir.</li>
      </ul>
      <h2>Çatdırılma</h2>
      <p>
        Bütün çatdırılma növləri ödənişsizdir: Bakı və Sumqayıta kuryer, Bakı metrosunun istənilən stansiyasında görüş,
        rayonlara poçt və ya Expargo kargo (təxminən 2–3 gün).
      </p>
      ${productList ? `<h2>Məhsullar</h2><ul>${productList}</ul><a href="/mehsullar">Bütün məhsullara bax</a>` : ''}
    </main>
  `;
}

/**
 * Blog siyahı səhifəsinin giriş mətni (AZ). Yazı sayı az olanda belə səhifədə JS olmadan ≥500 simvol mətn olsun deyə.
 * Mətnlər saytdakı real məlumatlardır (public/llms.txt, Haqqımızda, Çatdırılma).
 */
export function blogIntroAz() {
  return `<p>Ravio blogunda hədiyyə seçimi, fərdi lazer yazısı ilə hədiyyə hazırlamaq və yeni məhsullar haqqında yazılar dərc olunur. Aşağıda bütün yazıların siyahısı var.</p>
      <p>Ravio Bakıda fəaliyyət göstərən onlayn hədiyyə mağazasıdır. Hər məhsul sifariş əsasında hazırlanır: ad, tarix, mesaj və ya şəkil lazer texnologiyası ilə məhsula həkk edilir. Lazer yazısı materialın içinə işlənir, silinmir və solmur. Bütün Azərbaycana çatdırılma ödənişsizdir, sifariş 1–3 iş günündə hazırlanır.</p>
      <p>Hədiyyə ideyaları üçün kateqoriyalara baxın: <a href="/mehsullar/qolbaqlar">lazer yazılı qolbaqlar</a>, <a href="/mehsullar/boyunbagilar">lazer yazılı boyunbağılar</a>, <a href="/mehsullar/tesbehler">fərdi təsbehlər</a> və ya <a href="/mehsullar">bütün məhsullar</a>.</p>`;
}

/** Blog siyahısı: hər yazı üçün başlıq (link) + qısa təsvir. posts: [{title, slug, excerpt}] */
export function blogListHtml(posts = [], pathFor = (p) => p) {
  const rows = (posts || [])
    .filter((p) => p && p.slug && p.title)
    .map((p) => `<li><a href="${esc(pathFor(`/blog/${p.slug}`))}">${esc(p.title)}</a>${p.excerpt ? ` — ${esc(p.excerpt)}` : ''}</li>`)
    .join('');
  return rows ? `<ul>${rows}</ul>` : '';
}

/** Mətn simvol sayı (HTML teqləri çıxılmaqla) — "JS olmadan ≥500 simvol" qaydasını yoxlamaq üçün */
export function visibleTextLength(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}
