import { useState, useMemo, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Gamepad,
  Tv,
  Music,
  Search,
  Plus,
  X,
  Wallet,
  Wifi,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  Check,
  ReceiptText,
  Clock,
  AlertCircle,
  Layers,
  Heart,
  User,
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import { Category, Product, Transaction } from './types';
import { ALL_PRODUCTS, PROMO_BANNERS } from './data';

export default function App() {
  // STATE MANAGEMENT
  const [walletBalance, setWalletBalance] = useState<number>(2450);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation states
  const [activeBottomNav, setActiveBottomNav] = useState<'home' | 'orders' | 'wallet' | 'favorites' | 'profile'>('home');
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<string>('');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(0);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  
  // Wallet top-up state
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [customWalletAdd, setCustomWalletAdd] = useState<string>('');
  
  // Success states
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // Active Promo Index for the main slider
  const [promoIndex, setPromoIndex] = useState<number>(0);

  // Error notifications
  const [modalError, setModalError] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Transaction History
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-202601',
      productId: 'ff-diamonds',
      productName: 'Free Fire 1000+100 Diamonds',
      provider: 'Garena Free Fire',
      category: 'top-up',
      amount: 780,
      timestamp: '2026-06-20 05:12',
      status: 'SUCCESS',
      targetAccount: 'UID: 928348293'
    },
    {
      id: 'tx-202602',
      productId: 'netflix',
      productName: 'Netflix Premium Ultra VIP',
      provider: 'Netflix Inc.',
      category: 'subscription',
      amount: 649,
      timestamp: '2026-06-19 18:45',
      status: 'SUCCESS',
      targetAccount: 'profile@netflix.com'
    }
  ]);

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['ff-diamonds', 'netflix']);

  // toggle favorite
  const toggleFavorite = (productId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (favoriteIds.includes(productId)) {
      setFavoriteIds(favoriteIds.filter(id => id !== productId));
      triggerToast('Removed from favorites');
    } else {
      setFavoriteIds([...favoriteIds, productId]);
      triggerToast('Added to favorites!');
    }
  };

  // Helper helper to draw corresponding icon
  const renderProductIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'phone':
        return <Phone className={className} />;
      case 'gamepad':
        return <Gamepad className={className} />;
      case 'tv':
        return <Tv className={className} />;
      case 'music':
        return <Music className={className} />;
      case 'wifi':
        return <Wifi className={className} />;
      case 'layers':
        return <Layers className={className} />;
      default:
        return <Ticket className={className} />;
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle clicking a category tab
  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
  };

  // Open transaction/product checkout modal
  const openCheckout = (product: Product) => {
    setSelectedProduct(product);
    setCheckoutTarget('');
    setModalError('');
    
    // Set default standard amount
    if (product.fixedAmounts && product.fixedAmounts.length > 0) {
      setCheckoutAmount(product.popularAmount || product.fixedAmounts[0]);
    } else {
      setCheckoutAmount(product.popularAmount || product.minAmount);
    }
    setCustomAmountText(product.popularAmount ? product.popularAmount.toString() : product.minAmount.toString());
  };

  // Handle custom manual balance amount
  const handleCustomAmountChange = (text: string, product: Product) => {
    setCustomAmountText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      setCheckoutAmount(num);
    } else {
      setCheckoutAmount(0);
    }
  };

  // Process transaction
  const executeRecharge = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Validation
    if (!checkoutTarget.trim()) {
      setModalError(`Please fill in the required ${selectedProduct.inputLabel.toLowerCase()} fields.`);
      return;
    }

    if (checkoutAmount <= 0) {
      setModalError('Enter or choose a valid positive topup amount.');
      return;
    }

    if (checkoutAmount < selectedProduct.minAmount) {
      setModalError(`Minimum recharge amount is Rs. ${selectedProduct.minAmount}`);
      return;
    }

    if (selectedProduct.maxAmount && checkoutAmount > selectedProduct.maxAmount) {
      setModalError(`Maximum limit allowed is Rs. ${selectedProduct.maxAmount}`);
      return;
    }

    // Check balance
    if (walletBalance < checkoutAmount) {
      setModalError(`Insufficient funds in wallet! Your balance is Rs. ${walletBalance}. Click "Wallet" in the top right to refill.`);
      return;
    }

    // Success flow! Deduct balance and create transaction
    const newBalance = walletBalance - checkoutAmount;
    setWalletBalance(newBalance);

    // Create unique pin for vouchers
    const pinString = (selectedProduct.category === 'voucher' || selectedProduct.category === 'vouchers')
      ? `PIN-${Math.floor(10000000 + Math.random() * 90000000)}` 
      : undefined;

    const newTx: Transaction = {
      id: `tx-${Math.floor(100000 + Math.random() * 900000)}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      provider: selectedProduct.provider,
      category: selectedProduct.category,
      amount: checkoutAmount,
      targetAccount: checkoutTarget,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SUCCESS',
      pinCode: pinString
    };

    setTransactions([newTx, ...transactions]);
    setLastCompletedTransaction(newTx);
    setSelectedProduct(null); // Close modal
    setShowSuccessOverlay(true); // Open success overlay
    triggerToast('Purchase request approved successfully!');
  };

  // Trigger brief alert messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle addition to wallet balance
  const handleLoadWallet = (e: FormEvent) => {
    e.preventDefault();
    const cleanAmt = parseInt(customWalletAdd, 10);
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      setWalletError('Please input a valid amount (greater than zero).');
      return;
    }
    
    setWalletBalance(prev => prev + cleanAmt);
    setCustomWalletAdd('');
    setShowWalletModal(false);
    triggerToast(`Added Rs. ${cleanAmt} to your Wallet!`);
  };

  const loadPresetWallet = (amt: number) => {
    setWalletBalance(prev => prev + amt);
    setShowWalletModal(false);
    triggerToast(`Added Rs. ${amt} to Wallet Balance!`);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans pb-28 selection:bg-blue-600 selection:text-white">
      
      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white rounded-full shadow-lg px-6 py-3 flex items-center gap-3 text-xs font-semibold border border-zinc-800"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP COMPACT BRAND HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo element representing MB GAMING */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedCategory('all')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-black tracking-tighter">MB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-[#2563eb] font-display tracking-tight leading-none">
                MB GAMING
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 leading-none">
                S h o p
              </span>
            </div>
          </div>

          {/* Right Area: Blue Wallet Outline Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowWalletModal(true); setWalletError(''); }}
              className="px-4 py-1.5 rounded-full border border-blue-500 hover:bg-blue-50/50 text-blue-600 flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet</span>
              <span className="ml-1 px-1.5 py-0.2 bg-blue-550/10 text-[10px] rounded font-mono font-bold text-blue-600">
                Rs.{walletBalance}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {activeBottomNav === 'home' && (
          <>
            {/* WEEKEND SPECIAL PROMO SLIDER BANNER WITH CRYSTALS/DIAMONDS (EXACT LOOK & FEEL) */}
            <section className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white min-h-[300px] sm:min-h-[330px] flex items-center shadow-lg border border-zinc-800">
              
              {/* STYLISH CSS CYG/BLUE DEEP GLOWING DIOMANDS AND PARTICLES EMULATION */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black pointer-events-none" />
              
              {/* Glowing emerald orb */}
              <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              {/* Glowing cyan orb */}
              <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              
              {/* Custom floating gemstone mockups matching the screenshot's crystal theme */}
              <div className="absolute right-[12%] top-[15%] w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-60 rounded-lg blur-[1px] rotate-45 transform animate-bounce duration-500 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <div className="absolute right-[8%] bottom-[20%] w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-70 rounded-tr-3xl rotate-12 blur-[1px] pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
              <div className="absolute left-[8%] bottom-[12%] w-10 h-10 bg-gradient-to-tr from-purple-400 to-pink-500 opacity-50 rounded-xl rotate-[35deg] pointer-events-none animate-pulse" />
              <div className="absolute right-[25%] top-[10%] w-6 h-6 bg-cyan-300 opacity-40 rounded-full blur-md pointer-events-none" />
              <div className="absolute right-[32%] bottom-[12%] w-8 h-8 bg-blue-300 opacity-30 rounded-bl-xl rotate-45 pointer-events-none" />

              {/* Glowing cyan/green visual framing boxes */}
              <div className="absolute top-[12%] left-[10%] right-[10%] bottom-[12%] border border-cyan-500/10 rounded-2xl pointer-events-none" />
              <div className="absolute top-[15%] left-[12%] right-[12%] bottom-[15%] border border-emerald-500/10 rounded-2xl pointer-events-none" />

              {/* Text Content */}
              <div className="relative z-10 px-8 sm:px-14 py-12 max-w-lg space-y-4">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                  {PROMO_BANNERS[promoIndex].title}
                </h3>
                
                {PROMO_BANNERS[promoIndex].subTitle && (
                  <p className="text-sm font-bold tracking-widest text-[#a5f3fc] uppercase leading-none font-mono">
                    {PROMO_BANNERS[promoIndex].subTitle}
                  </p>
                )}

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                  {PROMO_BANNERS[promoIndex].tagline}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedCategory('top-up');
                      triggerToast('Filtered for in-game topups!');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-extrabold tracking-wider uppercase transition-all shadow-md active:scale-95"
                  >
                    🚀 {PROMO_BANNERS[promoIndex].buttonText}
                  </button>
                </div>
              </div>

              {/* Left Slider Arrow Navigation */}
              <button
                onClick={() => setPromoIndex(prev => (prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none"
                aria-label="Previous Promo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Slider Arrow Navigation */}
              <button
                onClick={() => setPromoIndex(prev => (prev === PROMO_BANNERS.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none"
                aria-label="Next Promo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Exact Slide Indicators at bottom center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {PROMO_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromoIndex(idx)}
                    className={`h-2 transition-all duration-300 rounded-full ${idx === promoIndex ? 'w-6 bg-blue-500' : 'w-2 bg-zinc-600'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </section>

            {/* FULLY COVERED SEARCH BOX CONTAINER */}
            <section className="bg-white rounded-2xl p-1 shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-zinc-150">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games, vouchers, subscriptions..."
                  className="w-full text-sm placeholder:text-zinc-400 text-zinc-900 pl-12 pr-10 py-3.5 bg-transparent rounded-2xl border-none focus:outline-none font-medium"
                />
                <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-zinc-300 hover:text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>

            {/* POPULAR BADGE NOTIFIER */}
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="h-0.5 flex-grow bg-zinc-100" />
              <span className="text-amber-500 text-xs font-black tracking-widest uppercase flex items-center gap-1">
                🔥 POPULAR NOW 🔥
              </span>
              <div className="h-0.5 flex-grow bg-zinc-100" />
            </div>

            {/* ALL CAPSULE CATEGORIES COVERED IN BOX (As on alicdigitalshop.com) */}
            <section className="bg-white p-1 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
                
                {/* ALL Button Tab */}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  ALL
                </button>

                {/* TOP-UP Button Tab */}
                <button
                  onClick={() => handleCategoryChange('top-up')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'top-up'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  TOP-UP
                </button>

                {/* VOUCHER Button Tab */}
                <button
                  onClick={() => handleCategoryChange('voucher')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'voucher'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  VOUCHER
                </button>

                {/* SUBSCRIPTION Button Tab */}
                <button
                  onClick={() => handleCategoryChange('subscription')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'subscription'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  SUBSCRIPTION
                </button>

                {/* DESIGN Button Tab */}
                <button
                  onClick={() => handleCategoryChange('design')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'design'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  DESIGN
                </button>

                {/* VOUCHERS alternative Button Tab */}
                <button
                  onClick={() => handleCategoryChange('vouchers')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl text-center whitespace-nowrap transition-all uppercase cursor-pointer ${
                    selectedCategory === 'vouchers'
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border border-zinc-200'
                  }`}
                >
                  VOUCHERS
                </button>

              </div>
            </section>


          </>
        )}

        {/* ORDERS VIEW */}
        {activeBottomNav === 'orders' && (
          <section className="bg-white rounded-2xl p-5 border border-zinc-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 uppercase tracking-tight">Order Logs & History</h3>
                <p className="text-xs text-zinc-400">Status of your recharge commands</p>
              </div>
              <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded font-bold uppercase tracking-wider">
                Authorized Secure
              </div>
            </div>

            {transactions.length > 0 ? (
              <div className="divide-y divide-zinc-105">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700 mt-0.5">
                        <ReceiptText className="w-4.5 h-4.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-zinc-900 uppercase">{tx.productName}</span>
                          <span className="text-[9px] font-mono bg-zinc-105 text-zinc-500 font-bold px-1.5 py-0.2 rounded">
                            {tx.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-400">
                          <span className="font-mono font-bold bg-zinc-50 px-1 py-0.1 rounded text-zinc-650 select-all">{tx.targetAccount}</span>
                          <span>•</span>
                          <span>{tx.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 self-stretch sm:self-center">
                      <div className="text-left sm:text-right">
                        <span className="block text-xs font-mono font-extrabold text-zinc-900">
                          Rs. {tx.amount}
                        </span>
                        {tx.pinCode && (
                          <span className="text-[9px] font-bold text-blue-600 underline cursor-pointer select-all" title="Copy code">
                            CODE: {tx.pinCode}
                          </span>
                        )}
                      </div>
                      <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded font-bold flex items-center gap-1 border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>DISPATCHED</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400">
                <ReceiptText className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-700">No Orders Placed Yet</p>
                <p className="text-[10px] text-zinc-400 mt-1">Refill is empty. Order some game diamonds or top-ups below!</p>
              </div>
            )}
          </section>
        )}

        {/* WALLET MANUAL CONTROLS VIEW */}
        {activeBottomNav === 'wallet' && (
          <section className="bg-white rounded-2xl p-6 border border-zinc-200/80 space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 uppercase">Interactive Wallet Panel</h3>
              <p className="text-xs text-zinc-400">Simulate cash addition to top-up orders instantly</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Left Display card */}
              <div className="bg-zinc-950 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent pointer-events-none rounded-bl-full" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase">PRE-PAID APP WALLET</span>
                  <Wallet className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight leading-none block">
                    Rs. {walletBalance}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-2">● Online Verification Connected</span>
                </div>
              </div>

              {/* Right Presets and Quick tools */}
              <div className="space-y-4">
                <span className="block text-xs font-extrabold text-zinc-400">LOAD EXTRA CREDIT</span>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => {
                        setWalletBalance(prev => prev + amt);
                        triggerToast(`Added Rs. ${amt} via simulated UPI bank transfer!`);
                      }}
                      className="py-2.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-950 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                    >
                      + Rs. {amt}
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const amtVal = parseInt(customWalletAdd, 10);
                  if (!isNaN(amtVal) && amtVal > 0) {
                    setWalletBalance(prev => prev + amtVal);
                    setCustomWalletAdd('');
                    triggerToast(`Added Rs. ${amtVal} from virtual gateway!`);
                  }
                }} className="flex gap-2">
                  <input
                    type="number"
                    value={customWalletAdd}
                    onChange={(e) => setCustomWalletAdd(e.target.value)}
                    placeholder="Other cash amount..."
                    className="flex-grow px-3.5 py-2 bg-zinc-50 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-400 font-bold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                  >
                    Add Cash
                  </button>
                </form>
              </div>

            </div>
          </section>
        )}

        {/* FAVORITES VIEW */}
        {activeBottomNav === 'favorites' && (
          <section className="bg-white rounded-2xl p-5 border border-zinc-200/80 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 uppercase">My Favorites List</h3>
              <p className="text-xs text-zinc-400">Quick access pins for items you recharge often</p>
            </div>

            {favoriteIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALL_PRODUCTS.filter(p => favoriteIds.includes(p.id)).map(product => (
                  <div
                    key={product.id}
                    onClick={() => openCheckout(product)}
                    className="bg-white border border-zinc-200 hover:border-blue-500 cursor-pointer p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-tr ${product.imagePlaceholderColor} text-white`}>
                        {renderProductIcon(product.iconName, "w-4 h-4")}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-900 uppercase leading-none">{product.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">{product.provider}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="p-1 px-1.5 text-xs text-red-500 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400">
                <Heart className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-700">Favorites list is empty</p>
                <p className="text-[10px] text-zinc-400 mt-1">Tap the heart symbol next to any system credit or game in the catalog!</p>
              </div>
            )}
          </section>
        )}

        {/* USER PROFILE INFO VIEW */}
        {activeBottomNav === 'profile' && (
          <section className="bg-white rounded-2xl p-6 border border-zinc-200/80 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-250 flex items-center justify-center text-blue-600">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase">Verified Member Account</h3>
                <p className="text-xs font-mono text-zinc-400">CLIENT_ID: AD-902348-NEPAL</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-none">Primary Wallet</span>
                <span className="text-sm font-bold text-zinc-800 font-mono">Rs. {walletBalance}</span>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-none">Completed Recharges</span>
                <span className="text-sm font-bold text-zinc-800 font-mono">{transactions.length} orders</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="block text-[10px] font-bold text-zinc-400 tracking-wider">GATEWAY CERTIFICATION STATUS</span>
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-between border border-emerald-150">
                <span>Auto-Recharge API Status</span>
                <span className="font-extrabold text-[10px] bg-emerald-600 text-white rounded px-2 py-0.5">ONLINE</span>
              </div>
            </div>
          </section>
        )}

      </main>



      {/* FIXED FLOATING STEADY BOTTOM NAVIGATION BAR (As on alicdigitalshop.com) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-150 px-4 py-2 flex items-center justify-center shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        <div className="w-full max-w-lg flex items-center justify-between">
          
          {/* Home Option */}
          <button
            onClick={() => setActiveBottomNav('home')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'home' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeBottomNav === 'home' ? 'bg-blue-50 text-blue-600' : ''}`}>
              <Gamepad className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Orders Option */}
          <button
            onClick={() => setActiveBottomNav('orders')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'orders' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeBottomNav === 'orders' ? 'bg-blue-50 text-blue-600' : ''}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Orders</span>
          </button>

          {/* Wallet Option */}
          <button
            onClick={() => {
              setActiveBottomNav('wallet');
              setShowWalletModal(false);
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'wallet' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeBottomNav === 'wallet' ? 'bg-blue-50 text-blue-600' : ''}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Wallet</span>
          </button>

          {/* Favorites Option */}
          <button
            onClick={() => setActiveBottomNav('favorites')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'favorites' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeBottomNav === 'favorites' ? 'bg-blue-50 text-blue-600' : ''}`}>
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Favorites</span>
          </button>

          {/* Profile Option */}
          <button
            onClick={() => setActiveBottomNav('profile')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'profile' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-650'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeBottomNav === 'profile' ? 'bg-blue-50 text-blue-600' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>

        </div>
      </div>

      {/* POPUP 1: RELOAD WALLET CASH MODAL */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletModal(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-2xl w-full max-w-md p-6 relative z-10 space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-50 text-zinc-800 rounded-xl border border-zinc-150">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-zinc-900 uppercase">Refill Active Balance</h4>
                    <p className="text-xs text-zinc-400">Instantly credit via virtual gateway</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="p-1 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {walletError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-650">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{walletError}</span>
                </div>
              )}

              {/* Preset quick adding choices */}
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase">CHOOSE PRE-SET</span>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 500, 1000, 2000, 5000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => loadPresetWallet(num)}
                      className="py-2.5 text-xs font-bold font-mono text-zinc-700 bg-zinc-50 hover:bg-blue-600 hover:text-white border border-zinc-200 rounded-xl transition-all cursor-pointer"
                    >
                      + Rs. {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual input */}
              <form onSubmit={handleLoadWallet} className="space-y-4 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold text-zinc-400 mb-1.5 uppercase" htmlFor="custom-wallet-input">
                    CUSTOM RS. AMOUNT TO ADD
                  </label>
                  <div className="relative">
                    <input
                      id="custom-wallet-input"
                      type="number"
                      min="1"
                      required
                      value={customWalletAdd}
                      onChange={(e) => setCustomWalletAdd(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-500 transition-all"
                    />
                    <span className="text-xs font-bold text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">
                      Rs.
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWalletModal(false)}
                    className="flex-1 py-3 bg-zinc-50 text-zinc-700 hover:bg-zinc-105 text-xs font-bold rounded-xl border border-zinc-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                  >
                    Confirm Recharge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: PRODUCT CHECKOUT DRAWER / MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-2xl w-full max-w-lg p-6 relative z-10 space-y-6"
            >
              {/* Product Header details */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${selectedProduct.imagePlaceholderColor} text-white shadow-sm`}>
                    {renderProductIcon(selectedProduct.iconName, "w-5 h-5")}
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block leading-none mb-1">
                      {selectedProduct.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 uppercase">{selectedProduct.name}</h4>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-1 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-xs text-red-655 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Form container */}
              <form onSubmit={executeRecharge} className="space-y-4">
                
                {/* Account identifier */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase" htmlFor="checkout-target-acc">
                    {selectedProduct.inputLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-target-acc"
                    type="text"
                    required
                    value={checkoutTarget}
                    onChange={(e) => setCheckoutTarget(e.target.value)}
                    placeholder={selectedProduct.inputPlaceholder}
                    className="w-full text-xs font-medium px-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 transition-all"
                  />
                  <p className="text-[9px] text-zinc-400 mt-1">Please ensure correctness. Recharges execute instantly and cannot be reversed.</p>
                </div>

                {/* Amount selection block */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">
                    SELECT PACKAGE BUNDLE / AMOUNT
                  </label>
                  
                  {selectedProduct.fixedAmounts ? (
                    /* Render fixed amount chips if they exist */
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.fixedAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setCheckoutAmount(amt);
                            setCustomAmountText(amt.toString());
                          }}
                          className={`py-3 rounded-xl text-xs font-bold font-mono transition-all border outline-none cursor-pointer ${
                            checkoutAmount === amt
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          Rs. {amt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Flexible input */
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {[100, 250, 500, 1000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setCheckoutAmount(preset);
                              setCustomAmountText(preset.toString());
                            }}
                            className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                              checkoutAmount === preset
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            Rs. {preset}
                          </button>
                        ))}
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={customAmountText}
                          onChange={(e) => handleCustomAmountChange(e.target.value, selectedProduct)}
                          placeholder={`Enter Rs. between ${selectedProduct.minAmount} and ${selectedProduct.maxAmount || '5000'}`}
                          className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 transition-all font-mono"
                        />
                        <span className="text-xs font-bold text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">
                          Rs.
                        </span>
                      </div>
                      <span className="block text-[9px] font-bold text-zinc-400 leading-none">
                        Range: Rs. {selectedProduct.minAmount} to Rs. {selectedProduct.maxAmount || '5,000'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sub Total summary bill */}
                <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Plan Item:</span>
                    <span className="font-bold text-zinc-800 uppercase">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Processor Handing fee:</span>
                    <span className="text-emerald-600 font-bold uppercase">Rs. 0 (FREE)</span>
                  </div>
                  <div className="h-px bg-zinc-200 my-1" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-900 uppercase">Estimated Total Cost:</span>
                    <span className="font-mono font-bold text-zinc-900 text-sm">
                      Rs. {checkoutAmount}
                    </span>
                  </div>
                </div>

                {/* Confirm Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-3.5 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 text-xs font-bold rounded-xl border border-zinc-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-blue-600 text-white hover:bg-blue-500 text-xs font-extrabold uppercase tracking-wide rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Rs. {checkoutAmount}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 3: TRANSACTION SUCCESS OVERLAY */}
      <AnimatePresence>
        {showSuccessOverlay && lastCompletedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessOverlay(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white border border-zinc-200 outline-none shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden relative z-10"
            >
              {/* Blue / Emerald Accent Badge Header */}
              <div className="bg-gradient-to-br from-zinc-900 to-black text-white text-center py-7 px-4 space-y-1 relative">
                <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-white shadow-inner mb-2.5">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#a5f3fc] block font-mono">
                  PAYMENT SUCCESSFUL
                </span>
                <h4 className="text-lg font-extrabold uppercase tracking-tight">Recharge Sent</h4>
                <p className="text-[10px] text-zinc-400">ID: {lastCompletedTransaction.id}</p>
              </div>

              {/* Recipient breakdown details */}
              <div className="p-6 space-y-4">
                
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-450">
                    <span>Target UID/Identifier</span>
                    <span className="font-extrabold text-zinc-900 font-mono select-all">{lastCompletedTransaction.targetAccount}</span>
                  </div>
                  <div className="flex justify-between text-zinc-450">
                    <span>Service Operator</span>
                    <span className="font-bold text-zinc-900 uppercase">{lastCompletedTransaction.provider}</span>
                  </div>
                  <div className="flex justify-between text-zinc-450">
                    <span>Operator Bundle</span>
                    <span className="font-bold text-zinc-900 text-right max-w-[170px] truncate">{lastCompletedTransaction.productName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-450">
                    <span>Confirmed Time</span>
                    <span className="font-medium text-zinc-650">{lastCompletedTransaction.timestamp}</span>
                  </div>
                  
                  {lastCompletedTransaction.pinCode && (
                    <div className="p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-250 space-y-1 text-center mt-3">
                      <span className="block text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">YOUR SECRET PIN CODE</span>
                      <span className="block text-sm font-mono font-bold tracking-wider text-blue-600 select-all">{lastCompletedTransaction.pinCode}</span>
                      <span className="block text-[8px] text-zinc-400">Apply this pin on your game console or account.</span>
                    </div>
                  )}

                  <div className="h-px bg-zinc-100 my-2" />

                  <div className="flex justify-between items-center bg-blue-50/40 p-3 rounded-xl border border-blue-100/50">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800 font-bold text-[10px] uppercase">Deducted Wallet Amount</span>
                    </div>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      Rs. {lastCompletedTransaction.amount}
                    </span>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => setShowSuccessOverlay(false)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Dismiss Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
