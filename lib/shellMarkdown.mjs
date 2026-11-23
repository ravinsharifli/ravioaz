// lib/shellMarkdown.mjs — prerender olunmuş HTML-in "robot məzmununu" (data-seo-shell) Markdown-a çevirən SAF funksiyalar.
// Niyə: AI agentlər `Accept: text/markdown` ilə səhifə istəyəndə middleware.js bu faylların nəticəsini (dist/_md/*.md) qaytarır.
// Şəbəkə yoxdur, test olunur (scripts/agent.test.mjs). Build zamanı inject-seo.mjs çağırır.

const SITE = 'https://ravio.az';

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function absolute(href, site) {
  if (!href) return href;
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  if (href.startsWith('//')) return `https:${href}`;
  if (href.startsWith('/')) return `${site}${href}`;
  return href;
}

/** HTML-dən canonical URL-i çıxarır (yoxdursa null) */
export function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
  return m ? decodeEntities(m[1]) : null;
}

/** `<div id="root" data-seo-shell>…<main>…</main>` içini çıxarır; yoxdursa null */
export function extractShellMain(html) {
  const m = html.match(/<div id="root" data-seo-shell>\s*<main[^>]*>([\s\S]*?)<\/main>/);
  return m ? m[1] : null;
}

/** Shell HTML parçasını (main-in içi) Markdown-a çevirir */
export function shellHtmlToMarkdown(inner, { site = SITE } = {}) {
  let s = inner
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  s = s.replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, lvl, t) => `\n\n${'#'.repeat(Number(lvl))} ${t.trim()}\n\n`);
  s = s.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = (tag.match(/\ssrc="([^"]*)"/i) || [])[1];
    const alt = (tag.match(/\salt="([^"]*)"/i) || [])[1] || '';
    return src ? `\n\n![${alt}](${absolute(decodeEntities(src), site)})\n\n` : '';
  });
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
    const text = t.replace(/<[^>]+>/g, '').trim();
    return text ? `[${text}](${absolute(decodeEntities(href), site)})` : '';
  });
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<li[^>]*>/gi, '\n- ').replace(/<\/li>/gi, '');
  s = s.replace(/<\/(p|ul|ol|nav|article|section|div|main)>/gi, '\n\n').replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);

  return s
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(- [^\n]*)\n\n(?=- )/gm, '$1\n') // ardıcıl siyahı elementləri arasında boş sətir olmasın
    .replace(/^(- [^\n]*)\n\n(?=- )/gm, '$1\n')
    .trim();
}

/** Tam səhifə HTML-indən Markdown sənədi düzəldir; shell yoxdursa null */
export function pageHtmlToMarkdown(html, { site = SITE } = {}) {
  const inner = extractShellMain(html);
  if (!inner) return null;
  const body = shellHtmlToMarkdown(inner, { site });
  if (!body) return null;
  const canonical = extractCanonical(html);
  const footer = [
    '---',
    canonical ? `HTML version: ${canonical}` : null,
    `Agent guide and product catalog: ${site}/llms.txt · ${site}/llms-full.txt`,
  ].filter(Boolean).join('\n');
  return `${body}\n\n${footer}\n`;
}

/** dist/<yol>/index.html → dist/_md/<yol>.md (ana səhifə: _md/index.md). `relDir` dist-ə nisbətən qovluqdur ('' = kök). */
export function mdPathForDir(relDir) {
  const clean = String(relDir || '').replace(/^\/+|\/+$/g, '');
  return clean ? `_md/${clean}.md` : '_md/index.md';
}

/** URL yolu → dist/_md içindəki nisbi fayl yolu ('/' → '_md/index.md', '/blog/x' → '_md/blog/x.md') */
export function mdPathForUrlPath(pathname) {
  return mdPathForDir(pathname);
}
