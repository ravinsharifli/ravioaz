// ═══════════════════════════════════════════════════════════════
//  RAVIO — SANITY CLİENT
//  Bu faylı sanityclient.ts ilə əvəzlə
//
//  client      → yalnız oxumaq (məhsullar, tənzimləmələr)
//  writeClient → sifariş yazmaq (CartDrawer istifadə edir)
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@sanity/client';

// ── OXUMA CLİENTİ (dəyişilməyib) ─────────────────────────────
export const client = createClient({
  projectId: 'w7scii42',
  dataset:   'production',
  useCdn:    true,        // CDN vasitəsilə sürətli
  apiVersion: '2026-02-09',
});

// ── YAZMA CLİENTİ (sifarişlər üçün) ──────────────────────────
//  VITE_SANITY_WRITE_TOKEN Vercel environment variables-a əlavə et.
//  Sanity → manage.sanity.io → API → Tokens → Add API token
//  Role: "Editor" seç, kopyala, Vercel-ə yapışdır.
export const writeClient = createClient({
  projectId: 'w7scii42',
  dataset:   'production',
  useCdn:    false,       // Yazma üçün CDN-siz (birbaşa API)
  apiVersion: '2026-02-09',
  token: import.meta.env.VITE_SANITY_WRITE_TOKEN,
});