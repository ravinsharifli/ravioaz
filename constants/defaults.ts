import { MetroSchedule } from '../types';
import type { HeroSlide } from '../components/home/heroTypes';

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
