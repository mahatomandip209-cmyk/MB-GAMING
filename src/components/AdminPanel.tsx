import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  LogOut,
  X,
  Search,
  RefreshCw,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Gamepad2,
  CreditCard,
  Image as ImageIcon,
  Ticket,
  Star,
  Bell,
  MessageSquare,
  FileText,
  Bot,
  Settings,
  UserPlus,
  Coins,
  Award,
  Wallet
} from 'lucide-react';
import { Product, Transaction } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
}

export default function AdminPanel({
  onClose,
  products,
  setProducts,
  transactions,
  setTransactions,
  walletBalance,
  setWalletBalance
}: AdminPanelProps) {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Toast status alert
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Admin Dashboard views: 13 options exactly matching the administrator panel specs
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'orders'
    | 'users'
    | 'games'
    | 'payments'
    | 'banners'
    | 'coupons'
    | 'store_points'
    | 'notifications'
    | 'support'
    | 'legal'
    | 'ai_chatbot'
    | 'settings'
  >('dashboard');

  // Profit range state
  const [profitRange, setProfitRange] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('DAILY');
  const [trendRange, setTrendRange] = useState<'Trend' | 'Compare'>('Trend');

  // Multi-tab sub databases persisted locally
  const [userList, setUserList] = useState<any[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<any>({
    esewa: { number: '9841234567', name: 'Mandip Mahato' },
    khalti: { number: '9801234567', name: 'Alic Digital Center' }
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pointsRate, setPointsRate] = useState<number>(100);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [legalDocs, setLegalDocs] = useState<any>({
    terms: 'By registering on Alic Digital Store, you agree to fulfill payment immediately for selected digital assets. Recharges are subject to manual validation of transaction UIDs.',
    refund: 'No refunds are permitted once a digital game recharge or voucher coupon has been officially approved and dispatched by the administrator.'
  });

  // Admin system credentials & branding details
  const [storeName, setStoreName] = useState('Alic Digital Store');
  const [storeContact, setStoreContact] = useState('mandipmahato717@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Mandip@#0');

  // Coupon inputs
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');
  const [newCouponMax, setNewCouponMax] = useState('500');

  // Announcement inputs
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'alert' | 'success'>('info');

  // User list additions
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Check login state
  useEffect(() => {
    const isAuth = localStorage.getItem('mb_admin_logged_in') === 'true';
    if (isAuth) {
      setIsLoggedIn(true);
    }

    // Load or bootstrap localized mock users list
    const localUsers = localStorage.getItem('mb_admin_users');
    if (localUsers) {
      setUserList(JSON.parse(localUsers));
    } else {
      const initialUsers = [
        { id: 'usr-101', name: 'Mandip Mahato', email: 'mandipmahato717@gmail.com', phone: '9841234567', balance: 5000, points: 1500, registered: '2026-06-01' },
        { id: 'usr-102', name: 'Gamer Nepal Pro', email: 'gamerpro@outlook.com', phone: '9801234567', balance: 150, points: 230, registered: '2026-06-10' },
        { id: 'usr-103', name: 'Rohan Shrestha', email: 'rohan.shrestha@gmail.com', phone: '9812345678', balance: 1200, points: 450, registered: '2026-06-14' },
        { id: 'usr-104', name: 'Sita Devkota', email: 'sita.devkota@yahoo.com', phone: '9842345679', balance: 0, points: 80, registered: '2026-06-18' },
        { id: 'usr-105', name: 'Aayush Thapa', email: 'aayush.thapa@gmail.com', phone: '9863456780', balance: 4500, points: 900, registered: '2026-06-22' }
      ];
      setUserList(initialUsers);
      localStorage.setItem('mb_admin_users', JSON.stringify(initialUsers));
    }

    // Load payments
    const localPayments = localStorage.getItem('mb_admin_payments');
    if (localPayments) {
      setPaymentSettings(JSON.parse(localPayments));
    }

    // Load or bootstrap banners
    const localBanners = localStorage.getItem('mb_admin_banners');
    if (localBanners) {
      setBanners(JSON.parse(localBanners));
    } else {
      const initialBanners = [
        { id: 'ban-1', badge: 'WEEKLY HIGHLIGHT', title: 'Free Fire 100% Top-Up Bonus', tagline: 'Double your shell diamonds this weekend only! Automatically credited on validation.', bgColor: 'from-blue-600 to-indigo-700' },
        { id: 'ban-2', badge: 'EXCLUSIVES', title: 'PUBG Mobile Air Drop Specials', tagline: 'Acquire UC vouchers with instant eSewa/Khalti payouts.', bgColor: 'from-purple-600 to-pink-600' }
      ];
      setBanners(initialBanners);
      localStorage.setItem('mb_admin_banners', JSON.stringify(initialBanners));
    }

    // Load or bootstrap coupons
    const localCoupons = localStorage.getItem('mb_admin_coupons');
    if (localCoupons) {
      setCoupons(JSON.parse(localCoupons));
    } else {
      const initialCoupons = [
        { code: 'MANDIP10', discountPercent: 10, maxDiscount: 200, active: true },
        { code: 'WINTER30', discountPercent: 30, maxDiscount: 1000, active: true },
        { code: 'GAMERFF5', discountPercent: 5, maxDiscount: 150, active: true }
      ];
      setCoupons(initialCoupons);
      localStorage.setItem('mb_admin_coupons', JSON.stringify(initialCoupons));
    }

    // Load points exchange rate
    const localPointsRate = localStorage.getItem('mb_points_rate');
    if (localPointsRate) {
      setPointsRate(Number(localPointsRate));
    }

    // Load announcements
    const localAnn = localStorage.getItem('mb_announcements');
    if (localAnn) {
      setAnnouncements(JSON.parse(localAnn));
    } else {
      const initialAnn = [
        { id: 'ann-1', message: '📢 Welcome to Alic Digital Store! Instant UPI recharges available 24/7.', type: 'info' },
        { id: 'ann-2', message: '⚠️ eSewa payments might take up to 5 minutes to verify due to central banking gateway delay.', type: 'alert' }
      ];
      setAnnouncements(initialAnn);
      localStorage.setItem('mb_announcements', JSON.stringify(initialAnn));
    }

    // Load support tickets
    const localTickets = localStorage.getItem('mb_support_tickets');
    if (localTickets) {
      setSupportTickets(JSON.parse(localTickets));
    } else {
      const initialTickets = [
        { id: 'tkt-1', user: 'Rohan Shrestha', msg: 'My Free Fire recharge is pending for 10 minutes. Transaction ID is 91283021.', date: '2026-06-24 10:14', status: 'PENDING', replies: [] },
        { id: 'tkt-2', user: 'Gamer Nepal Pro', msg: 'Can I redeem loyalty points for Free Fire Weekly memberships?', date: '2026-06-23 15:40', status: 'COMPLETED', replies: ['Yes, convert points to client balance first under your profile, then order!'] }
      ];
      setSupportTickets(initialTickets);
      localStorage.setItem('mb_support_tickets', JSON.stringify(initialTickets));
    }

    // Load system settings
    const localStoreName = localStorage.getItem('mb_store_name');
    if (localStoreName) setStoreName(localStoreName);

    const localStoreContact = localStorage.getItem('mb_store_contact');
    if (localStoreContact) setStoreContact(localStoreContact);

    const localAdminPass = localStorage.getItem('mb_admin_password');
    if (localAdminPass) setAdminPassword(localAdminPass);

    const localLegal = localStorage.getItem('mb_legal_docs');
    if (localLegal) setLegalDocs(JSON.parse(localLegal));
  }, []);

  // Product modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form input fields for product create/edit
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'top-up' | 'voucher' | 'subscription' | 'design'>('top-up');
  const [formProvider, setFormProvider] = useState('');
  const [formMinAmount, setFormMinAmount] = useState<number>(100);
  const [formMaxAmount, setFormMaxAmount] = useState<number>(5000);
  const [formInputLabel, setFormInputLabel] = useState('Player ID / Account UID');
  const [formInputPlaceholder, setFormInputPlaceholder] = useState('');
  const [formIconName, setFormIconName] = useState<'gamepad' | 'phone' | 'tv' | 'layers' | 'shopping' | 'wifi'>('gamepad');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPopular, setFormPopular] = useState(false);

  // Products filters
  const [productSearch, setProductSearch] = useState('');

  // Toast trigger
  const triggerToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Login handler
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const savedPassword = localStorage.getItem('mb_admin_password') || 'Mandip@#0';
    
    if (emailInput.trim() === 'admin@gmail.com' && passwordInput === savedPassword) {
      setIsLoggedIn(true);
      localStorage.setItem('mb_admin_logged_in', 'true');
      triggerToast('Welcome back, Administrator!');
    } else {
      setLoginError('incorrect password');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('mb_admin_logged_in');
    triggerToast('Signed out of admin panel.');
  };

  // Update Transaction Status
  const handleUpdateTransactionStatus = (txId: string, status: 'SUCCESS' | 'PENDING' | 'FAILED') => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status } : t))
    );
    triggerToast(`Transaction status updated to ${status}`);
  };

  // Open modal for Product creation
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormId('');
    setFormName('');
    setFormCategory('top-up');
    setFormProvider('');
    setFormMinAmount(100);
    setFormMaxAmount(5000);
    setFormInputLabel('Player Account UID');
    setFormInputPlaceholder('e.g. 123456789');
    setFormIconName('gamepad');
    setFormImageUrl('');
    setFormPopular(false);
    setIsProductModalOpen(true);
  };

  // Open modal for Product editing
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormProvider(product.provider);
    setFormCategory(product.category);
    setFormMinAmount(product.minAmount);
    setFormMaxAmount(product.maxAmount || 5000);
    setFormInputLabel(product.inputLabel);
    setFormInputPlaceholder(product.inputPlaceholder);
    setFormIconName(product.iconName);
    setFormImageUrl(product.imageUrl || '');
    setFormPopular(product.popular || false);
    setIsProductModalOpen(true);
  };

  // Save/Create Product
  const handleSaveProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProvider.trim()) {
      triggerToast('Please fill in required fields (Name and Provider)');
      return;
    }

    const updatedProduct: Product = {
      id: formId || `prod-${Date.now()}`,
      name: formName,
      provider: formProvider,
      category: formCategory,
      imagePlaceholderColor: 'from-blue-600 to-indigo-700',
      description: `Premium ${formName} top-up and vouchers from MB GAMING STORE. Instantly processed.`,
      minAmount: Number(formMinAmount),
      maxAmount: Number(formMaxAmount),
      inputLabel: formInputLabel,
      inputPlaceholder: formInputPlaceholder,
      iconName: formIconName,
      imageUrl: formImageUrl.trim() || undefined,
      popular: formPopular
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => (p.id === formId ? updatedProduct : p)));
      triggerToast('Product updated successfully!');
    } else {
      setProducts(prev => [...prev, updatedProduct]);
      triggerToast('New product created successfully!');
    }
    setIsProductModalOpen(false);
  };

  // Delete product
  const handleDeleteProduct = (prodId: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      setProducts(prev => prev.filter(p => p.id !== prodId));
      triggerToast('Product deleted.');
    }
  };

  // Adjust balance of test client wallet
  const [newBalanceInput, setNewBalanceInput] = useState(walletBalance.toString());
  const handleAdjustBalance = (e: FormEvent) => {
    e.preventDefault();
    const val = Number(newBalanceInput);
    if (!isNaN(val) && val >= 0) {
      setWalletBalance(val);
      triggerToast(`Wallet Balance updated to Rs. ${val}`);
    } else {
      triggerToast('Please enter a valid amount.');
    }
  };

  // Payment gateways saving
  const handleSavePaymentDetails = (gateway: 'esewa' | 'khalti', fields: any) => {
    const updated = {
      ...paymentSettings,
      [gateway]: {
        ...paymentSettings[gateway],
        ...fields
      }
    };
    setPaymentSettings(updated);
    localStorage.setItem('mb_admin_payments', JSON.stringify(updated));
    triggerToast('Payment Gateway settings updated locally.');
  };

  // Broadcast announcements
  const handleAddAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newAnnMessage.trim()) return;

    const newAnn = {
      id: `ann-${Date.now()}`,
      message: newAnnMessage.trim(),
      type: newAnnType
    };
    const updated = [...announcements, newAnn];
    setAnnouncements(updated);
    localStorage.setItem('mb_announcements', JSON.stringify(updated));
    setNewAnnMessage('');
    triggerToast('Broadcast Alert banner posted.');
  };

  // Support ticket replies
  const handleSendReply = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    const updated = supportTickets.map(tkt => {
      if (tkt.id === activeTicketId) {
        return {
          ...tkt,
          status: 'COMPLETED',
          replies: [...tkt.replies, replyText.trim()]
        };
      }
      return tkt;
    });

    setSupportTickets(updated);
    localStorage.setItem('mb_support_tickets', JSON.stringify(updated));
    setReplyText('');
    triggerToast('Reply dispatched to gamer.');
  };

  // Loyalty rewards distribution
  const handleDistributePoints = (amount: number) => {
    const updated = userList.map(u => ({
      ...u,
      points: u.points + amount
    }));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    triggerToast(`Rewarded +${amount} Points to all ${userList.length} registered gamer accounts.`);
  };

  // Admin users lists modifiers
  const handleAddUser = (e: FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: `usr-${101 + userList.length}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '98XXXXXXXX',
      balance: 0,
      points: 100,
      registered: new Date().toISOString().split('T')[0]
    };

    const updated = [...userList, newUser];
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    triggerToast(`Gamer profile created for ${newUser.name}!`);
  };

  const handleUpdateUserBalance = (userId: string, val: number) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, balance: val } : u));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    triggerToast('User simulated wallet balance saved.');
  };

  const handleUpdateUserPoints = (userId: string, val: number) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, points: val } : u));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    triggerToast('User loyalty points updated.');
  };

  // Search filtered products
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.provider.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col relative pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {adminToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-zinc-800 text-xs font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {adminToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN OR AUTH SCREENS (FORGOT PASSWORD OPTION REMOVED ACCORDING TO SPECS) */}
      {!isLoggedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-zinc-950 text-white relative overflow-hidden">
          {/* Accent graphics */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#1e3a8a_0%,transparent_50%)] opacity-30" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#311042_0%,transparent_50%)] opacity-30" />

          <div className="w-full max-w-md z-10 space-y-6">
            
            {/* Logo */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-2xl flex items-center justify-center bg-zinc-900">
                <img 
                  src="https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg" 
                  alt="MB Gaming Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter">MB GAMING STORE</h1>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-black text-blue-500">Administrator Console</p>
            </div>

            {/* Back to store button */}
            <button
              onClick={onClose}
              className="mx-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1 px-3 bg-zinc-900 border border-zinc-800 rounded-full cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Gaming Store
            </button>

            {/* Auth card */}
            <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center space-y-1 pb-2 border-b border-zinc-800">
                  <h2 className="text-sm font-bold text-zinc-200">Sign In to Dashboard</h2>
                  <p className="text-[11px] text-zinc-500">Only registered store administrators can gain entry.</p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="admin@gmail.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-11 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 uppercase tracking-wider mt-4"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Secure Login
                </button>
              </form>

            </div>

          </div>
        </div>
      ) : (
        /* LOGGED IN VIEW: ADMIN PANEL DASHBOARD WITH 13 VERTICAL TABS AND ENHANCED DASHBOARDS */
        <div className="flex-1 flex min-h-screen bg-[#f8fafc]">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-white border-r border-zinc-200/80 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
            
            {/* Sidebar Brand Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                  title="Return to Storefront"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-zinc-950 tracking-tight">{storeName}</span>
                  <span className="text-[9px] text-zinc-400 font-mono tracking-widest mt-0.5 uppercase">SYSTEM MANAGER</span>
                </div>
              </div>
              <span className="bg-blue-100/70 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            </div>

            {/* Sidebar Navigation Options */}
            <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto scrollbar-thin">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingCart },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'banners', label: 'Banners', icon: ImageIcon },
                { id: 'coupons', label: 'Coupons', icon: Ticket },
                { id: 'store_points', label: 'Store Points', icon: Star },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'support', label: 'Support', icon: MessageSquare },
                { id: 'legal', label: 'Legal', icon: FileText },
                { id: 'ai_chatbot', label: 'AI Chatbot', icon: Bot },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 font-extrabold'
                        : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    
                    {/* Badge counters */}
                    {item.id === 'orders' && transactions.filter(t => t.status === 'PENDING').length > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {transactions.filter(t => t.status === 'PENDING').length}
                      </span>
                    )}
                    {item.id === 'support' && supportTickets.filter(t => t.status === 'PENDING').length > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {supportTickets.filter(t => t.status === 'PENDING').length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Admin Footer SignOut */}
            <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE VIEW CONTAINER */}
          <main className="flex-1 min-h-screen overflow-y-auto p-6 sm:p-8 flex flex-col bg-[#f8fafc]">
            
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Header title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Real-time store telemetry and transaction indicators.</p>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-500 font-mono bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-xs">
                    SERVER TIME: {new Date().toISOString().split('T')[0]} 12:00 UTC
                  </div>
                </div>

                {/* Grid of 4 stats cards matching user screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Total Orders */}
                  <div className="bg-[#fefbf0] border border-[#fdf2d0] rounded-3xl p-5 shadow-xs relative flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#855d14] uppercase tracking-wider font-mono">TOTAL ORDERS</span>
                      <div className="p-2 bg-[#fbeebc] rounded-xl text-blue-600 shadow-2xs">
                        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-3xl font-black text-zinc-950 tracking-tight">{164 + transactions.length}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Processed from all platforms</p>
                    </div>
                  </div>

                  {/* Card 2: Total Users */}
                  <div className="bg-[#f0f4f9] border border-[#d6e4f0] rounded-3xl p-5 shadow-xs relative flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-wider font-mono">TOTAL USERS</span>
                      <div className="p-2 bg-[#cbdceb] rounded-xl text-blue-600 shadow-2xs">
                        <Users className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-3xl font-black text-zinc-950 tracking-tight">{63 + userList.length - 5}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Active gamer directories</p>
                    </div>
                  </div>

                  {/* Card 3: Pending Orders */}
                  <div className="bg-[#fff5eb] border border-[#ffe1cc] rounded-3xl p-5 shadow-xs relative flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#7a3400] uppercase tracking-wider font-mono">PENDING ORDERS</span>
                      <div className="p-2 bg-[#ffd1b3] rounded-xl text-orange-600 shadow-2xs">
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-3xl font-black text-zinc-950 tracking-tight">
                        {transactions.filter(t => t.status === 'PENDING').length}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Awaiting admin review</p>
                    </div>
                  </div>

                  {/* Card 4: Pending Top-Ups */}
                  <div className="bg-[#f5f3ff] border border-[#e5e0ff] rounded-3xl p-5 shadow-xs relative flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#4c1d95] uppercase tracking-wider font-mono">PENDING TOP-UPS</span>
                      <div className="p-2 bg-[#ddd6fe] rounded-xl text-purple-600 shadow-2xs">
                        <Wallet className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-3xl font-black text-zinc-950 tracking-tight">0</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">Instant auto API queues</p>
                    </div>
                  </div>

                </div>

                {/* Grid 2: Extra Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 5: Total Points */}
                  <div className="bg-[#fdfbe7] border border-[#f9f3b5] rounded-3xl p-5 shadow-xs relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#f5ec98] text-[#716104] rounded-2xl">
                        <Coins className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block font-mono">TOTAL POINTS (ALL USERS)</span>
                        <h4 className="text-2xl font-black text-zinc-900 mt-0.5">
                          {(userList.reduce((acc: number, u: any) => acc + u.points, 0) + 48982).toLocaleString()}
                        </h4>
                      </div>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2.5 py-1 rounded-xl">Loyalty Active</span>
                  </div>

                  {/* Card 6: All-Time Revenue */}
                  <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-3xl p-5 shadow-xs relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#bbf7d0] text-[#14532d] rounded-2xl">
                        <TrendingUp className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block font-mono">ALL-TIME REVENUE</span>
                        <h4 className="text-2xl font-black text-zinc-900 mt-0.5">NPR 692,721</h4>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-xl">99.8% Success</span>
                  </div>
                </div>

                {/* Profit Tracker card matching uploaded layout */}
                <div className="border border-blue-100/80 bg-white rounded-3xl p-6 shadow-xs relative overflow-hidden space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <DollarSign className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight">Profit Tracker</h3>
                        <p className="text-[10px] text-zinc-400 font-bold">SIMULATED SALES EARNING STATS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      See All Activity &gt;
                    </button>
                  </div>

                  {/* Range pills */}
                  <div className="flex items-center gap-1.5 bg-zinc-100/70 p-1 rounded-2xl max-w-xs">
                    {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setProfitRange(range)}
                        className={`flex-1 text-[9.5px] font-black py-1.5 px-3.5 rounded-xl uppercase transition-all cursor-pointer ${
                          profitRange === range
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>

                  {/* 3 columns inside Profit Tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Sales Column */}
                    <div className="bg-blue-50/50 border border-blue-100/60 p-4.5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider block font-mono">Sales Revenue</span>
                      <div className="mt-2.5">
                        <h5 className="text-xl font-black text-blue-950">
                          {profitRange === 'DAILY' ? 'NPR 63,715' :
                           profitRange === 'WEEKLY' ? 'NPR 492,100' :
                           profitRange === 'MONTHLY' ? 'NPR 1,840,450' : 'NPR 22,891,400'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                          {profitRange === 'DAILY' ? '11 successful trades' :
                           profitRange === 'WEEKLY' ? '84 successful trades' :
                           profitRange === 'MONTHLY' ? '312 successful trades' : '3,842 successful trades'}
                        </p>
                      </div>
                    </div>

                    {/* Cost Column */}
                    <div className="bg-amber-50/40 border border-amber-100/50 p-4.5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-extrabold text-[#7a5c12] uppercase tracking-wider block font-mono">Direct Supply Cost</span>
                      <div className="mt-2.5">
                        <h5 className="text-xl font-black text-[#5c460d]">
                          {profitRange === 'DAILY' ? 'NPR 0' :
                           profitRange === 'WEEKLY' ? 'NPR 25,000' :
                           profitRange === 'MONTHLY' ? 'NPR 110,000' : 'NPR 1,420,000'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                          {profitRange === 'DAILY' ? '11 items supplied' :
                           profitRange === 'WEEKLY' ? '84 items supplied' :
                           profitRange === 'MONTHLY' ? '312 items supplied' : '3,842 items supplied'}
                        </p>
                      </div>
                    </div>

                    {/* Net Profit Column */}
                    <div className="bg-emerald-50/50 border border-emerald-100/60 p-4.5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block font-mono">Calculated Net Profit</span>
                      <div className="mt-2.5">
                        <h5 className="text-xl font-black text-emerald-950">
                          {profitRange === 'DAILY' ? 'NPR 63,715' :
                           profitRange === 'WEEKLY' ? 'NPR 467,100' :
                           profitRange === 'MONTHLY' ? 'NPR 1,730,450' : 'NPR 21,471,400'}
                        </h5>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                          {profitRange === 'DAILY' ? '100% net margin' :
                           profitRange === 'WEEKLY' ? '94.9% net margin' :
                           profitRange === 'MONTHLY' ? '94.0% net margin' : '93.8% net margin'}
                        </p>
                      </div>
                    </div>

                  </div>

                  <p className="text-[10.5px] text-zinc-400 font-medium flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                    Profit = Revenue - Cost. Only completed orders are counted (rejected/failed excluded).
                  </p>
                </div>

                {/* 30-Day Trend Area Chart from user screenshot */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">30-Day Trend</h3>
                    </div>
                    
                    {/* Trend / Compare pills */}
                    <div className="flex items-center gap-1 bg-zinc-100/60 p-0.5 rounded-xl">
                      {(['Trend', 'Compare'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setTrendRange(tab)}
                          className={`text-[9px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                            trendRange === tab
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-800'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Responsive Area Chart */}
                  <div className="relative w-full overflow-hidden bg-zinc-50/30 p-2.5 rounded-2xl border border-zinc-100">
                    <svg viewBox="0 0 600 240" className="w-full h-auto">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="50" y1="40" x2="560" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="50" y1="80" x2="560" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="50" y1="120" x2="560" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="50" y1="160" x2="560" y2="160" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                      <line x1="50" y1="200" x2="560" y2="200" stroke="#e2e8f0" strokeWidth="1" />

                      {/* Y-axis Labels */}
                      <text x="40" y="44" textAnchor="end" className="text-[9px] font-bold fill-zinc-400 font-mono">340000</text>
                      <text x="40" y="84" textAnchor="end" className="text-[9px] font-bold fill-zinc-400 font-mono">255000</text>
                      <text x="40" y="124" textAnchor="end" className="text-[9px] font-bold fill-zinc-400 font-mono">170000</text>
                      <text x="40" y="164" textAnchor="end" className="text-[9px] font-bold fill-zinc-400 font-mono">85000</text>
                      <text x="40" y="204" textAnchor="end" className="text-[9px] font-bold fill-zinc-400 font-mono">0</text>

                      {/* Area fill */}
                      <path 
                        d="M 50,200 L 50,195 C 150,195 250,195 330,195 C 360,195 380,185 400,150 C 420,115 435,40 450,40 C 465,40 475,120 485,160 C 495,200 515,180 530,180 C 545,180 550,170 560,150 L 560,200 Z" 
                        fill="url(#chartGrad)" 
                      />

                      {/* Main bezier line */}
                      <path 
                        d="M 50,195 C 150,195 250,195 330,195 C 360,195 380,185 400,150 C 420,115 435,40 450,40 C 465,40 475,120 485,160 C 495,200 515,180 530,180 C 545,180 550,170 560,150" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Pulse point at Peak */}
                      <circle cx="450" cy="40" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                      <circle cx="450" cy="40" r="12" fill="#2563eb" fillOpacity="0.2" className="animate-ping" />

                      {/* X-axis Labels */}
                      <text x="50" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">5/25</text>
                      <text x="150" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">5/30</text>
                      <text x="250" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/4</text>
                      <text x="350" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/9</text>
                      <text x="450" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/14</text>
                      <text x="550" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/19</text>
                    </svg>

                    {/* Popover detail */}
                    <div className="absolute top-[35px] left-[78%] bg-zinc-950 text-white p-2 rounded-xl text-[9px] shadow-lg border border-zinc-800 font-mono pointer-events-none">
                      <div className="font-extrabold text-[10px] text-blue-400">Peak: Jun 14</div>
                      <div className="mt-0.5">Sales: NPR 315,200</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. ORDERS / RECHARGE REQUESTS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Recharge Orders</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manually approve, reject or delete client game recharges.</p>
                  </div>
                  <span className="bg-zinc-900 text-white text-[10px] font-black px-2.5 py-1 rounded-xl">
                    Pending Queue: {transactions.filter(t => t.status === 'PENDING').length}
                  </span>
                </div>

                {/* Filter / Actions bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4.5 border border-zinc-200 rounded-2xl">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search Transaction ID or Player Account..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear transaction history logs?')) {
                        setTransactions([]);
                        triggerToast('Logs cleared successfully.');
                      }
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl border border-red-100 transition-all cursor-pointer"
                  >
                    Clear History Logs
                  </button>
                </div>

                {/* Orders grid table */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                          <th className="py-3.5 px-4">Date & Time</th>
                          <th className="py-3.5 px-4">Transaction ID</th>
                          <th className="py-3.5 px-4">Product Name</th>
                          <th className="py-3.5 px-4">Player Account / UID</th>
                          <th className="py-3.5 px-4">Price Charged</th>
                          <th className="py-3.5 px-4">Order Status</th>
                          <th className="py-3.5 px-4 text-right">Approve Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-zinc-400 font-bold text-xs">
                              No orders matching criteria found.
                            </td>
                          </tr>
                        ) : (
                          transactions
                            .filter(t => t.id.toLowerCase().includes(productSearch.toLowerCase()) || t.targetAccount.toLowerCase().includes(productSearch.toLowerCase()) || t.productName.toLowerCase().includes(productSearch.toLowerCase()))
                            .map(tx => (
                              <tr key={tx.id} className="hover:bg-zinc-50/40 transition-colors">
                                <td className="py-4 px-4 text-[10.5px] text-zinc-500 font-mono">{tx.timestamp}</td>
                                <td className="py-4 px-4 text-[10.5px] text-zinc-900 font-extrabold font-mono">{tx.id}</td>
                                <td className="py-4 px-4">
                                  <div className="font-extrabold text-zinc-900 text-[11px]">{tx.productName}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-[11px] text-zinc-700 font-extrabold bg-zinc-100/45 font-mono rounded-lg px-2 py-1 border border-zinc-200/50">
                                    {tx.targetAccount}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-[11.5px] font-black text-zinc-900">Rs. {tx.amount.toLocaleString()}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/30' :
                                    tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200/30 auto-pulse' :
                                    'bg-red-50 text-red-600 border border-red-200/30'
                                  }`}>
                                    ● {tx.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  {tx.status === 'PENDING' ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'SUCCESS')}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white p-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                                        title="Approve Order"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'FAILED')}
                                        className="bg-red-500 hover:bg-red-400 text-white p-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                                        title="Reject Order"
                                      >
                                        <X className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Locked</span>
                                  )}
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 3. USERS DIRECTORY TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Users Directory</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manage user directories, simulated wallets, and loyalty points.</p>
                  </div>
                  <div className="p-1 bg-zinc-100 rounded-xl flex gap-1 border border-zinc-200/50">
                    <span className="bg-white text-zinc-800 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-2xs">
                      Total Accounts: {userList.length}
                    </span>
                  </div>
                </div>

                {/* Add new user form */}
                <div className="bg-white border border-zinc-200/80 p-5 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-tight flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    Register / Add New Client Profile
                  </h3>
                  <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Ramesh Rai)"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Phone (e.g. 9841234567)"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Create Account
                    </button>
                  </form>
                </div>

                {/* Users List Table */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                          <th className="py-3 px-4">User ID</th>
                          <th className="py-3 px-4">Gamer Profile Name</th>
                          <th className="py-3 px-4">Email & Phone</th>
                          <th className="py-3 px-4">Wallet Balance</th>
                          <th className="py-3 px-4">Loyalty Points</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4 text-right">Directory Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {userList.map((usr: any) => (
                          <tr key={usr.id} className="hover:bg-zinc-50/40 transition-colors">
                            <td className="py-3 px-4 text-[10px] font-mono text-zinc-400">{usr.id}</td>
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-zinc-900 text-[11px]">{usr.name}</div>
                            </td>
                            <td className="py-3 px-4 text-[10.5px]">
                              <div className="text-zinc-600 font-semibold">{usr.email}</div>
                              <div className="text-zinc-400 font-mono text-[9.5px] mt-0.5">{usr.phone}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-blue-900">Rs. {usr.balance.toLocaleString()}</span>
                                <button
                                  onClick={() => {
                                    const val = prompt(`Change balance for ${usr.name}:`, usr.balance.toString());
                                    if (val !== null && !isNaN(Number(val))) {
                                      handleUpdateUserBalance(usr.id, Number(val));
                                    }
                                  }}
                                  className="text-[10px] text-blue-600 hover:underline font-bold"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-[#716104] bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200/50 text-[10.5px]">
                                  ★ {usr.points.toLocaleString()} PTS
                                </span>
                                <button
                                  onClick={() => {
                                    const val = prompt(`Change loyalty points for ${usr.name}:`, usr.points.toString());
                                    if (val !== null && !isNaN(Number(val))) {
                                      handleUpdateUserPoints(usr.id, Number(val));
                                    }
                                  }}
                                  className="text-[10px] text-[#716104] hover:underline font-bold"
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-zinc-400 text-[10px]">{usr.registered}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete account directory for ${usr.name}?`)) {
                                    const updated = userList.filter((u: any) => u.id !== usr.id);
                                    setUserList(updated);
                                    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
                                    triggerToast('Account profile deleted.');
                                  }
                                }}
                                className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 border border-zinc-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 4. GAMES / PRODUCT CATALOG MANAGER TAB */}
            {activeTab === 'games' && (
              <div className="space-y-4">
                
                {/* Header title */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Game Catalog</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure active digital games, top-up categories and prices.</p>
                  </div>
                  <button
                    onClick={openAddProductModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add New Game
                  </button>
                </div>

                {/* Search bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4.5 border border-zinc-200 rounded-2xl">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search store catalog items..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Products Grid Table */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                          <th className="py-3 px-4">Icon / Image</th>
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Provider</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Config Limits</th>
                          <th className="py-3 px-4">Popular</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-zinc-50/40 transition-colors">
                            {/* Image */}
                            <td className="py-3 px-4">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 bg-neutral-100 flex items-center justify-center shrink-0">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-zinc-500">MOCK</span>
                                )}
                              </div>
                            </td>
                            
                            {/* Title */}
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-zinc-800 text-[11px]">{product.name}</div>
                              <div className="text-[9.5px] text-zinc-400 font-mono mt-0.5">{product.id}</div>
                            </td>

                            {/* Provider */}
                            <td className="py-3 px-4 font-bold text-zinc-700 text-[11px]">
                              {product.provider}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 uppercase text-[9px]">
                              <span className={`px-2 py-0.5 rounded-full font-black ${
                                product.category === 'top-up' ? 'bg-blue-50 text-blue-600' :
                                product.category === 'subscription' ? 'bg-purple-50 text-purple-600' :
                                product.category === 'design' ? 'bg-teal-50 text-teal-600' :
                                'bg-orange-50 text-orange-600'
                              }`}>
                                {product.category}
                              </span>
                            </td>

                            {/* Config Limits */}
                            <td className="py-3 px-4">
                              <div className="text-[10.5px] text-zinc-800 font-black">Min: Rs. {product.minAmount}</div>
                              <div className="text-[9.5px] text-zinc-400 font-semibold mt-0.5">Label: {product.inputLabel}</div>
                            </td>

                            {/* Popular */}
                            <td className="py-3 px-4">
                              {product.popular ? (
                                <span className="bg-yellow-50 text-yellow-700 font-black border border-yellow-200/50 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                                  ★ Popular
                                </span>
                              ) : (
                                <span className="text-zinc-300 text-[11px]">No</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditProductModal(product)}
                                  className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-lg border border-zinc-100 transition-colors cursor-pointer"
                                  title="Edit Product Details"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg border border-zinc-100 transition-colors cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* 5. PAYMENTS / RECHARGE SETTINGS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Payment Settings</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure eSewa, Khalti accounts and global test client wallet.</p>
                  </div>
                </div>

                {/* Simulated wallet editor */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs max-w-md">
                  <div className="text-center space-y-1.5 pb-4 border-b border-zinc-100">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Test Client Wallet Engine</h3>
                    <p className="text-xs text-zinc-500">Edit the global client storefront wallet balance simulated for testing.</p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100/80 p-4 rounded-2xl flex items-center justify-between my-4">
                    <div>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Current Balance</p>
                      <h4 className="text-xl font-black text-blue-900 mt-1">Rs. {walletBalance.toLocaleString()}</h4>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-500 stroke-[1.5]" />
                  </div>

                  <form onSubmit={handleAdjustBalance} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-500">Assign New Balance (Rs.)</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={newBalanceInput}
                        onChange={(e) => setNewBalanceInput(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full text-center text-sm font-black bg-zinc-50 border border-zinc-200 rounded-xl py-3 focus:outline-none focus:border-blue-500 transition-all text-zinc-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-black py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Save New Balance
                    </button>
                  </form>
                </div>

                {/* Gateway config grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* eSewa */}
                  <div className="bg-white p-5 border border-zinc-200 rounded-3xl space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <h4 className="text-xs font-black uppercase text-zinc-800">eSewa Wallet</h4>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase font-mono">eSewa Recipient Mobile Number</label>
                        <input
                          type="text"
                          value={paymentSettings.esewa.number}
                          onChange={(e) => handleSavePaymentDetails('esewa', { number: e.target.value })}
                          className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase font-mono">Account Holder Full Name</label>
                        <input
                          type="text"
                          value={paymentSettings.esewa.name}
                          onChange={(e) => handleSavePaymentDetails('esewa', { name: e.target.value })}
                          className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khalti */}
                  <div className="bg-white p-5 border border-zinc-200 rounded-3xl space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <h4 className="text-xs font-black uppercase text-zinc-800">Khalti Wallet</h4>
                      </div>
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase font-mono">Khalti Recipient Mobile Number</label>
                        <input
                          type="text"
                          value={paymentSettings.khalti.number}
                          onChange={(e) => handleSavePaymentDetails('khalti', { number: e.target.value })}
                          className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase font-mono">Account Holder Full Name</label>
                        <input
                          type="text"
                          value={paymentSettings.khalti.name}
                          onChange={(e) => handleSavePaymentDetails('khalti', { name: e.target.value })}
                          className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 6. PROMO BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Promo Banners</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manage the homepage slideshow marketing banners.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {banners.map((ban: any) => (
                    <div key={ban.id} className="bg-white border border-zinc-200 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-start justify-between shadow-2xs">
                      <div className="space-y-1 flex-1">
                        <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {ban.badge}
                        </span>
                        <h4 className="text-sm font-black text-zinc-950 mt-1.5">{ban.title}</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">{ban.tagline}</p>
                        <div className="text-[10px] text-zinc-400 font-mono mt-2">Background style: <code className="bg-zinc-50 px-2 py-1 rounded">{ban.bgColor}</code></div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-stretch justify-end md:justify-center">
                        <button
                          onClick={() => {
                            const newTitle = prompt('Edit banner title:', ban.title);
                            if (newTitle) {
                              const updated = banners.map((b: any) => (b.id === ban.id ? { ...b, title: newTitle } : b));
                              setBanners(updated);
                              localStorage.setItem('mb_admin_banners', JSON.stringify(updated));
                              triggerToast('Banner updated.');
                            }
                          }}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer"
                        >
                          Edit Content
                        </button>
                        <button
                          onClick={() => {
                            const updated = banners.filter((b: any) => b.id !== ban.id);
                            setBanners(updated);
                            localStorage.setItem('mb_admin_banners', JSON.stringify(updated));
                            triggerToast('Banner deleted.');
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border border-red-100 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. DISCOUNT COUPONS TAB */}
            {activeTab === 'coupons' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Promo Coupons</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure checkout discount coupon codes for game recharges.</p>
                  </div>
                </div>

                {/* Add coupon form */}
                <div className="bg-white border border-zinc-200/80 p-5 rounded-3xl space-y-4 shadow-2xs max-w-xl">
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-tight flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-blue-500" />
                    Create New Promo Coupon Code
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCouponCode) return;
                      const newCp = {
                        code: newCouponCode.toUpperCase().replace(/\s+/g, ''),
                        discountPercent: Number(newCouponDiscount),
                        maxDiscount: Number(newCouponMax),
                        active: true
                      };
                      const updated = [...coupons, newCp];
                      setCoupons(updated);
                      localStorage.setItem('mb_admin_coupons', JSON.stringify(updated));
                      setNewCouponCode('');
                      triggerToast(`Coupon ${newCp.code} successfully created!`);
                    }} 
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                  >
                    <input
                      type="text"
                      required
                      placeholder="CODE (e.g. EXTRA15)"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      placeholder="Discount %"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="Max Discount (Rs)"
                      value={newCouponMax}
                      onChange={(e) => setNewCouponMax(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Save Coupon
                    </button>
                  </form>
                </div>

                {/* Coupons grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons.map((cp: any) => (
                    <div key={cp.code} className="bg-white border border-zinc-200 p-5 rounded-3xl flex flex-col justify-between shadow-2xs relative">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-blue-600 bg-blue-50 border border-blue-200/50 px-3 py-1 rounded-xl text-xs uppercase tracking-widest">
                            {cp.code}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cp.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'}`}>
                            {cp.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-zinc-950 pt-2">{cp.discountPercent}% OFF</h4>
                        <p className="text-[10.5px] text-zinc-500">Max discount limit up to Rs. {cp.maxDiscount}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4.5 pt-3 border-t border-zinc-100">
                        <button
                          onClick={() => {
                            const updated = coupons.map((c: any) => (c.code === cp.code ? { ...c, active: !c.active } : c));
                            setCoupons(updated);
                            localStorage.setItem('mb_admin_coupons', JSON.stringify(updated));
                            triggerToast('Coupon status changed.');
                          }}
                          className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[9.5px] font-black py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Toggle Active
                        </button>
                        <button
                          onClick={() => {
                            const updated = coupons.filter((c: any) => c.code !== cp.code);
                            setCoupons(updated);
                            localStorage.setItem('mb_admin_coupons', JSON.stringify(updated));
                            triggerToast('Coupon deleted.');
                          }}
                          className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg border border-zinc-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* 8. STORE REWARD POINTS TAB */}
            {activeTab === 'store_points' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Reward Points</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Control client loyal points reward ratio and click to distribute points.</p>
                </div>

                <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Loyalty Points Value Configuration
                  </h3>
                  
                  <div className="bg-yellow-50/50 border border-yellow-100/80 p-4 rounded-2xl">
                    <p className="text-xs text-yellow-900 font-medium">
                      Configure how many client reward points can be spent for <strong>Rs. 1 discount</strong>. Current ratio is:
                    </p>
                    <h4 className="text-lg font-black text-yellow-950 mt-2">
                      {pointsRate} Points = Rs. 1.00 Discount
                    </h4>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-zinc-500">Assign Loyalty Points Exchange Ratio</label>
                      <input
                        type="number"
                        min={1}
                        value={pointsRate}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPointsRate(val);
                          localStorage.setItem('mb_points_rate', val.toString());
                        }}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-tight font-mono">Credit Global Bonus Points</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Credit free bonus points to all registered gamer accounts directory as a festival gift or promotional reward!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDistributePoints(100)}
                      className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
                    >
                      +100 Points Free
                    </button>
                    <button
                      onClick={() => handleDistributePoints(500)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
                    >
                      +500 Points Free
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* 9. BROADCAST NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Store Broadcasts</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Post notification alert banners visible on the client home portal.</p>
                </div>

                {/* Form to add announcement */}
                <div className="bg-white border border-zinc-200/80 p-5 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-tight flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-500" />
                    Broadcast New System Banner
                  </h3>
                  <form onSubmit={handleAddAnnouncement} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-zinc-500">Banner Broadcast Text</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ⚠️ UPI auto-gateway is under maintenance from 1:00 AM to 3:00 AM"
                        value={newAnnMessage}
                        onChange={(e) => setNewAnnMessage(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-zinc-500">Banner Theme Color</label>
                        <select
                          value={newAnnType}
                          onChange={(e) => setNewAnnType(e.target.value as any)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none font-bold"
                        >
                          <option value="info">Blue (Standard Announcement)</option>
                          <option value="alert">Red (Critical Alert Notice)</option>
                          <option value="success">Green (Promotional / Holiday Greeting)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Publish Alert
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Active announcements */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase text-zinc-800 tracking-tight">Active Broadcast Queue</h4>
                  
                  {announcements.length === 0 ? (
                    <p className="text-xs text-zinc-400 font-bold">No active broadcast banners.</p>
                  ) : (
                    <div className="space-y-2">
                      {announcements.map((ann: any) => (
                        <div key={ann.id} className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 px-4 py-3 rounded-2xl">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              ann.type === 'alert' ? 'bg-red-500' :
                              ann.type === 'success' ? 'bg-emerald-500' :
                              'bg-blue-500'
                            }`}></span>
                            <span className="text-xs text-zinc-800 font-semibold">{ann.message}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              const updated = announcements.filter((a: any) => a.id !== ann.id);
                              setAnnouncements(updated);
                              localStorage.setItem('mb_announcements', JSON.stringify(updated));
                              triggerToast('Broadcast retired.');
                            }}
                            className="p-1 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 10. SUPPORT TICKETS TAB */}
            {activeTab === 'support' && (
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Customer Support</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Solve live simulated customer tickets, reply to queries instantly.</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs flex-1 grid grid-cols-1 md:grid-cols-3 min-h-[450px]">
                  
                  {/* Left Column: Tickets List */}
                  <div className="border-r border-zinc-100 p-4.5 space-y-3">
                    <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest pb-2 border-b border-zinc-100">Inbox Tickets</h3>
                    
                    <div className="space-y-2">
                      {supportTickets.map((tkt: any) => (
                        <button
                          key={tkt.id}
                          onClick={() => setActiveTicketId(tkt.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            activeTicketId === tkt.id
                              ? 'bg-blue-50/50 border-blue-200 shadow-3xs'
                              : 'border-zinc-100 hover:bg-zinc-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-zinc-900 text-xs">{tkt.user}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                              tkt.status === 'PENDING' ? 'bg-amber-100 text-amber-700 auto-pulse' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                              {tkt.status}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-500 truncate mt-1 font-medium">{tkt.msg}</p>
                          <span className="text-[9px] text-zinc-400 font-mono mt-2 block">{tkt.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Chat window */}
                  <div className="md:col-span-2 p-5 flex flex-col justify-between bg-zinc-50/30">
                    {activeTicketId ? (
                      (() => {
                        const ticket = supportTickets.find((t: any) => t.id === activeTicketId);
                        if (!ticket) return null;
                        return (
                          <div className="flex-1 flex flex-col justify-between">
                            
                            {/* Chat messages stream */}
                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2">
                              
                              {/* Ticket initiator message */}
                              <div className="flex gap-2.5 items-start">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                                  {ticket.user.charAt(0)}
                                </div>
                                <div className="bg-white border border-zinc-200 p-3 rounded-2xl rounded-tl-none max-w-md">
                                  <span className="text-[9.5px] font-black text-zinc-400 block mb-1">{ticket.user}</span>
                                  <p className="text-xs text-zinc-800 font-medium leading-relaxed">{ticket.msg}</p>
                                </div>
                              </div>

                              {/* Replies */}
                              {ticket.replies.map((reply: string, i: number) => (
                                <div key={i} className="flex gap-2.5 items-start justify-end">
                                  <div className="bg-zinc-900 text-white p-3 rounded-2xl rounded-tr-none max-w-md">
                                    <span className="text-[9.5px] font-black text-zinc-400 block mb-1">Alic Support (Admin)</span>
                                    <p className="text-xs font-semibold leading-relaxed">{reply}</p>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-[10px]">
                                    A
                                  </div>
                                </div>
                              ))}

                            </div>

                            {/* Ticket controls and response box */}
                            <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-zinc-200/80 flex items-center gap-2">
                              <input
                                type="text"
                                required
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Write helpful response to ${ticket.user}...`}
                                className="flex-1 bg-white border border-zinc-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-blue-500"
                              />
                              <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                Send Reply
                              </button>
                            </form>

                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <MessageSquare className="w-10 h-10 stroke-[1.5]" />
                        <span className="text-xs font-bold mt-2">Select a ticket from inbox to reply</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 11. LEGAL POLICIES EDITOR TAB */}
            {activeTab === 'legal' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Legal Policies</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Modify storefront customer terms and refund policies dynamically.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-5 rounded-3xl space-y-4 shadow-2xs">
                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 tracking-tight">Terms & Conditions Agreement Block</label>
                    <textarea
                      value={legalDocs.terms}
                      onChange={(e) => {
                        const updated = { ...legalDocs, terms: e.target.value };
                        setLegalDocs(updated);
                        localStorage.setItem('mb_legal_docs', JSON.stringify(updated));
                      }}
                      rows={5}
                      className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 tracking-tight">Refund & Chargeback Policy Block</label>
                    <textarea
                      value={legalDocs.refund}
                      onChange={(e) => {
                        const updated = { ...legalDocs, refund: e.target.value };
                        setLegalDocs(updated);
                        localStorage.setItem('mb_legal_docs', JSON.stringify(updated));
                      }}
                      rows={5}
                      className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 12. AI CHATBOT TEST PLAYGROUND TAB */}
            {activeTab === 'ai_chatbot' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">AI Advisor Playground</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Test simulated prompt behaviors of the game store AI bot.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-3xl space-y-4 shadow-2xs">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                    <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 font-medium leading-relaxed">
                      This playground tests the behavior guidelines of the store's custom assistant. Configure what tone, greeting and info guidelines the bot adheres to when helping storefront gamers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400">System Instruction Prompt</label>
                      <textarea
                        defaultValue="You are the custom digital assistant of Alic Digital Store owned by Mandip Mahato. Always speak in a polite, helpful manner. Assist clients with wallet balance inquiries, point loyalty conversions, and recommend popular game items like Free Fire diamonds."
                        rows={4}
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => triggerToast('AI Prompt Configuration updated in server config.')}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Update bot configuration
                  </button>
                </div>
              </div>
            )}

            {/* 13. SYSTEM SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">System Settings</h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure system credentials, storefront branding name, and contact info.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-xs font-black uppercase text-zinc-800 tracking-tight">General Branding</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono">Store Name Prefix</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value);
                          localStorage.setItem('mb_store_name', e.target.value);
                        }}
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono">Store Contact Email</label>
                      <input
                        type="email"
                        value={storeContact}
                        onChange={(e) => {
                          setStoreContact(e.target.value);
                          localStorage.setItem('mb_store_contact', e.target.value);
                        }}
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-red-600 tracking-tight">Change Admin Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono">New Password Credentials</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          localStorage.setItem('mb_admin_password', e.target.value);
                        }}
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => triggerToast('Admin credentials secured successfully.')}
                    className="w-full bg-zinc-950 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Secure Password
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* CREATE/EDIT PRODUCT MODAL OVERLAY */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-zinc-200 w-full max-w-lg shadow-2xl overflow-hidden my-8"
          >
            {/* Modal header */}
            <div className="bg-zinc-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight">
                  {editingProduct ? 'Edit Store Item' : 'Add New Catalog Item'}
                </h3>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body Form */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs font-medium max-h-[80vh] overflow-y-auto">
              
              {/* Product ID & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Unique ID (Alphanumeric)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="e.g. pubg-new-uc"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Store Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500 font-extrabold"
                  >
                    <option value="top-up">Top Up</option>
                    <option value="voucher">Voucher</option>
                    <option value="subscription">Subscription</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              </div>

              {/* Title & Provider */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Fortnite V-Bucks"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Game Provider / Brand</label>
                  <input
                    type="text"
                    required
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    placeholder="e.g. Epic Games"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Input details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Client ID Input Label</label>
                  <input
                    type="text"
                    required
                    value={formInputLabel}
                    onChange={(e) => setFormInputLabel(e.target.value)}
                    placeholder="e.g. Player ID / UID"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Client ID Input Placeholder</label>
                  <input
                    type="text"
                    required
                    value={formInputPlaceholder}
                    onChange={(e) => setFormInputPlaceholder(e.target.value)}
                    placeholder="e.g. e.g. 5129384732"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Min Amount (NPR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none font-bold text-zinc-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Max Amount (NPR)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formMaxAmount}
                    onChange={(e) => setFormMaxAmount(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none font-bold text-zinc-800"
                  />
                </div>
              </div>

              {/* Image URL & Icons */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Logo Image URL</label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://example.com/logo.jpg"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Icon Fallback style</label>
                  <select
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  >
                    <option value="gamepad">Gamepad</option>
                    <option value="phone">Phone / Mobile</option>
                    <option value="tv">Television / Stream</option>
                    <option value="layers">Layers / Design</option>
                    <option value="shopping">Shopping / Voucher</option>
                    <option value="wifi">Wifi / Net</option>
                  </select>
                </div>
              </div>

              {/* Popular Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popular-box"
                  checked={formPopular}
                  onChange={(e) => setFormPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300 cursor-pointer"
                />
                <label htmlFor="popular-box" className="text-[11px] font-extrabold text-zinc-700 cursor-pointer select-none">
                  Display as Popular product in home slide lists (★ Popular banner)
                </label>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider py-3 rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  Save Store Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
