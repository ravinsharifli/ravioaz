/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                      RAVIO DESIGN TOKENS  v1.0                         ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  Bu fayl saytın bütün rəng, font və stil dəyərlərini TƏK BİR YERDƏ    ║
 * ║  saxlayır.                                                              ║
 * ║                                                                          ║
 * ║  RƏNG DƏYİŞDİRMƏK İSTƏYİRSİNİZSƏ:                                     ║
 * ║  → index.html faylındakı :root { } blokunun içini dəyişin              ║
 * ║  → Bu faylı və ya komponentləri dəyişmək LAZIM DEYİL                   ║
 * ║                                                                          ║
 * ║  NECƏ İŞLƏYİR:                                                          ║
 * ║  1. index.html   :root { --clr-primary: #FF6A00; }                     ║
 * ║  2. tokens.ts    C.primary = 'var(--clr-primary)'                      ║
 * ║  3. Component    style={{ color: C.primary }}                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

// ── Rənglər (Colors) ──────────────────────────────────────────────────────────
export const C = {
  /** Əsas narıncı — #FF6A00 */
  primary:     'var(--clr-primary)',
  /** Hover üçün tünd narıncı — #E55A00 */
  primaryDark: 'var(--clr-primary-dark)',
  /** Demək olar qara — #111111 */
  black:       'var(--clr-black)',
  /** Ağ — #FFFFFF */
  white:       'var(--clr-white)',
  /** İsti bej arxa fon — #F5F2EC */
  bg:          'var(--clr-bg)',
  /** Açıq kənar xətti — #EDEBE7 */
  border:      'var(--clr-border)',
  /** Orta kənar xətti — #D5D0C8 */
  borderMid:   'var(--clr-border-mid)',
  /** İkinci dərəcəli mətn — #666666 */
  textSec:     'var(--clr-text-sec)',
  /** Solğun mətn — #AAAAAA */
  textMuted:   'var(--clr-text-muted)',
  /** Tünd arxa fon (footer/banner) — #111111 */
  dark:        'var(--clr-dark)',
  /** Tünd kart — #1A1A1A */
  darkCard:    'var(--clr-dark-card)',
  /** Uğur / stokda var — #0A7A2F */
  success:     'var(--clr-success)',
  /** Xəta / stokda yoxdur — #B00020 */
  error:       'var(--clr-error)',
} as const;

// ── Fontlar (Typography) ──────────────────────────────────────────────────────
export const F = {
  /** Əsas font ailəsi — 'Inter', sans-serif */
  sans: "var(--font-sans)",
} as const;

// ── Kənar Yuvarlama (Border Radius) ──────────────────────────────────────────
export const R = {
  /** 8px */
  sm:   'var(--r-sm)',
  /** 10px */
  md:   'var(--r-md)',
  /** 12px */
  lg:   'var(--r-lg)',
  /** 16px */
  xl:   'var(--r-xl)',
  /** Dairəvi — 9999px */
  full: '9999px',
} as const;

// ── CSS Dəyişənləri Siyahısı (index.html-ə köçürmək üçün hazır) ──────────────
// Bu bloku index.html → <head> → <style> içinə köçürün:
//
//  :root {
//    --clr-primary:      #FF6A00;
//    --clr-primary-dark: #E55A00;
//    --clr-black:        #111111;
//    --clr-white:        #FFFFFF;
//    --clr-bg:           #F5F2EC;
//    --clr-border:       #EDEBE7;
//    --clr-border-mid:   #D5D0C8;
//    --clr-text-sec:     #666666;
//    --clr-text-muted:   #AAAAAA;
//    --clr-dark:         #111111;
//    --clr-dark-card:    #1A1A1A;
//    --clr-success:      #0A7A2F;
//    --clr-error:        #B00020;
//    --font-sans:        'Inter', sans-serif;
//    --r-sm:             8px;
//    --r-md:             10px;
//    --r-lg:             12px;
//    --r-xl:             16px;
//  }
