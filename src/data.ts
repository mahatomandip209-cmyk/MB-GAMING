import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-ff',
    name: 'Free Fire Diamonds',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'from-amber-500 to-orange-600',
    description: 'Instant Free Fire Diamonds Top-Up via Player ID. Fast & guaranteed delivery.',
    minAmount: 30,
    maxAmount: 2000,
    inputLabel: 'Player ID (UID)',
    inputPlaceholder: 'Enter your 9-10 digit Player ID',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
    popular: true,
    packages: [
      { name: '25 Diamonds', price: 30 },
      { name: '50 Diamonds', price: 55 },
      { name: '110 Diamonds', price: 100 },
      { name: '231 Diamonds', price: 200 },
      { name: '583 Diamonds', price: 480 },
      { name: '1188 Diamonds', price: 950 },
      { name: '2420 Diamonds', price: 1900 },
      { name: 'Weekly Membership', price: 240 },
      { name: 'Monthly Membership', price: 980 }
    ],
    requirements: [
      { id: 'req-uid', name: 'Player ID (UID)', type: 'text' }
    ]
  },
  {
    id: 'prod-pubg',
    name: 'PUBG Mobile UC',
    provider: 'Tencent / Krafton',
    category: 'top-up',
    imagePlaceholderColor: 'from-yellow-500 to-amber-700',
    description: 'Instant PUBG Mobile Unknown Cash (UC) Recharge via Character ID.',
    minAmount: 140,
    maxAmount: 7200,
    inputLabel: 'Character ID (UID)',
    inputPlaceholder: 'Enter 8-10 digit Character ID',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=60',
    popular: true,
    packages: [
      { name: '60 UC', price: 140 },
      { name: '325 UC', price: 680 },
      { name: '660 UC', price: 1350 },
      { name: '1800 UC', price: 3600 },
      { name: '3850 UC', price: 7200 },
      { name: 'Royale Pass Month', price: 480 }
    ],
    requirements: [
      { id: 'req-puid', name: 'Character ID', type: 'text' }
    ]
  },
  {
    id: 'prod-mlbb',
    name: 'Mobile Legends: Bang Bang',
    provider: 'Moonton',
    category: 'top-up',
    imagePlaceholderColor: 'from-blue-600 to-indigo-700',
    description: 'Direct MLBB Diamonds & Weekly Diamond Pass Top-Up via User ID & Zone ID.',
    minAmount: 190,
    maxAmount: 1500,
    inputLabel: 'User ID & Zone ID',
    inputPlaceholder: 'e.g. 12345678 (1234)',
    iconName: 'gamepad',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60',
    popular: true,
    packages: [
      { name: '86 Diamonds', price: 190 },
      { name: '172 Diamonds', price: 370 },
      { name: '257 Diamonds', price: 540 },
      { name: '706 Diamonds', price: 1420 },
      { name: 'Weekly Diamond Pass', price: 220 }
    ],
    requirements: [
      { id: 'req-mlid', name: 'User ID', type: 'text' },
      { id: 'req-zone', name: 'Zone ID', type: 'text' }
    ]
  },
  {
    id: 'prod-tg',
    name: 'Telegram Premium',
    provider: 'Telegram',
    category: 'subscription',
    imagePlaceholderColor: 'from-sky-500 to-blue-600',
    description: 'Get Telegram Premium status with faster downloads, 4GB file uploads, exclusive stickers & badge.',
    minAmount: 490,
    maxAmount: 4200,
    inputLabel: 'Telegram Username or Phone',
    inputPlaceholder: 'e.g. @username or +977 98xxxxxxx',
    iconName: 'phone',
    imageUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=500&auto=format&fit=crop&q=60',
    popular: true,
    packages: [
      { name: '1 Month Subscription', price: 490 },
      { name: '3 Months Subscription', price: 1350 },
      { name: '6 Months Subscription', price: 2450 },
      { name: '12 Months Subscription', price: 4200 }
    ],
    requirements: [
      { id: 'req-tguser', name: 'Telegram Username / Phone', type: 'text' }
    ]
  },
  {
    id: 'prod-unipin',
    name: 'UniPin Gift Voucher',
    provider: 'UniPin',
    category: 'top-up',
    imagePlaceholderColor: 'from-orange-500 to-red-600',
    description: 'UniPin Code Vouchers for global games and digital subscriptions.',
    minAmount: 130,
    maxAmount: 1200,
    inputLabel: 'Receiver Email / Phone',
    inputPlaceholder: 'Enter your email or phone number',
    iconName: 'shopping',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
    popular: false,
    packages: [
      { name: '10,000 UniPin Credits', price: 130 },
      { name: '20,000 UniPin Credits', price: 250 },
      { name: '50,000 UniPin Credits', price: 600 },
      { name: '100,000 UniPin Credits', price: 1200 }
    ],
    requirements: [
      { id: 'req-unipin-target', name: 'Email / Phone Number', type: 'text' }
    ]
  },
  {
    id: 'prod-garena-shell',
    name: 'Garena Shell Voucher',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'from-red-600 to-rose-700',
    description: 'Convert Garena Shells to Free Fire Diamonds, Call of Duty CP, or League of Legends RP.',
    minAmount: 110,
    maxAmount: 990,
    inputLabel: 'Receiver Phone / Email',
    inputPlaceholder: 'e.g. 9800000000',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60',
    popular: false,
    packages: [
      { name: '33 Shells', price: 110 },
      { name: '66 Shells', price: 210 },
      { name: '165 Shells', price: 510 },
      { name: '330 Shells', price: 990 }
    ],
    requirements: [
      { id: 'req-gs-phone', name: 'Phone Number / Email', type: 'text' }
    ]
  },
  {
    id: 'prod-design',
    name: 'Gaming Design & Banners',
    provider: 'BNY SHOP Studio',
    category: 'design',
    imagePlaceholderColor: 'from-purple-600 to-indigo-700',
    description: 'Professional esports team logo, channel banner, YouTube thumbnail & overlay designs.',
    minAmount: 299,
    maxAmount: 999,
    inputLabel: 'Your Channel / Team Name',
    inputPlaceholder: 'e.g. Team BNY - Theme Color Blue',
    iconName: 'tv',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
    popular: false,
    packages: [
      { name: 'Esports Team Logo', price: 499 },
      { name: 'Gaming Channel Banner', price: 399 },
      { name: 'YouTube Thumbnail Pack (3x)', price: 299 },
      { name: 'Stream Overlay Package', price: 999 }
    ],
    requirements: [
      { id: 'req-design-info', name: 'Design Instructions / Text', type: 'text' }
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

