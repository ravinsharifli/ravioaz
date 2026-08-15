import { useCallback } from 'react';
import { useNavigate, useLocation, NavigateOptions } from 'react-router-dom';
import i18n from './config';

/**
 * Cari path-in dil prefiksini müəyyən edir.
 * "/en/mehsullar/xyz" → "en"
 * "/mehsullar/xyz"    → "az"
 */
export function getLangFromPath(pathname: string): 'az' | 'en' {
  return pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'az';
}

/**
 * Verilmiş yola cari dil prefiksini əlavə edir (əgər İngiliscədirsə).
 * withLangPrefix('/mehsullar', 'en') → '/en/mehsullar'
 * withLangPrefix('/mehsullar', 'az') → '/mehsullar'
 */
export function withLangPrefix(path: string, lang: 'az' | 'en'): string {
  if (lang === 'az') return path;
  // "/" → "/en", "/mehsullar" → "/en/mehsullar"
  return path === '/' ? '/en' : `/en${path}`;
}

/**
 * useNavigate əvəzinə istifadə olunur — dəyişiklik yoxdur, sadəcə
 * hazırkı dilin prefiksini avtomatik əlavə edir. Bütün mövcud
 * navigate('/mehsullar') çağırışları toxunulmadan işləməyə davam edir,
 * yalnız bu hook-u import edib əvəz etmək kifayətdir.
 */
export function useLocalizedNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);

  const localizedNavigate = useCallback(
    (path: string, options?: NavigateOptions) => {
      navigate(withLangPrefix(path, lang), options);
    },
    [navigate, lang]
  );

  return { navigate: localizedNavigate, lang };
}
