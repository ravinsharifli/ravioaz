
import { Product } from './types';

export const COLORS = {
  primary: '#FF8C00', // Deep Orange
  secondary: '#1A1A1A', // Off-black
  accent: '#F97316', // Lighter Orange
  white: '#FFFFFF',
  gray: '#F3F4F6'
};

const placeholder = (text: string) => `https://placehold.co/800x1000/1a1a1a/ff8c00?text=${encodeURIComponent(text)}`;

export const PREMIUM_PRODUCTS: Product[] = [
  {
    id: 'premium-1',
    name: 'Qızıl Təsbeh',
    description: 'Əl işi, 24 ayar qızıl örtüklü xüsusi dizayn təsbeh.',
    price: 700.00,
    images: [placeholder('Qizil+Tesbeh'), placeholder('Tesbeh+2')],
    category: 'Aksesuarlar',
    rating: 5.0
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Simsiz Qulaqlıq Pro',
    description: 'Yüksək səs keyfiyyəti və gürültü ləğv etmə.',
    price: 129.99,
    images: [placeholder('Qulaqliq+Pro')],
    category: 'Elektronika',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Dəst Hədiyyə Paketi',
    description: 'Xüsusi günlər üçün hazırlanmış zərif dəst.',
    price: 85.00,
    images: [placeholder('Hediyye+Desti')],
    category: 'Dəst hədiyyələr',
    rating: 4.5
  },
  {
    id: '3',
    name: 'Premium Qəhvə Dəsti',
    description: 'Ən yaxşı dənələrdən hazırlanmış qəhvə və fincan dəsti.',
    price: 45.00,
    images: [placeholder('Qehve+Desti')],
    category: 'Dəst hədiyyələr',
    rating: 4.9
  },
  {
    id: '4',
    name: 'Sizə Özəl Hoodie',
    description: 'İstədiyiniz dizayn və ya yazı ilə hazırlanmış hoodie.',
    price: 45.00,
    images: [placeholder('Custom+Hoodie')],
    category: 'Geyim',
    rating: 4.7
  },
  {
    id: '5',
    name: 'Sürpriz Hədiyyə Qutusu',
    description: 'İçərisi sevgi və xırda detallarla dolu özəl qutu.',
    price: 65.00,
    images: [placeholder('Surpriz+Qutu')],
    category: 'Hədiyyə qutuları',
    rating: 4.8
  },
  {
    id: '6',
    name: 'Dəri Pulqabı',
    description: 'Həqiqi dəridən əl işi, klassik dizayn.',
    price: 40.00,
    images: [placeholder('Deri+Pulqabi')],
    category: 'Aksesuarlar',
    rating: 4.6
  },
  {
    id: '7',
    name: 'Premium Foto Çərçivə',
    description: 'Xatirələrinizi qorumaq üçün lüks taxta çərçivə.',
    price: 25.00,
    images: [placeholder('Foto+Cercive')],
    category: 'Foto çərçivə',
    rating: 4.9
  },
  {
    id: '8',
    name: 'Polaroid Stilində Çap',
    description: '10 ədəd fotoşəkilin polaroid stilində keyfiyyətli çapı.',
    price: 15.00,
    images: [placeholder('Polaroid+Cap')],
    category: 'Çap xidmətləri',
    rating: 5.0
  },
  {
    id: '9',
    name: 'Lazer Yazılı Qələm',
    description: 'İstədiyiniz adın lazerlə yazıldığı premium qələm.',
    price: 20.00,
    images: [placeholder('Lazer+Qelem')],
    category: 'Özəl hədiyyələr',
    rating: 4.8
  }
];
