export type Category = 'all' | 'top-up' | 'voucher' | 'subscription' | 'design' | 'vouchers';

export interface Product {
  id: string;
  name: string;
  provider: string;
  category: 'top-up' | 'voucher' | 'subscription' | 'design' | 'vouchers';
  imagePlaceholderColor: string; // Tailwind background color string for aesthetic visual logo
  description: string;
  minAmount: number;
  maxAmount?: number;
  fixedAmounts?: number[]; // For vouchers or subscriptions
  popularAmount?: number;
  inputLabel: string;
  inputPlaceholder: string;
  iconName: 'phone' | 'gamepad' | 'tv' | 'music' | 'shopping' | 'wifi' | 'layers';
  imageUrl?: string;
  popular?: boolean;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  provider: string;
  category: 'top-up' | 'voucher' | 'subscription' | 'design' | 'vouchers';
  amount: number;
  targetAccount: string; // Phone number, email, subscriber ID, etc.
  timestamp: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  pinCode?: string; // Generated for vouchers
  sellRate?: number;
  game?: string;
  package?: string;
  quantity?: number;
  enteredBy?: string;
  description?: string;
}
