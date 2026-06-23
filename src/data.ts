import { Product } from './types';

export const ALL_PRODUCTS: Product[] = [
  {
    id: 'garena-freefire',
    name: 'Garena Free Fire',
    provider: 'Garena',
    category: 'top-up',
    imagePlaceholderColor: 'from-blue-500 to-indigo-600',
    description: 'Instant Garena Free Fire Diamond top-up directly using your Player ID.',
    minAmount: 99,
    popularAmount: 99,
    inputLabel: 'Garena Player ID (UID)',
    inputPlaceholder: 'e.g. 5129384732',
    iconName: 'gamepad',
    imageUrl: '/assets/images/freefire_ice_fist_1782180289898.jpg',
    popular: true
  },
  {
    id: 'pubg-mobile-uc',
    name: 'PUBG Mobile UC',
    provider: 'Tencent Games',
    category: 'top-up',
    imagePlaceholderColor: 'from-sky-500 to-indigo-700',
    description: 'Get PlayerUnknown\'s Battlegrounds Unknown Cash (UC) instantly.',
    minAmount: 145,
    popularAmount: 145,
    inputLabel: 'PUBG Character ID',
    inputPlaceholder: 'e.g. 293848293',
    iconName: 'gamepad',
    imageUrl: '/assets/images/pubg_helmet_1782180313575.jpg',
    popular: true
  },
  {
    id: 'pubg-uc-vouchers',
    name: 'PUBG UC VOUCHERS',
    provider: 'Tencent Games',
    category: 'voucher',
    imagePlaceholderColor: 'from-zinc-100 to-zinc-200',
    description: 'Official PUBG Mobile UC Voucher Pin Code sent instantly directly to your screen/email.',
    minAmount: 145,
    popularAmount: 145,
    fixedAmounts: [145, 290, 725, 1450, 2900],
    inputLabel: 'Recipient Email Address',
    inputPlaceholder: 'gamer@example.com',
    iconName: 'gamepad',
    imageUrl: '/assets/images/pubg_uc_voucher_1782180328294.jpg',
    popular: true
  },
  {
    id: 'unipin-voucher-bdt',
    name: 'UniPin Voucher (BDT 2000)',
    provider: 'UniPin',
    category: 'voucher',
    imagePlaceholderColor: 'from-amber-100 to-amber-200',
    description: 'Buy UniPin Voucher BDT quickly for legal, trusted global game top-ups.',
    minAmount: 2370,
    popularAmount: 2370,
    fixedAmounts: [500, 1000, 2000, 5000],
    inputLabel: 'Recipient Email Address',
    inputPlaceholder: 'player@unipin.com',
    iconName: 'shopping',
    imageUrl: '/assets/images/unipin_voucher_1782180340316.jpg',
    popular: true
  },
  {
    id: 'mlbb-diamonds',
    name: 'MLBB Diamonds',
    provider: 'Moonton',
    category: 'top-up',
    imagePlaceholderColor: 'from-purple-900 to-indigo-950',
    description: 'Moonton Mobile Legends: Bang Bang diamond top-up via reliable direct ID.',
    minAmount: 150,
    popularAmount: 250,
    inputLabel: 'MLBB User ID + Zone ID',
    inputPlaceholder: 'e.g. 12345678 (1234)',
    iconName: 'gamepad',
    imageUrl: '/assets/images/mlbb_diamonds_avatar_1782180352803.jpg'
  },
  {
    id: 'apeuni-vip',
    name: 'APEUni VIP',
    provider: 'APEUni Australia',
    category: 'subscription',
    imagePlaceholderColor: 'from-emerald-600 to-teal-800',
    description: 'Unlock access to premium PTE and language practice tools instantly.',
    minAmount: 450,
    fixedAmounts: [450, 900, 1500],
    inputLabel: 'APEUni Registered Email',
    inputPlaceholder: 'student@example.com',
    iconName: 'layers',
    imageUrl: '/assets/images/apeuni_pte_logo_1782180367060.jpg'
  },
  {
    id: 'apple-gift-card',
    name: 'Apple Gift Card (US) us',
    provider: 'Apple Inc.',
    category: 'voucher',
    imagePlaceholderColor: 'from-zinc-100 to-slate-200',
    description: 'Official Apple & iTunes Gift Card USD. Instantly redeem for Apple subscriptions and games.',
    minAmount: 500,
    fixedAmounts: [500, 1000, 2000, 5000],
    inputLabel: 'Delivery Email Address',
    inputPlaceholder: 'appleuser@gmail.com',
    iconName: 'shopping',
    imageUrl: '/assets/images/apple_gift_card_logo_1782180379136.jpg'
  },
  {
    id: 'freefire-sub',
    name: 'Free Fire Member Subscription',
    provider: 'Garena Free Fire',
    category: 'subscription',
    imagePlaceholderColor: 'from-red-500 to-pink-600',
    description: 'Weekly or Monthly Garena Diamond Subscription privilege cards.',
    minAmount: 199,
    fixedAmounts: [199, 499, 1200],
    inputLabel: 'Player Account UID',
    inputPlaceholder: 'e.g. 91823847',
    iconName: 'tv',
    imageUrl: '/assets/images/freefire_subscription_cards_1782180392034.jpg'
  },
  {
    id: 'garena-shell',
    name: 'GARENA SHELL',
    provider: 'Garena Ltd',
    category: 'voucher',
    imagePlaceholderColor: 'from-rose-500 to-red-600',
    description: 'Redeem legal Garena Shell codes instantly to purchase custom in-game assets.',
    minAmount: 320,
    fixedAmounts: [320, 640, 1200],
    inputLabel: 'Delivery Email Address',
    inputPlaceholder: 'garenagamer@gmail.com',
    iconName: 'shopping',
    imageUrl: '/assets/images/garena_shells_card_1782180414709.jpg'
  },
  {
    id: 'netflix-sub-card',
    name: 'NETFLIX SUBSCRIPTION',
    provider: 'Netflix Inc.',
    category: 'subscription',
    imagePlaceholderColor: 'from-neutral-900 to-zinc-800',
    description: '4K UHD screen access of top quality TV shows, premium series and animation.',
    minAmount: 649,
    fixedAmounts: [199, 499, 649, 1200],
    inputLabel: 'Netflix Profile Email',
    inputPlaceholder: 'watcher@netflix.com',
    iconName: 'tv',
    imageUrl: '/assets/images/netflix_subscription_card_1782180427123.jpg'
  },
  {
    id: 'pubg-prime-plus',
    name: 'PUBG (Prime/Prime Plus)',
    provider: 'Tencent Games',
    category: 'subscription',
    imagePlaceholderColor: 'from-amber-500 to-orange-600',
    description: 'Access premium daily rewards, BP item shops, and high VIP points.',
    minAmount: 250,
    fixedAmounts: [250, 800, 1200],
    inputLabel: 'PUBG Game ID (UID)',
    inputPlaceholder: 'e.g. 19283742',
    iconName: 'tv',
    imageUrl: '/assets/images/pubg_prime_plus_cards_1782180440092.jpg'
  },
  {
    id: 'roblox',
    name: 'ROBLOX Game Card',
    provider: 'Roblox Corporation',
    category: 'top-up',
    imagePlaceholderColor: 'from-cyan-900 to-slate-950',
    description: 'Direct instant purchase of Robux points for infinite character items and game experiences.',
    minAmount: 350,
    popularAmount: 350,
    inputLabel: 'Roblox User Name',
    inputPlaceholder: 'e.g. GamerRox',
    iconName: 'gamepad',
    imageUrl: '/assets/images/roblox_game_card_logo_1782180452136.jpg'
  },
  {
    id: 'tiktok-coins',
    name: 'TIKTOK COINS RECHARGE',
    provider: 'TikTok Inc.',
    category: 'top-up',
    imagePlaceholderColor: 'from-zinc-900 to-neutral-950',
    description: 'Send live gifts, unlock virtual emotes and badges for stream support.',
    minAmount: 180,
    popularAmount: 180,
    inputLabel: 'TikTok Account Handle',
    inputPlaceholder: 'e.g. @coolcreators',
    iconName: 'phone',
    imageUrl: '/assets/images/tiktok_coins_card_1782180478215.jpg'
  },
  {
    id: 'telegram-premium',
    name: 'Telegram Premium',
    provider: 'Telegram',
    category: 'subscription',
    imagePlaceholderColor: 'from-blue-400 to-indigo-500',
    description: 'Unlock exclusive features, doubled limits, 4GB file uploads, faster downloads, and premium badges.',
    minAmount: 399,
    fixedAmounts: [399, 1199, 3999],
    inputLabel: 'Telegram Username or Phone Number',
    inputPlaceholder: 'e.g. @username or +97798...',
    iconName: 'phone',
    imageUrl: '/assets/images/telegram_premium_badge_1782180466663.jpg'
  },
  {
    id: 'yt-banner-design',
    name: 'Custom Gaming YouTube Banner',
    provider: 'MB GAMING Design Team',
    category: 'design',
    imagePlaceholderColor: 'from-fuchsia-600 to-pink-500',
    description: 'Sleek custom visual graphics, avatar, and 4K banner for your Youtube, Twitch or TikTok brand.',
    minAmount: 1500,
    fixedAmounts: [1500, 3000],
    popularAmount: 1500,
    inputLabel: 'Your Brand/Channel Name Text',
    inputPlaceholder: 'e.g. "ProGamer88"',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'logo-brand-design',
    name: 'Abstract Gaming Mascot Logo',
    provider: 'MB GAMING Design Team',
    category: 'design',
    imagePlaceholderColor: 'from-indigo-500 to-purple-600',
    description: 'Vector-drawn mascot logo design optimized for gaming platforms, tournaments, and social avatars.',
    minAmount: 2500,
    fixedAmounts: [2500, 4000],
    popularAmount: 2500,
    inputLabel: 'Mascot Theme description',
    inputPlaceholder: 'e.g. "Neon Tiger / Dark Wolf"',
    iconName: 'layers',
    imageUrl: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?auto=format&fit=crop&w=400&h=400&q=80'
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
