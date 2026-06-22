import { Product } from './types';

export const ALL_PRODUCTS: Product[] = [
  // MOBILE TOPUPS
  {
    id: 'airtel-topup',
    name: 'Airtel Instant Recharge',
    provider: 'Airtel India',
    category: 'top-up',
    imagePlaceholderColor: 'from-rose-500 to-red-600',
    description: 'Fast, secure online mobile airtime and 5G data recharge.',
    minAmount: 10,
    maxAmount: 5000,
    popularAmount: 499,
    inputLabel: 'Airtel Mobile Number',
    inputPlaceholder: 'e.g. +91 98765 43210',
    iconName: 'phone'
  },
  {
    id: 'jio-topup',
    name: 'Jio Prime Top-up',
    provider: 'Reliance Jio',
    category: 'top-up',
    imagePlaceholderColor: 'from-blue-600 to-indigo-700',
    description: 'Instant talktime, high-speed 5G data, and SMS packs.',
    minAmount: 15,
    maxAmount: 5000,
    popularAmount: 299,
    inputLabel: 'Jio Mobile Number',
    inputPlaceholder: 'e.g. +91 88888 77777',
    iconName: 'phone'
  },
  {
    id: 'ncell-topup',
    name: 'Ncell Easy Topup',
    provider: 'Ncell Axiata',
    category: 'top-up',
    imagePlaceholderColor: 'from-purple-500 to-indigo-600',
    description: 'Recharge voice packages, data packs and regular talktime.',
    minAmount: 10,
    maxAmount: 2000,
    popularAmount: 500,
    inputLabel: 'Ncell Mobile Number',
    inputPlaceholder: 'e.g. +977 980 1234567',
    iconName: 'phone'
  },
  {
    id: 'ntc-topup',
    name: 'Nepal Telecom (NTC)',
    provider: 'Nepal Telecom',
    category: 'top-up',
    imagePlaceholderColor: 'from-sky-500 to-blue-600',
    description: 'Namaste GSM, CDMA and ADSL recharge options.',
    minAmount: 10,
    maxAmount: 2000,
    popularAmount: 200,
    inputLabel: 'NTC Phone Number',
    inputPlaceholder: 'e.g. +977 985 1023456',
    iconName: 'phone'
  },
  {
    id: 'ff-diamonds',
    name: 'Free Fire 1000+100 Diamonds',
    provider: 'Garena Free Fire',
    category: 'top-up',
    imagePlaceholderColor: 'from-orange-500 to-red-650',
    description: 'Direct in-game diamond top-up via player ID. Fast extraction.',
    minAmount: 150,
    maxAmount: 4800,
    popularAmount: 780,
    inputLabel: 'Garena Player ID (UID)',
    inputPlaceholder: 'e.g. 293848293',
    iconName: 'gamepad'
  },
  {
    id: 'pubg-uc',
    name: 'PUBG Mobile Unknown Cash (UC)',
    provider: 'Tencent Games',
    category: 'top-up',
    imagePlaceholderColor: 'from-amber-600 to-yellow-500',
    description: 'Buy Royal Pass, exclusive weapon skins and premium crate keys.',
    minAmount: 250,
    maxAmount: 7500,
    popularAmount: 800,
    inputLabel: 'PUBG Character ID',
    inputPlaceholder: 'e.g. 5129384732',
    iconName: 'gamepad'
  },

  // VOUCHERS
  {
    id: 'steam',
    name: 'Steam Wallet Code USD/INR',
    provider: 'Valve Corp',
    category: 'voucher',
    imagePlaceholderColor: 'from-slate-705 to-slate-900',
    description: 'Add digital cash to your Steam Wallet to buy games instantly on PC.',
    minAmount: 100,
    fixedAmounts: [100, 250, 500, 1000, 2500, 5000],
    popularAmount: 500,
    inputLabel: 'Recipient Email Address',
    inputPlaceholder: 'gamer@example.com',
    iconName: 'gamepad'
  },
  {
    id: 'googleplay',
    name: 'Google Play Gift Card',
    provider: 'Google Inc.',
    category: 'voucher',
    imagePlaceholderColor: 'from-emerald-600 to-teal-700',
    description: 'Buy premium apps, in-game coins, books, movies and more on Android.',
    minAmount: 50,
    fixedAmounts: [50, 100, 250, 500, 1000, 2000],
    popularAmount: 250,
    inputLabel: 'Google Play Account Email',
    inputPlaceholder: 'user@gmail.com',
    iconName: 'shopping'
  },
  {
    id: 'amazon',
    name: 'Amazon Shopping Voucher',
    provider: 'Amazon Inc.',
    category: 'voucher',
    imagePlaceholderColor: 'from-amber-500 to-orange-600',
    description: 'Redeem on amazon for goods, physical packages, or Pay balances.',
    minAmount: 100,
    fixedAmounts: [100, 500, 1000, 2000, 5000],
    popularAmount: 1000,
    inputLabel: 'Delivery Email Address',
    inputPlaceholder: 'purchaser@example.com',
    iconName: 'shopping'
  },

  // SUBSCRIPTIONS
  {
    id: 'netflix',
    name: 'Netflix Premium Ultra VIP',
    provider: 'Netflix Inc.',
    category: 'subscription',
    imagePlaceholderColor: 'from-red-650 to-stone-900',
    description: '4K Stream of hundreds of shows, series, and movies. 1 Month access.',
    minAmount: 199,
    fixedAmounts: [199, 499, 649, 1200],
    popularAmount: 649,
    inputLabel: 'Netflix Account Email',
    inputPlaceholder: 'profile@netflix.com',
    iconName: 'tv'
  },
  {
    id: 'spotify',
    name: 'Spotify Premium Family/Duo',
    provider: 'Spotify AB',
    category: 'subscription',
    imagePlaceholderColor: 'from-green-600 to-emerald-800',
    description: 'Unlimited ad-free music, offline listening, and high fidelity sound.',
    minAmount: 119,
    fixedAmounts: [119, 179, 350],
    popularAmount: 179,
    inputLabel: 'Spotify Registered Email',
    inputPlaceholder: 'musicfriend@example.com',
    iconName: 'music'
  },

  // DESIGN Category (from the screenshot category selection list)
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
    iconName: 'layers'
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
    iconName: 'layers'
  },

  // VOUCHERS alternative categories
  {
    id: 'itunes-card',
    name: 'Apple iTunes & App Store Voucher',
    provider: 'Apple Inc.',
    category: 'vouchers',
    imagePlaceholderColor: 'from-cyan-500 to-blue-500',
    description: 'Official App Store & iTunes Gift Card USD. Instantly redeem for Apple subscription bundles.',
    minAmount: 500,
    fixedAmounts: [500, 1000, 2000, 5000],
    popularAmount: 1000,
    inputLabel: 'Delivery Apple ID Email',
    inputPlaceholder: 'apple_user@icloud.com',
    iconName: 'shopping'
  },
  {
    id: 'xbox-card',
    name: 'Xbox Live Wallet Voucher',
    provider: 'Microsoft Corp',
    category: 'vouchers',
    imagePlaceholderColor: 'from-green-600 to-emerald-700',
    description: 'Buy premium expansion packs, game credits, or GamePass Ultimate subscriptions on console.',
    minAmount: 400,
    fixedAmounts: [400, 1000, 2000],
    popularAmount: 1000,
    inputLabel: 'Microsoft Register Email',
    inputPlaceholder: 'gamer@live.com',
    iconName: 'gamepad'
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
