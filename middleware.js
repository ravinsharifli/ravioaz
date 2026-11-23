// middleware.js — Vercel Routing Middleware (statik fayllardan ƏVVƏL işləyir).
// 1) Mövcud olmayan ünvana həqiqi 404; 2) `Accept: text/markdown` → Markdown cavab.
// Bütün məntiq lib/agentRoutes.mjs-dədir (test olunur). Burada yalnız XƏTA OLARSA səhifəyə toxunmama qaydası var.
import { next } from '@vercel/functions';
import { handleAgentRequest } from './lib/agentRoutes.mjs';

export const config = {
  // Asset-lər, fayllar (nöqtəli yollar), /api, şriftlər və /_md middleware-dən keçmir
  matcher: ['/((?!api/|assets/|fonts/|_md/|_vercel/|\\.well-known/|.*\\..*).*)'],
};

export default async function middleware(request) {
  try {
    const response = await handleAgentRequest(request);
    if (response) return response;
  } catch {
    // Fail-open: middleware-də hər hansı xəta saytı QIRMASIN — sorğu əvvəlki kimi davam edir
  }
  // HTML cavab Accept-ə görə dəyişə bilər (Markdown versiya) — keş düzgün ayrılsın
  return next({ headers: { Vary: 'Accept' } });
}
