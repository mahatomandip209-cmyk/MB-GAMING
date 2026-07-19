export type Category = string;

export interface Product {
  id: string;
  name: string;
  provider: string;
  category: string;
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
  packages?: { name: string; price: number }[];
  requirements?: { id: string; name: string; type: string }[];
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
  userEmail?: string;
  email?: string;
}
