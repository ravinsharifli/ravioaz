import { Navigate, useLocation } from 'react-router-dom';

/**
 * İngilis versiya dayandırılıb (lib/features.mjs → ENGLISH_ENABLED = false).
 *
 * Əsas, Google üçün daimi (308) yönləndirmə vercel.json-dadır. Bu komponent ikinci təhlükəsizlik toru:
 * köhnə keşlənmiş səhifə / service worker və ya lokal dev serverdə /en açılsa, istifadəçi yenə də
 * Azərbaycanca ekvivalentə düşür:  /en → /   ·   /en/mehsullar/xyz → /mehsullar/xyz
 */
export default function EnglishPausedRedirect() {
  const { pathname, search, hash } = useLocation();
  const azPath = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return <Navigate to={`${azPath}${search}${hash}`} replace />;
}
