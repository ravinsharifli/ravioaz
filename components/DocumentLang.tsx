import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../constants/seo';
import { ENGLISH_ENABLED } from '../lib/features.mjs';
import { getLangFromPath, withLangPrefix } from '../i18n/useLocalizedNav';

export default function DocumentLang() {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  // İngilis versiya dayandırılanda /en/... yalnız yönləndirmə gedənə qədər qısa müddətə görünə bilər —
  // onda da hreflang Azərbaycanca ünvanı göstərsin.
  const stripEn = lang === 'en' || !ENGLISH_ENABLED;
  const azPath = stripEn ? pathname.replace(/^\/en(?=\/|$)/, '') || '/' : pathname;
  const pathAz = azPath.startsWith('/') ? azPath : `/${azPath}`;
  const azUrl = `${SITE_URL}${pathAz === '/' ? '/' : pathAz}`;
  const enUrl = `${SITE_URL}${withLangPrefix(pathAz === '/' ? '/' : pathAz, 'en')}`;
  // Blog yazıları sitemap-də yalnız AZ-dir — EN hreflang vermə
  const isBlogPost = /^\/blog\/.+/.test(pathAz);

  // EN alternativi yalnız İngilis versiya açıq olanda (lib/features.mjs); dayandırılıbsa yalnız az + x-default
  return (
    <Helmet>
      <html lang={lang} />
      {!isBlogPost && <link rel="alternate" hrefLang="az" href={azUrl} />}
      {!isBlogPost && ENGLISH_ENABLED && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {!isBlogPost && <link rel="alternate" hrefLang="x-default" href={azUrl} />}
    </Helmet>
  );
}
