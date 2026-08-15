import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import az from './locales/az.json';
import en from './locales/en.json';

// ── Dil aşkarlama ─────────────────────────────────────────────
// Sayt strukturu: ravio.az/...  (default, Azərbaycanca)
//                 ravio.az/en/... (İngiliscə)
// Dil URL-dəki /en prefiksinə görə təyin olunur (App.tsx-də LanguageRouter
// bunu edir). Bura ilkin dəyər üçün sadə bir təxmin qoyuruq —
// LanguageRouter mount olanda həmişə düzgün dili məcburi təyin edir.
function detectInitialLang(): 'az' | 'en' {
  if (typeof window === 'undefined') return 'az';
  return window.location.pathname.startsWith('/en') ? 'en' : 'az';
}

i18n.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
  },
  lng: detectInitialLang(),
  fallbackLng: 'az',
  interpolation: {
    escapeValue: false, // React onsuz da XSS-dən qoruyur
  },
  returnEmptyString: false,
});

export default i18n;
