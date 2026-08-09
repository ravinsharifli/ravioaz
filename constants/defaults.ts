import { MetroSchedule } from '../types';
import type { HeroSlide } from '../components/home/heroTypes';

// Lazer yazı forması seçimləri (ProductPage-də canlı önizləmə, CartDrawer-də göstərim
// üçün). Hər ikisi Sanity-yə YOX, birbaşa saytın öz self-hosted fontlarına işarə edir
// (fonts.google.com-dan yox — "ə" hərfi bir çox dekorativ fontda dəstəklənmir, ona görə
// yalnız yoxlanılıb Azərbaycan hərflərini 100% dəstəkləyən 2 font seçilib və
// /public/fonts altında subset olunaraq saxlanılıb, Inter ilə eyni üsulla).
export interface FontStyleOption {
  id: 'script' | 'classic' | 'elegant';
  label: string;
  family: string;
  italic?: boolean;
}

export const FONT_STYLES: FontStyleOption[] = [
  { id: 'script',  label: 'Zərif əlyazma', family: `'Ravio Script', cursive` },
  { id: 'classic', label: 'Klassik',       family: `'Times New Roman', Times, 'Noto Serif', serif`, italic: true },
  { id: 'elegant', label: 'Lüks zərif',    family: `'Ravio Elegant', 'Playfair Display', serif`, italic: true },
];

// Müştəri 2 və daha çox ədəd sifariş etdikdə hər ədəddən avtomatik endirim
// olunan məbləğ (₼) — standart/ehtiyat dəyər. Əsl dəyər Sanity → Sayt
// Tənzimləmələri → "2+ ədəddə endirim (₼)" sahəsindən oxunur; həmin sahə
// boşdursa bu ehtiyat rəqəm işə düşür.
export const BULK_DISCOUNT_PER_UNIT = 1;

// Rəng adı → hex kod xəritəsi. Sanity-də artıq əl ilə hex seçilmir —
// yalnız siyahıdan rəng adı seçilir, dəqiq həmin ada uyğun rəng buradan
// avtomatik götürülür. Yeni rəng adı əlavə etsən, bura da bir sətir əlavə et.
export const COLOR_HEX_MAP: Record<string, string> = {
  'Qara': '#000000',
  'Ağ': '#ffffff',
  'Gümüşü': '#c0c0c0',
  'Qızılı': '#ffd700',
  'Qırmızı': '#b22222',
  'Mavi': '#1e3a8a',
  'Sarı': '#ffd400',
  'Çəhrayı': '#ffc0cb',
  'Bənövşəyi': '#6b21a8',
  'Yaşıl': '#16a34a',
  'Göy (Milyoner)': '#000080',
  'Qara - Qızılı': '#000000',
  'Ağ - Qızılı': '#ffd400',
  'Ağ - Qara': '#ffffff',
  'Qızılı - Qəhvəyi': '#ffd700',
};

// Siyahıda olmayan / köhnə sərbəst-mətn rəng adları üçün ehtiyat rəng.
export const DEFAULT_COLOR_HEX = '#D9D4CC';

export function getColorHex(colorName?: string): string {
  if (!colorName) return DEFAULT_COLOR_HEX;
  return COLOR_HEX_MAP[colorName.trim()] || DEFAULT_COLOR_HEX;
}

export const DEFAULT_METRO: MetroSchedule = {
  stations: [
    {
      name: '28 May',
      isActive: true,
      daySchedules: [
        { day: 'Çərşənbə', allDayOpen: false, timeSlots: ['14:00', '14:15', '14:30', '15:00', '15:30'] },
        { day: 'Cümə', allDayOpen: false, timeSlots: ['14:00', '14:15', '15:00', '16:00', '17:00'] },
      ],
    },
    {
      name: 'Nərimanov',
      isActive: true,
      daySchedules: [
        { day: 'Çərşənbə axşamı', allDayOpen: false, timeSlots: ['13:00', '13:15', '13:30', '14:00'] },
        { day: 'Şənbə', allDayOpen: true, timeSlots: [] },
      ],
    },
  ],
};

export const DEFAULT_BOXES = [
  { id: 'simple', name: 'Sadə qutu', price: 0, desc: 'Standart qablaşdırma', isActive: true, imageUrl: null },
  { id: 'premium', name: 'Orta qutu', price: 10, desc: 'Lent + köpük yastıq', isActive: true, imageUrl: null },
  { id: 'gift', name: 'Premium qutu', price: 17, desc: 'Bağlama + qeyd kartı', isActive: true, imageUrl: null },
];

export const PROMO_SLIDES: HeroSlide[] = [
  {
    type: 'promo',
    label: '🐾 Hər alışda bir heyvan doyur',
    title: 'Satışın 5%-i küçə heyvanlarına gedir.',
    subtitle: 'Hər sifarişlə bir küçə heyvanı yemlənir, isti yuva, müalicə görür. Sənin hədiyyən — onların qayğısıdır.',
    ctaText: 'Kataloqa bax →',
    bg: 'linear-gradient(135deg, #0f2a30 0%, #1a6678 100%)',
  },
  {
    type: 'promo',
    label: '🚀 Ödənişsiz çatdırılma',
    title: '1–3 iş günündə qapınıza gəlir.',
    subtitle: 'Bütün Azərbaycana çatdırılma tamamilə ödənişsizdir',
    ctaText: 'Sifarişə başla →',
    bg: 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)',
  },
  {
    type: 'promo',
    label: '✨ Toplu endirim',
    title: '10+ ədəddə xüsusi qiymət.',
    subtitle: 'Məzun lentləri, korporativ hədiyyə — xüsusi endirimlə.',
    ctaText: 'Toplu sifariş →',
    bg: 'linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%)',
  },
];
