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
  /** Açıq fonda mətn üçün AA-uyğun narıncı (kontrast 5.4:1). C.primary-ni açıq fonda mətn kimi işlətmə. */
  primaryText: 'var(--clr-primary-text)',
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
  /** Solğun mətn — #9E9E9E */
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

// ── Sifariş formu / səbət paleti ──────────────────────────────────────────────
// ProductPage.tsx və CartDrawer.tsx əvvəl bu rəngləri HƏR BİRİ öz faylında təkrar yazırdı
// (üst-üstə düşən açarlar eyni dəyərdə idi). İndi ortaq mənbədir. Bu palet yuxarıdakı C-dən
// bilərəkdən FƏRQLİDİR (məs. border '#E5E1DB', sabit yaşıl/mavi/qırmızı) — vizual dəyişməsin deyə.
export const FORM_COLORS = {
  bg:       'var(--clr-bg)',
  white:    'var(--clr-white)',
  black:    'var(--clr-black)',
  gray:     'var(--clr-text-sec)',
  grayLt:   'var(--clr-text-muted)',
  border:   '#E5E1DB',
  orange:   'var(--clr-primary)',
  orangeBg: '#FFF3EC',
  orangeBd: '#FFD4B8',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  blue:     '#2563EB',
  blueBg:   '#EFF6FF',
  blueBd:   '#BFDBFE',
  red:      '#DC2626',
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
