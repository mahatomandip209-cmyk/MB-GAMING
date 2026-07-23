import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-ff',
    name: 'Free Fire Diamonds',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'bg-gradient-to-br from-amber-500 to-orange-600',
    description: 'Instant in-game Free Fire Diamonds top-up using Player UID. Fast 24/7 delivery.',
    minAmount: 85,
    maxAmount: 5000,
    popularAmount: 165,
    inputLabel: 'Player UID / Account',
    inputPlaceholder: 'e.g. 1234567890',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    popular: true,
    requirements: [
      { id: 'req-uid', name: 'Player UID', type: 'number' },
      { id: 'req-ign', name: 'In-Game Name (IGN)', type: 'text' }
    ],
    packages: [
      { name: '110 Diamonds', price: 85 },
      { name: '230 Diamonds', price: 165 },
      { name: '580 Diamonds', price: 410 },
      { name: '1160 Diamonds', price: 800 },
      { name: '2390 Diamonds', price: 1600 },
      { name: 'Weekly Membership', price: 180 },
      { name: 'Monthly Membership', price: 790 },
      { name: 'Level Up Pass', price: 210 }
    ]
  },
  {
    id: 'prod-pubg',
    name: 'PUBG Mobile UC',
    provider: 'Tencent Games',
    category: 'top-up',
    imagePlaceholderColor: 'bg-gradient-to-br from-yellow-500 to-amber-700',
    description: 'Official PUBG Mobile Unknown Cash (UC) topup. Direct topup via Character ID.',
    minAmount: 135,
    maxAmount: 12000,
    popularAmount: 720,
    inputLabel: 'Character ID',
    inputPlaceholder: 'e.g. 5123456789',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=600&q=80',
    popular: true,
    requirements: [
      { id: 'req-cid', name: 'Character ID', type: 'number' },
      { id: 'req-pign', name: 'In-Game Name', type: 'text' }
    ],
    packages: [
      { name: '60 UC', price: 135 },
      { name: '325 UC', price: 720 },
      { name: '660 UC', price: 1420 },
      { name: '1800 UC', price: 3750 },
      { name: '3850 UC', price: 7600 },
      { name: 'Royale Pass Pack', price: 1450 }
    ]
  },
  {
    id: 'prod-mlbb',
    name: 'Mobile Legends: Bang Bang',
    provider: 'Moonton',
    category: 'top-up',
    imagePlaceholderColor: 'bg-gradient-to-br from-blue-600 to-indigo-800',
    description: 'MLBB Diamonds top-up with Instant ID & Zone ID recharge.',
    minAmount: 190,
    maxAmount: 8000,
    popularAmount: 550,
    inputLabel: 'User ID & Zone ID',
    inputPlaceholder: 'e.g. 12345678 (1234)',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    popular: true,
    requirements: [
      { id: 'req-mluid', name: 'User ID', type: 'number' },
      { id: 'req-mlzid', name: 'Zone ID', type: 'number' }
    ],
    packages: [
      { name: '86 Diamonds', price: 190 },
      { name: '172 Diamonds', price: 370 },
      { name: '257 Diamonds', price: 550 },
      { name: '706 Diamonds', price: 1480 },
      { name: 'Weekly Diamond Pass', price: 210 }
    ]
  },
  {
    id: 'prod-tg',
    name: 'Telegram Premium Subscription',
    provider: 'Telegram LLC',
    category: 'subscription',
    imagePlaceholderColor: 'bg-gradient-to-br from-sky-400 to-blue-600',
    description: 'Unlock Telegram Premium features, fast downloads, exclusive stickers & badge.',
    minAmount: 480,
    maxAmount: 4500,
    popularAmount: 1350,
    inputLabel: 'Telegram Username / Phone',
    inputPlaceholder: 'e.g. @myusername or +97798xxxxxxxx',
    iconName: 'tv',
    imageUrl: 'https://images.unsplash.com/photo-1611721262720-d46424e83c2a?auto=format&fit=crop&w=600&q=80',
    popular: true,
    requirements: [
      { id: 'req-tguser', name: 'Telegram Username / Phone', type: 'text' }
    ],
    packages: [
      { name: '1 Month Subscription', price: 480 },
      { name: '3 Months Subscription', price: 1350 },
      { name: '6 Months Subscription', price: 2400 },
      { name: '12 Months Subscription', price: 4200 }
    ]
  },
  {
    id: 'prod-unipin',
    name: 'UniPin Gift Card Voucher',
    provider: 'UniPin',
    category: 'top-up',
    imagePlaceholderColor: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    description: 'Instant redeemable UniPin Credits code for multiple online game top-ups.',
    minAmount: 150,
    maxAmount: 5000,
    popularAmount: 500,
    inputLabel: 'Delivery Email / Phone',
    inputPlaceholder: 'e.g. player@gmail.com',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    popular: false,
    requirements: [
      { id: 'req-uniemail', name: 'Recipient Email Address', type: 'text' }
    ],
    packages: [
      { name: '100 UniPin Credit', price: 150 },
      { name: '300 UniPin Credit', price: 440 },
      { name: '500 UniPin Credit', price: 730 },
      { name: '1000 UniPin Credit', price: 1450 }
    ]
  },
  {
    id: 'prod-garena-shell',
    name: 'Garena Shell Voucher Code',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'bg-gradient-to-br from-red-600 to-rose-800',
    description: 'Official Garena Shell redeem PIN code sent directly to your account.',
    minAmount: 180,
    maxAmount: 3500,
    popularAmount: 850,
    inputLabel: 'Email / Phone Number',
    inputPlaceholder: 'e.g. 9841234567',
    iconName: 'shopping',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    popular: false,
    requirements: [
      { id: 'req-garshell', name: 'Delivery Phone / Email', type: 'text' }
    ],
    packages: [
      { name: '100 Shells Code', price: 180 },
      { name: '330 Shells Code', price: 580 },
      { name: '500 Shells Code', price: 850 },
      { name: '1000 Shells Code', price: 1650 }
    ]
  },
  {
    id: 'prod-design',
    name: 'Custom Gaming Logo & Banner Design',
    provider: 'BNY Creative Studio',
    category: 'design',
    imagePlaceholderColor: 'bg-gradient-to-br from-purple-600 to-fuchsia-800',
    description: 'Custom esports gaming logos, youtube overlays, tournament banners & thumbnails.',
    minAmount: 350,
    maxAmount: 3000,
    popularAmount: 800,
    inputLabel: 'WhatsApp Contact / Email',
    inputPlaceholder: 'e.g. +977 98xxxxxxxx',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    popular: false,
    requirements: [
      { id: 'req-dsgcontact', name: 'WhatsApp / Phone Number', type: 'text' },
      { id: 'req-dsgnote', name: 'Design Requirements / Team Name', type: 'text' }
    ],
    packages: [
      { name: 'Mascot Esports Logo', price: 350 },
      { name: 'YouTube Banner + Logo Combo', price: 800 },
      { name: 'Complete Tournament Overlay Pack', price: 1800 }
    ]
  }
];

export const ALL_PRODUCTS: Product[] = DEFAULT_PRODUCTS;

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
