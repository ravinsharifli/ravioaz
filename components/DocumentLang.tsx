import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL } from '../constants/seo';
import { getLangFromPath, withLangPrefix } from '../i18n/useLocalizedNav';

export default function DocumentLang() {
  const { pathname } = useLocation();
  const lang = getLangFromPath(pathname);
  const azPath = lang === 'en' ? pathname.replace(/^\/en/, '') || '/' : pathname;
  const pathAz = azPath.startsWith('/') ? azPath : `/${azPath}`;
  const azUrl = `${SITE_URL}${pathAz === '/' ? '/' : pathAz}`;
  const enUrl = `${SITE_URL}${withLangPrefix(pathAz === '/' ? '/' : pathAz, 'en')}`;
  // Blog yazıları sitemap-də yalnız AZ-dir — EN hreflang vermə
  const isBlogPost = /^\/blog\/.+/.test(pathAz);

  return (
    <Helmet>
      <html lang={lang} />
      {!isBlogPost && <link rel="alternate" hrefLang="az" href={azUrl} />}
      {!isBlogPost && <link rel="alternate" hrefLang="en" href={enUrl} />}
      {!isBlogPost && <link rel="alternate" hrefLang="x-default" href={azUrl} />}
    </Helmet>
  );
}