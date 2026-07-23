import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [];

export const ALL_PRODUCTS: Product[] = [];

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

