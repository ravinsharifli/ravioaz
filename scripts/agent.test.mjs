// scripts/agent.test.mjs — AI agent hazırlığı: Markdown negotiation, həqiqi 404, JS-siz məzmun, llms.txt "nə vaxt istifadə et".
// Şəbəkə yoxdur (fetch saxtalaşdırılıb). `npm test` işlədir.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseAccept, prefersMarkdown, classifyPath, shouldSkip, handleAgentRequest, resetSlugCache,
  STATIC_ROUTES, notFoundMarkdown,
} from '../lib/agentRoutes.mjs';
import { shellHtmlToMarkdown, pageHtmlToMarkdown, mdPathForDir, mdPathForUrlPath } from '../lib/shellMarkdown.mjs';
import { homeShellAz, blogListHtml, blogIntroAz, visibleTextLength } from '../lib/shellContent.mjs';

let pass = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) { console.error(`FAIL  ${name}  ← ${extra}`); process.exitCode = 1; throw new Error(name); }
  pass++; console.log(`PASS  ${name}`);
};
const root = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf-8');

// ── Accept başlığı ────────────────────────────────────────────────
ok('parseAccept: q dəyərləri', parseAccept('text/markdown;q=0.5, text/html').find((x) => x.type === 'text/markdown').q === 0.5);
ok('prefersMarkdown: açıq text/markdown → true', prefersMarkdown('text/markdown'));
ok('prefersMarkdown: brauzer Accept → false', !prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8'));
ok('prefersMarkdown: yalnız wildcard (curl) → false', !prefersMarkdown('*/*'));
ok('prefersMarkdown: başlıq yoxdur → false', !prefersMarkdown(null));
ok('prefersMarkdown: markdown q=0 → false', !prefersMarkdown('text/markdown;q=0, text/html'));
ok('prefersMarkdown: markdown, html;q=0.9 → true', prefersMarkdown('text/markdown, text/html;q=0.9'));
ok('prefersMarkdown: html q=1, markdown q=0.5 → false', !prefersMarkdown('text/html, text/markdown;q=0.5'));

// ── STATIC_ROUTES App.tsx ilə UYĞUN olmalıdır ─────────────────────
{
  const app = read('App.tsx');
  const found = new Set();
  for (const m of app.matchAll(/path=\{`\$\{prefix\}(\/[^`]*)`\}/g)) found.add(m[1]);
  if (/path=\{prefix \|\| '\/'\}/.test(app)) found.add('/');
  const dynamic = [...found].filter((p) => p.includes(':'));
  const stat = [...found].filter((p) => !p.includes(':')).sort();
  ok('STATIC_ROUTES = App.tsx sabit marşrutları', JSON.stringify([...STATIC_ROUTES].sort()) === JSON.stringify(stat), `App: ${stat} | middleware: ${[...STATIC_ROUTES].sort()}`);
  const dynPrefixes = dynamic.map((p) => p.replace(/:.*$/, '')).sort();
  ok('Dinamik marşrut prefiksləri App.tsx ilə uyğundur', JSON.stringify(dynPrefixes) === JSON.stringify(['/blog/', '/kime/', '/mehsullar/']), String(dynPrefixes));
}

// ── Saxta mühit ───────────────────────────────────────────────────
const SHELL = '<!doctype html><html lang="az"><head><title>Ravio</title></head><body><div id="root" data-seo-shell><main><h1>Ravio</h1></main></div></body></html>';
let sanityDown = false; let calls = [];
const mkFetch = (mdFiles = { '/_md/index.md': '# Ravio\n\nSalam\n', '/_md/mehsullar.md': '# Məhsullar\n' }) => async (url, opts = {}) => {
  const u = new URL(url); calls.push(`${u.host}${u.pathname}`);
  if (u.host.includes('sanity.io')) {
    if (sanityDown) throw new Error('şəbəkə xətası');
    return { ok: true, json: async () => ({ result: { product: ['polad-qolbaq'], blog: ['ilk-yazi'], audience: ['kisiler-ucun'], categoryNames: ['Qolbaqlar', 'Dəst Hədiyyələr'] } }) };
  }
  if (!opts.headers || !opts.headers['x-ravio-internal']) throw new Error('daxili sorğu başlığı yoxdur: ' + url);
  if (u.pathname === '/') return { ok: true, headers: new Headers({ 'content-type': 'text/html' }), text: async () => SHELL };
  if (mdFiles[u.pathname]) return { ok: true, headers: new Headers({ 'content-type': 'text/markdown' }), text: async () => mdFiles[u.pathname] };
  return { ok: false, headers: new Headers({ 'content-type': 'text/html' }), text: async () => 'not found' };
};
const req = (path, accept, extra = {}) => new Request(`https://ravio.az${path}`, { method: extra.method || 'GET', headers: { ...(accept ? { accept } : {}), ...(extra.headers || {}) } });
const run = (path, accept, extra) => { resetSlugCache(); return handleAgentRequest(req(path, accept, extra), { fetchFn: mkFetch(extra?.mdFiles) }); };

// ── 404 (#1) ──────────────────────────────────────────────────────
let r = await run('/olmayan-sehife', 'text/html');
ok('404: mövcud olmayan yol → HTTP 404', r && r.status === 404, r && r.status);
ok('404: HTML cavab sayt qabığını daşıyır (React NotFound göstərsin)', (await r.text()).includes('data-seo-shell'));
ok('404: Content-Type text/html, Vary: Accept, noindex', r.headers.get('content-type').startsWith('text/html') && r.headers.get('vary') === 'Accept' && r.headers.get('x-robots-tag') === 'noindex');

r = await run('/some-path-that-does-not-exist', 'text/markdown');
let body = await r.text();
ok('404 + Markdown: status 404', r.status === 404);
ok('404 + Markdown: Content-Type text/markdown', r.headers.get('content-type').startsWith('text/markdown'));
ok('404 + Markdown: Vary: Accept', r.headers.get('vary') === 'Accept');
ok('404 + Markdown: ≥20 simvol izahat və llms.txt/sitemap yönləndirməsi', body.length >= 20 && body.includes('/llms.txt') && body.includes('/sitemap.xml') && body.includes('404'), body);
ok('404 + Markdown: izahat mətni yolu göstərir', body === notFoundMarkdown('/some-path-that-does-not-exist'));

r = await run('/mehsullar/olmayan-mehsul', 'text/html');
ok('404: Sanity-də olmayan məhsul slug-ı → 404', r.status === 404);
r = await run('/blog/yoxdur', 'text/markdown');
ok('404: olmayan blog yazısı (Markdown) → 404', r.status === 404 && r.headers.get('content-type').startsWith('text/markdown'));
r = await run('/mehsullar/a/b', 'text/html');
ok('404: artıq yol (/mehsullar/a/b) → 404', r.status === 404);
r = await run('/kime/yoxdur/', 'text/html');
ok('404: sondakı slash normallaşır, olmayan /kime/ slug → 404', r.status === 404);

// ── Mövcud səhifələr toxunulmaz qalır ──────────────────────────────
for (const path of ['/', '/mehsullar', '/haqqimizda', '/catdirilma', '/qaydalar', '/blog', '/elaqe', '/mehsullar/polad-qolbaq', '/mehsullar/qolbaqlar', '/mehsullar/dest-hediyyeler', '/kime/kisiler-ucun', '/blog/ilk-yazi']) {
  r = await run(path, 'text/html,application/xhtml+xml,*/*;q=0.8');
  ok(`HTML sorğusu davam edir (null): ${path}`, r === null, r && r.status);
}

// ── Sanity əlçatmaz olsa: dinamik yollara TOXUNMA (fail-open), sabit yanlış yol yenə 404 ─
sanityDown = true; resetSlugCache();
r = await handleAgentRequest(req('/mehsullar/polad-qolbaq', 'text/html'), { fetchFn: mkFetch() });
ok('fail-open: Sanity yoxdursa məhsul səhifəsi əvvəlki kimi (null)', r === null);
r = await handleAgentRequest(req('/olmayan-sehife', 'text/html'), { fetchFn: mkFetch() });
ok('Sanity yoxdursa da top-level yanlış yol 404 alır', r && r.status === 404);
sanityDown = false; resetSlugCache();

// ── Markdown negotiation (#3) ──────────────────────────────────────
r = await run('/', 'text/markdown');
body = await r.text();
ok('Markdown: ana səhifə 200', r.status === 200);
ok('Markdown: Content-Type text/markdown', r.headers.get('content-type').startsWith('text/markdown'));
ok('Markdown: Vary: Accept', r.headers.get('vary') === 'Accept');
ok('Markdown: boş olmayan Markdown gövdə', body.startsWith('# Ravio') && body.length > 5, body);
ok('Markdown: canonical Link başlığı', r.headers.get('link').includes('rel="canonical"'));
r = await run('/mehsullar', 'text/markdown, text/html;q=0.8');
ok('Markdown: /mehsullar → _md/mehsullar.md', (await r.text()).startsWith('# Məhsullar'));
r = await run('/', 'text/html');
ok('HTML sorğusu (Accept: text/html) Markdown ALMIR → null', r === null);
r = await run('/', '*/*');
ok('Accept: */* HTML qalır → null', r === null);
r = await run('/mehsullar/polad-qolbaq', 'text/markdown');
body = await r.text();
ok('Markdown: _md faylı hələ yoxdursa (yeni məhsul) ehtiyat Markdown 200', r.status === 200 && body.includes('https://ravio.az/mehsullar/polad-qolbaq'), body);
r = await run('/', 'text/markdown', { method: 'HEAD' });
ok('HEAD: gövdəsiz, başlıqlar eynidir', r.status === 200 && (await r.text()) === '' && r.headers.get('content-type').startsWith('text/markdown'));

// ── Toxunulmamalı sorğular ────────────────────────────────────────
for (const [path, extra] of [['/api/order', {}], ['/assets/index-abc.js', {}], ['/robots.txt', {}], ['/llms.txt', {}], ['/sitemap.xml', {}], ['/sw.js', {}], ['/studio', {}], ['/en/mehsullar', {}], ['/_md/index.md', {}], ['/fonts/inter.woff2', {}], ['/.well-known/x', {}], ['/favicon.ico', {}]]) {
  ok(`toxunulmur: ${path}`, (await run(path, 'text/markdown', extra)) === null);
}
ok('POST toxunulmur', (await run('/olmayan', 'text/html', { method: 'POST' })) === null);
ok('daxili sorğu (sonsuz dövrə qarşı) toxunulmur', (await run('/olmayan', 'text/html', { headers: { 'x-ravio-internal': '1' } })) === null);
ok('shouldSkip: nöqtəli fayl', shouldSkip('/a/b.png') && !shouldSkip('/blog'));
ok('classifyPath: Sanity yoxdursa dinamik yol "unknown"', classifyPath('/mehsullar/x', null) === 'unknown');

// ── middleware.js özü (fail-open + əsas yollar) ────────────────────
{
  const { default: middleware, config } = await import('../middleware.js');
  ok('middleware: matcher təyin olunub', Array.isArray(config.matcher) && config.matcher[0].includes('assets/'));
  const realFetch = globalThis.fetch;
  resetSlugCache();
  globalThis.fetch = mkFetch();
  const m404 = await middleware(req('/yoxdur-bele-sehife', 'text/markdown'));
  ok('middleware: yanlış yol → 404 Markdown', m404.status === 404 && m404.headers.get('content-type').startsWith('text/markdown'));
  const mMd = await middleware(req('/', 'text/markdown'));
  ok('middleware: / + Accept markdown → 200 text/markdown', mMd.status === 200 && mMd.headers.get('content-type').startsWith('text/markdown'));
  const mHtml = await middleware(req('/haqqimizda', 'text/html'));
  ok('middleware: HTML sorğusu davam edir (Vary: Accept əlavə olunur)', mHtml.status === 200 && /accept/i.test(mHtml.headers.get('vary') || ''), mHtml.headers.get('vary'));
  globalThis.fetch = async () => { throw new Error('hər şey çöküb'); };
  resetSlugCache();
  const mFail = await middleware(req('/mehsullar/x', 'text/html'));
  ok('middleware: xəta olarsa səhifə QIRILMIR (fail-open, 5xx yox)', mFail.status < 400, mFail.status);
  globalThis.fetch = realFetch;
}

// ── HTML → Markdown çevirmə (#3 gövdəsi) ───────────────────────────
{
  const html = '<!doctype html><html><head><link rel="canonical" href="https://ravio.az/mehsullar/x" /></head><body><div id="root" data-seo-shell>\n<main style="a:b"><nav><a href="/mehsullar">Məhsullar</a></nav><article><h1>Polad &amp; Qolbaq</h1><img src="https://cdn.sanity.io/a.webp?w=1" alt="Qolbaq — Bakı" /><p>Lazer yazılı.</p><p><strong>Qiymət: 19.9 AZN</strong></p><ul><li><a href="/mehsullar/y">Y</a> — 5 AZN</li></ul></article></main></div></body></html>';
  const md = pageHtmlToMarkdown(html);
  ok('md: H1 və entity', md.startsWith('[Məhsullar](https://ravio.az/mehsullar)') && md.includes('# Polad & Qolbaq'), md);
  ok('md: şəkil, güclü mətn, siyahı, mütləq link', md.includes('![Qolbaq — Bakı](https://cdn.sanity.io/a.webp?w=1)') && md.includes('**Qiymət: 19.9 AZN**') && md.includes('- [Y](https://ravio.az/mehsullar/y) — 5 AZN'), md);
  ok('md: canonical göstərilir, HTML teq qalmır', md.includes('HTML version: https://ravio.az/mehsullar/x') && !/<[a-z/]/i.test(md.replace(/<https?:[^>]+>/g, '')), md);
  ok('md: shell olmayan səhifə → null', pageHtmlToMarkdown('<html><body><div id="root"></div></body></html>') === null);
  ok('md: ardıcıl siyahı elementləri arasında boş sətir yoxdur', shellHtmlToMarkdown('<ul><li>A</li><li>B</li><li>C</li></ul>') === '- A\n- B\n- C', JSON.stringify(shellHtmlToMarkdown('<ul><li>A</li><li>B</li><li>C</li></ul>')));
  ok('md yolları', mdPathForDir('') === '_md/index.md' && mdPathForDir('mehsullar/x') === '_md/mehsullar/x.md' && mdPathForUrlPath('/blog/a') === '_md/blog/a.md' && mdPathForUrlPath('/') === '_md/index.md');
  ok('shellHtmlToMarkdown: <style> atılır', !shellHtmlToMarkdown('<style>.a{}</style><h1>A</h1>').includes('.a{}'));
}

// ── JS olmadan məzmun (#2) ────────────────────────────────────────
{
  const home = homeShellAz({
    categories: [{ slug: 'qolbaqlar', name: 'Qolbaqlar' }, { slug: 'tesbehler', name: 'Təsbehlər' }],
    items: [{ name: 'Polad Qolbaq', path: '/mehsullar/polad-qolbaq', price: 19.9 }],
  });
  ok('ana səhifə: boş data ilə də ≥500 simvol mətn', visibleTextLength(homeShellAz()) >= 500, visibleTextLength(homeShellAz()));
  ok('ana səhifə: tək <h1>', (home.match(/<h1>/g) || []).length === 1);
  ok('ana səhifə: başlıq səviyyələri ardıcıldır (h1 → h2)', !/<h3/.test(home) && /<h2>/.test(home));
  ok('ana səhifə: kateqoriya və məhsul linkləri + qiymət', home.includes('href="/mehsullar/qolbaqlar"') && home.includes('href="/mehsullar/polad-qolbaq"') && home.includes('19.9 AZN'));
  ok('ana səhifə: mövcud 3 əsas kateqoriya linki saxlanıb', ['boyunbagilar', 'qolbaqlar', 'tesbehler'].every((s) => home.includes(`href="/mehsullar/${s}"`)));
  ok('ana səhifə: HTML-i XSS-dən qoruyur', !homeShellAz({ categories: [{ slug: 'x', name: '<script>alert(1)</script>' }] }).includes('<script>'));
  const blog = blogListHtml([{ title: 'İlk yazı', slug: 'ilk-yazi', excerpt: 'Qısa təsvir' }, { title: '', slug: 'x' }, null]);
  ok('blog siyahısı: başlıq linki + təsvir, boş yazılar atılır', blog.includes('<a href="/blog/ilk-yazi">İlk yazı</a> — Qısa təsvir') && !blog.includes('/blog/x'), blog);
  ok('blog siyahısı: yazı yoxdursa boş', blogListHtml([]) === '');
  {
    const zeroPosts = `<main><h1>Blog</h1><p>Ravio blogunda hədiyyə ideyaları, fərdiləşdirmə məsləhətləri və yeniliklər.</p>${blogIntroAz()}${blogListHtml([])}</main>`;
    ok('blog siyahısı: heç yazı olmasa da ≥500 simvol mətn', visibleTextLength(zeroPosts) >= 500, visibleTextLength(zeroPosts));
    ok('blog siyahısı girişi: linklər real marşrutlara gedir', ['/mehsullar/qolbaqlar', '/mehsullar/boyunbagilar', '/mehsullar/tesbehler', '/mehsullar'].every((h) => blogIntroAz().includes(`href="${h}"`)));
  }
  const blogPage = `<main><h1>Blog</h1><p>Ravio blogunda hədiyyə ideyaları, fərdiləşdirmə məsləhətləri və yeniliklər.</p>${blog}</main>`;
  ok('blog siyahısı səhifəsi başlıq+təsvir+yazılar (əvvəl yalnız 114 simvol idi)', visibleTextLength(blogPage) > 100 && blogPage.includes('İlk yazı'));
  const i18n = JSON.parse(read('i18n/locales/az.json'));
  const at = (p) => p.split('.').reduce((o, k) => o?.[k], i18n);
  const aboutKeys = ['about.heroBody', ...['p1', 'p2', 'p3'].flatMap((p) => [`about.pillars.${p}.title`, `about.pillars.${p}.body`])];
  const delKeys = ['delivery.intro', ...['courier', 'metro', 'regions'].flatMap((o) => [`delivery.options.${o}.title`, `delivery.options.${o}.desc`]), ...['f1', 'f2', 'f3', 'f4', 'f5'].flatMap((f) => [`delivery.faqs.${f}.q`, `delivery.faqs.${f}.a`])];
  ok('inject-seo-dakı i18n açarları mövcuddur (Haqqımızda)', aboutKeys.every((k) => typeof at(k) === 'string'));
  ok('inject-seo-dakı i18n açarları mövcuddur (Çatdırılma)', delKeys.every((k) => typeof at(k) === 'string'));
  ok('Haqqımızda və Çatdırılma ≥500 simvol mətn', aboutKeys.map(at).join(' ').length >= 500 && delKeys.map(at).join(' ').length >= 500);
  const inject = read('inject-seo.mjs');
  ok('inject-seo: Haqqımızda/Çatdırılma açarları və blog siyahısı qoşulub', inject.includes("'about.pillars.${p}.body'") === false && inject.includes('about.heroBody') && inject.includes('delivery.faqs.${f}.a') && inject.includes('blogListHtml(blogPosts') && inject.includes('blogIntroAz()'));
  ok('inject-seo: Markdown güzgüləri və ≥500 simvol yoxlaması build-in yekun yoxlamasındadır', inject.includes('dist/_md/index.md') && inject.includes('visibleTextLength'));
}

// ── llms.txt "nə vaxt istifadə et" (#5) ───────────────────────────
{
  const llms = read('public/llms.txt');
  const sec = llms.split(/^## /m).find((s) => /^When to use/i.test(s)) || '';
  ok('llms.txt: "When to use" bölməsi var', sec.length > 0);
  ok('llms.txt: konkret işlər (fərdi lazer hədiyyə, toplu sifariş, çatdırılma)', /laser-engraved gift/i.test(sec) && /Bulk or group orders/i.test(sec) && /Delivery facts/i.test(sec));
  ok('llms.txt: nə vaxt tövsiyə ETMƏMƏLİ (gümüş, fiziki mağaza)', /Do not recommend/i.test(sec) && /Silver/.test(sec) && /physical store/i.test(sec));
  ok('llms.txt: agent necə çağırmalıdır (Accept: text/markdown, llms-full.txt, sitemap)', sec.includes('Accept: text/markdown') && sec.includes('/llms-full.txt') && sec.includes('/sitemap.xml'));
  ok('llms.txt: İngilis versiya (/en) linki qayıtmayıb', !llms.includes('https://ravio.az/en'));
}

// ── Konfiqurasiya ─────────────────────────────────────────────────
{
  const vercel = JSON.parse(read('vercel.json'));
  const md = vercel.headers.find((h) => h.source === '/_md/(.*)');
  ok('vercel.json: /_md/ faylları text/markdown + noindex', md && md.headers.some((h) => h.key === 'Content-Type' && h.value.startsWith('text/markdown')) && md.headers.some((h) => h.key === 'X-Robots-Tag' && h.value === 'noindex'));
  ok('vercel.json: /en yönləndirmələri toxunulmazdır', vercel.redirects.length === 2);
  const robots = read('public/robots.txt');
  ok('robots.txt: /_md/ Google üçün bağlıdır (hər iki blokda)', (robots.match(/Disallow: \/_md\//g) || []).length === 2);
  const pkg = JSON.parse(read('package.json'));
  ok('package.json: @vercel/functions asılılığı var', !!pkg.dependencies['@vercel/functions']);
}

console.log(`\n✅ agent.test.mjs: ${pass} yoxlama keçdi`);
