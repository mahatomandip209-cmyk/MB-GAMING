import { Product } from './types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile UC',
    provider: 'Tencent Games',
    category: 'top-up',
    imagePlaceholderColor: 'bg-amber-600',
    description: 'Instant PUBG Mobile Unknown Cash (UC) top-up via Player ID.',
    minAmount: 60,
    maxAmount: 8100,
    popularAmount: 600,
    inputLabel: 'Player ID (UID)',
    inputPlaceholder: 'e.g. 5123456789',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    popular: true,
    packages: [
      { name: '60 UC', price: 130 },
      { name: '325 UC', price: 650 },
      { name: '660 UC', price: 1280 },
      { name: '1800 UC', price: 3400 },
      { name: '3850 UC', price: 6900 }
    ],
    requirements: [
      { id: 'uid', name: 'Player ID (UID)', type: 'text' },
      { id: 'ign', name: 'In-Game Name', type: 'text' }
    ]
  },
  {
    id: 'free-fire',
    name: 'Free Fire Diamonds',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'bg-orange-600',
    description: 'Instant Garena Free Fire Diamonds directly sent to Player UID.',
    minAmount: 100,
    maxAmount: 5600,
    popularAmount: 530,
    inputLabel: 'Player UID',
    inputPlaceholder: 'e.g. 1029384756',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80',
    popular: true,
    packages: [
      { name: '115 Diamonds', price: 110 },
      { name: '240 Diamonds', price: 220 },
      { name: '610 Diamonds', price: 540 },
      { name: '1240 Diamonds', price: 1080 },
      { name: '2530 Diamonds', price: 2150 }
    ],
    requirements: [
      { id: 'uid', name: 'Player UID', type: 'text' }
    ]
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    provider: 'Moonton',
    category: 'top-up',
    imagePlaceholderColor: 'bg-blue-600',
    description: 'Fast MLBB Diamond recharge for Mobile Legends Bang Bang.',
    minAmount: 86,
    maxAmount: 6000,
    popularAmount: 706,
    inputLabel: 'User ID & Zone ID',
    inputPlaceholder: 'e.g. 12345678 (1234)',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    popular: true,
    packages: [
      { name: '86 Diamonds', price: 160 },
      { name: '172 Diamonds', price: 310 },
      { name: '257 Diamonds', price: 460 },
      { name: '706 Diamonds', price: 1250 }
    ],
    requirements: [
      { id: 'uid', name: 'User ID', type: 'text' },
      { id: 'zone', name: 'Zone ID', type: 'text' }
    ]
  },
  {
    id: 'unipin-voucher',
    name: 'UniPin Voucher',
    provider: 'UniPin',
    category: 'voucher',
    imagePlaceholderColor: 'bg-purple-600',
    description: 'Global UniPin Voucher code delivery for games & digital content.',
    minAmount: 100,
    maxAmount: 5000,
    popularAmount: 500,
    inputLabel: 'Target Account / Email',
    inputPlaceholder: 'Enter your email or phone',
    iconName: 'shopping',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
    popular: true,
    packages: [
      { name: '500 BDT Voucher', price: 720 },
      { name: '1000 BDT Voucher', price: 1420 },
      { name: '2000 BDT Voucher', price: 2800 }
    ],
    requirements: [
      { id: 'email', name: 'Email Address', type: 'text' }
    ]
  },
  {
    id: 'netflix-subscription',
    name: 'Netflix Premium',
    provider: 'Netflix',
    category: 'subscription',
    imagePlaceholderColor: 'bg-red-600',
    description: 'Netflix 1-Month 4K UHD Profile or Full Account Subscription.',
    minAmount: 350,
    maxAmount: 1500,
    popularAmount: 350,
    inputLabel: 'Profile Name / Email',
    inputPlaceholder: 'Enter your account email',
    iconName: 'tv',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80',
    popular: false,
    packages: [
      { name: '1 Screen (1 Month)', price: 350 },
      { name: 'Full Account (1 Month)', price: 1350 }
    ],
    requirements: [
      { id: 'email', name: 'Email / Phone', type: 'text' }
    ]
  },
  {
    id: 'custom-graphics',
    name: 'Custom Game Banner Design',
    provider: 'BNY Studio',
    category: 'design',
    imagePlaceholderColor: 'bg-emerald-600',
    description: 'Professional esport team graphics, YouTube banners & thumbnail design.',
    minAmount: 500,
    maxAmount: 3000,
    popularAmount: 800,
    inputLabel: 'WhatsApp / Discord Tag',
    inputPlaceholder: 'e.g. +97798XXXXXX',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=80',
    popular: false,
    packages: [
      { name: 'Esport Logo', price: 500 },
      { name: 'YouTube Channel Banner', price: 800 },
      { name: 'Full Branding Pack', price: 2000 }
    ],
    requirements: [
      { id: 'contact', name: 'Contact Info', type: 'text' },
      { id: 'notes', name: 'Design Requirements', type: 'text' }
    ]
  }
];

export interface PromoBanner {
  id: string;
  title: string;
  subTitle?: string;
  tagline: string;
  badge: string;
  bgColor: string;
  textColor: string;
  buttonText: string;
  iconType: 'sparkles' | 'credit' | 'gift';
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'promo-1',
    title: 'WEEKEND SPECIAL',
    subTitle: 'WEEKENO SPECIAL',
    tagline: 'Grab premium diamond top-ups, game keys and subscription vouchers at the lowest market rates!',
    badge: 'Trending Now',
    bgColor: 'from-[#0b0c10] via-[#1f2833] to-[#0b0c10]',
    textColor: 'text-white',
    buttonText: 'Order Top-up',
    iconType: 'sparkles'
  },
  {
    id: 'promo-2',
    title: 'FESTIVAL RECHARGE BOOST',
    subTitle: 'BONUS TOP-UP ACTIVE',
    tagline: 'Enjoy absolute zero service fees and 10% bonus Diamonds on all Garena & PUBG orders!',
    badge: 'Flash Promotion',
    bgColor: 'from-[#121214] via-[#1a2e3b] to-[#121214]',
    textColor: 'text-white',
    buttonText: 'Recharge Now',
    iconType: 'gift'
  }
];
