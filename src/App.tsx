import { useState, useMemo, FormEvent, MouseEvent, useEffect } from 'react';
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
  ArrowUpRight,
  ArrowUp,
  ArrowLeft,
  Pencil,
  Link,
  Bell,
  MessageSquare,
  Gift,
  Settings,
  FileText,
  RotateCcw,
  XCircle,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Category, Product, Transaction } from './types';
import { ALL_PRODUCTS, PROMO_BANNERS } from './data';
import AdminPanel from './components/AdminPanel';


export default function App() {
  // STATE MANAGEMENT
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mb_gaming_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return ALL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('mb_gaming_products', JSON.stringify(products));
  }, [products]);

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('mb_gaming_wallet');
    return saved ? Number(saved) : 2450;
  });

  useEffect(() => {
    localStorage.setItem('mb_gaming_wallet', walletBalance.toString());
  }, [walletBalance]);
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

  // Scroll to Top state & logic
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Immediately hide arrow during active scrolling (either direction)
      setShowScrollToTop(false);

      clearTimeout(scrollTimeout);
      // ONLY show arrow when the user has stopped scrolling (for 400ms) and is past 300px
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 300) {
          setShowScrollToTop(true);
        }
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Error notifications
  const [modalError, setModalError] = useState<string>('');
  const [walletError, setWalletError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Transaction History
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mb_gaming_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'tx-202601',
        productId: 'garena-freefire',
        productName: 'Garena Free Fire Diamonds',
        provider: 'Garena',
        category: 'top-up',
        amount: 499,
        timestamp: '2026-06-20 05:12',
        status: 'SUCCESS',
        targetAccount: 'UID: 928348293'
      },
      {
        id: 'tx-202602',
        productId: 'netflix-sub-card',
        productName: 'Netflix Premium Subscription Room',
        provider: 'Netflix Inc.',
        category: 'subscription',
        amount: 649,
        timestamp: '2026-06-19 18:45',
        status: 'SUCCESS',
        targetAccount: 'profile@netflix.com'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mb_gaming_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Favorites state
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['garena-freefire', 'pubg-mobile-uc']);

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
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Memoized favorited products
  const favoritedProducts = useMemo(() => {
    return products.filter(p => favoriteIds.includes(p.id));
  }, [products, favoriteIds]);

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
      status: 'PENDING',
      pinCode: pinString
    };

    setTransactions([newTx, ...transactions]);
    setLastCompletedTransaction(newTx);
    setSelectedProduct(null); // Close modal
    setShowSuccessOverlay(true); // Open success overlay
    triggerToast('Purchase request submitted for administrator review!');
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

  // Router check for Admin Panel
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    return path === '/admin' || window.location.hash === '#/admin';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      setIsAdminRoute(path === '/admin' || window.location.hash === '#/admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  if (isAdminRoute) {
    return (
      <AdminPanel
        products={products}
        setProducts={setProducts}
        transactions={transactions}
        setTransactions={setTransactions}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        onClose={() => {
          window.history.pushState({}, '', '/');
          const navEvent = new PopStateEvent('popstate');
          window.dispatchEvent(navEvent);
        }}
      />
    );
  }

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
            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-sm shrink-0">
              <img 
                src="https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg" 
                alt="MB GAMING STORE Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-zinc-950 font-display tracking-tight leading-none">
                MB GAMING
              </span>
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider mt-0.5 leading-none">
                S T O R E
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
            {/* WEEKEND SPECIAL PROMO SLIDER BANNER WITH CRYSTALS/DIAMONDS (SMALL COMPACT REFRESHED HEIGHT) */}
            <section className="relative overflow-hidden rounded-[24px] bg-neutral-950 text-white h-[140px] sm:h-[170px] flex items-center shadow-md border border-zinc-900">
              
              {/* STYLISH CSS CYG/BLUE DEEP GLOWING DIAMONDS AND PARTICLES EMULATION */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black pointer-events-none" />
              
              {/* Glowing emerald orb */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
              {/* Glowing cyan orb */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              
              {/* Custom floating gemstone mockups scaled down to fit smaller banner */}
              <div className="absolute right-[15%] top-[25%] w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-60 rounded-lg blur-[1px] rotate-45 transform pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.4)] animate-pulse" />
              <div className="absolute right-[8%] bottom-[15%] w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-50 rounded-tr-2xl rotate-12 blur-[1px] pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
              
              {/* Text Content */}
              <div className="relative z-10 px-6 sm:px-12 py-3 sm:py-5 max-w-md sm:max-w-xl space-y-1.5 sm:space-y-2">
                {PROMO_BANNERS[promoIndex].subTitle && (
                  <span className="inline-block text-[9px] font-bold tracking-widest text-blue-400 uppercase leading-none font-mono">
                    {PROMO_BANNERS[promoIndex].subTitle}
                  </span>
                )}
                
                <h3 className="text-base sm:text-xl md:text-2xl font-black font-display tracking-tight text-white leading-tight">
                  {PROMO_BANNERS[promoIndex].title}
                </h3>

                <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed max-w-[280px] sm:max-w-md line-clamp-1 sm:line-clamp-2">
                  {PROMO_BANNERS[promoIndex].tagline}
                </p>

                <div className="pt-1">
                  <button 
                    onClick={() => {
                      setSelectedCategory('top-up');
                      triggerToast('Filtered for in-game topups!');
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase transition-all shadow-md active:scale-95"
                  >
                    🚀 {PROMO_BANNERS[promoIndex].buttonText}
                  </button>
                </div>
              </div>

              {/* Left Slider Arrow Navigation */}
              <button
                onClick={() => setPromoIndex(prev => (prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1))}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none"
                aria-label="Previous Promo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Right Slider Arrow Navigation */}
              <button
                onClick={() => setPromoIndex(prev => (prev === PROMO_BANNERS.length - 1 ? 0 : prev + 1))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none"
                aria-label="Next Promo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Exact Slide Indicators at bottom center */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                {PROMO_BANNERS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromoIndex(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === promoIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-zinc-600'}`}
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

            {/* POPULAR NOW SECTION (Matching design/size requested, displaying popular products with horizontal scroll) */}
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-xs font-extrabold tracking-wider text-orange-600 uppercase flex items-center gap-1.5 font-display">
                  🔥 POPULAR NOW 🔥
                </span>
              </div>
              <div className="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-none px-1">
                {products.filter(product => product.popular).map((product) => (
                  <div
                    key={`popular-${product.id}`}
                    onClick={() => openCheckout(product)}
                    className="w-[135px] sm:w-[155px] shrink-0 group cursor-pointer bg-white border border-white hover:border-blue-500 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      {/* Upper image frame */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 relative border border-zinc-100 flex items-center justify-center shadow-sm">
                        {/* Heart favorite clicker */}
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm transition-all shadow-[0_1px_5px_rgba(0,0,0,0.04)] text-black focus:outline-none"
                          title="Favorite"
                        >
                          <Heart className={`w-3 h-3 transition-colors ${favoriteIds.includes(product.id) ? 'fill-red-500' : ''}`} />
                        </button>

                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-tr ${product.imagePlaceholderColor} text-white flex items-center justify-center`}>
                            {renderProductIcon(product.iconName, "w-6 h-6")}
                          </div>
                        )}
                      </div>

                      {/* Title Underneath */}
                      <div className="px-0.5">
                        <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 tracking-tight leading-snug text-left group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ALL CAPSULE CATEGORIES COVERED IN BOX (As on alicdigitalshop.com) */}
            <section className="bg-white p-1 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
                
                {/* ALL Button Tab */}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  ALL
                </button>

                {/* TOP-UP Button Tab */}
                <button
                  onClick={() => handleCategoryChange('top-up')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'top-up'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  TOP-UP
                </button>

                {/* VOUCHER Button Tab */}
                <button
                  onClick={() => handleCategoryChange('voucher')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'voucher'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  VOUCHER
                </button>

                {/* SUBSCRIPTION Button Tab */}
                <button
                  onClick={() => handleCategoryChange('subscription')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'subscription'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  SUBSCRIPTION
                </button>

                {/* DESIGN Button Tab */}
                <button
                  onClick={() => handleCategoryChange('design')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'design'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  DESIGN
                </button>

                {/* VOUCHERS alternative Button Tab */}
                <button
                  onClick={() => handleCategoryChange('vouchers')}
                  className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                    selectedCategory === 'vouchers'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                      : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                  }`}
                >
                  VOUCHERS
                </button>

              </div>
            </section>

            {/* PRODUCT CARD GRID (Matching screenshots precisely) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold tracking-wider uppercase text-zinc-400">
                  Products ({filteredProducts.length})
                </span>
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openCheckout(product)}
                      className="group cursor-pointer bg-white border border-white hover:border-blue-500 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="space-y-2.5">
                        {/* Upper image frame */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 relative border border-zinc-100 flex items-center justify-center shadow-sm">
                          
                          {/* Heart favorite clicker */}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm transition-all shadow-[0_1px_5px_rgba(0,0,0,0.04)] text-black focus:outline-none"
                            title="Favorite"
                          >
                            <Heart className={`w-3 h-3 transition-colors ${favoriteIds.includes(product.id) ? 'fill-red-500' : ''}`} />
                          </button>

                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-tr ${product.imagePlaceholderColor} text-white flex items-center justify-center`}>
                              {renderProductIcon(product.iconName, "w-6 h-6")}
                            </div>
                          )}
                        </div>

                        {/* Title Underneath */}
                        <div className="px-0.5">
                          <h4 className="text-[11px] sm:text-xs font-bold text-zinc-800 tracking-tight leading-snug text-left group-hover:text-blue-600 transition-colors line-clamp-2">
                            {product.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-zinc-150 rounded-3xl p-12 text-center text-zinc-500">
                  <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs font-bold text-zinc-800">No Services Available Currently</p>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">Try typing a different name or checking another category tab.</p>
                  <button 
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-sm"
                  >
                    Show All Catalog
                  </button>
                </div>
              )}
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
                      {(() => {
                        const associatedProduct = products.find(p => p.id === tx.productId);
                        return associatedProduct?.imageUrl ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-155 shrink-0 shadow-sm mt-0.5">
                            <img
                              src={associatedProduct.imageUrl}
                              alt={tx.productName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                            <ReceiptText className="w-4.5 h-4.5" />
                          </div>
                        );
                      })()}
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

            {favoritedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoritedProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => openCheckout(product)}
                    className="bg-white border border-zinc-200 hover:border-blue-500 cursor-pointer p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-150 shrink-0 shadow-sm">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`p-2.5 rounded-lg bg-gradient-to-tr ${product.imagePlaceholderColor} text-white shrink-0`}>
                          {renderProductIcon(product.iconName, "w-4 h-4")}
                        </div>
                      )}
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

        {/* USER PROFILE INFO VIEW (ACCORDING TO USER'S SCREENSHOTS) */}
        {activeBottomNav === 'profile' && (
          <div className="space-y-4">
            
            {/* Header top bar with Back Button */}
            <div className="flex items-center justify-between pb-2">
              <button 
                onClick={() => setActiveBottomNav('home')}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5">
                <User className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                <h3 className="text-base font-extrabold text-zinc-900 uppercase tracking-tight">Profile</h3>
              </div>
              <div className="w-8"></div> {/* Spacer to keep centered balance */}
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* User Profile Avatar Image from Unsplash */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 shadow-md">
                  <img 
                    src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80" 
                    alt="Abhishek Admin" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-zinc-800 leading-tight">Abhishek Admin</h4>
                  <p className="text-xs text-zinc-400 font-medium">abhisheknabik01@gmail.com</p>
                  
                  {/* Points Indicator with link icon */}
                  <div className="pt-1 flex items-center gap-1 text-blue-600 font-extrabold">
                    <Link className="w-3.5 h-3.5" />
                    <span className="text-[11px] hover:underline cursor-pointer">37903 Points</span>
                  </div>
                </div>
              </div>

              {/* Edit button with Pencil icon */}
              <button 
                onClick={() => triggerToast("Edit profile is restricted to administrators.")}
                className="w-8 py-1.5 rounded-lg border border-blue-105 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all flex items-center justify-center cursor-pointer"
                title="Edit Profile"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main Menu Links Grid */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-3.5 space-y-2.5">
              
              {/* Store Points Option */}
              <div className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                    <Link className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Store Points</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Balance: 37903 Points</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* My Orders Option */}
              <div 
                onClick={() => setActiveBottomNav('orders')}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100/50">
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">My Orders</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Track your purchases</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Favorites Option */}
              <div 
                onClick={() => setActiveBottomNav('favorites')}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/50">
                    <Heart className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Favorites</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Your favorite games</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Notifications */}
              <div 
                onClick={() => triggerToast("Your notifications are all up to date!")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Notifications</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Stay updated</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Support Chat */}
              <div 
                onClick={() => triggerToast("Connecting to live support chat...")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Support Chat</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Chat with our team</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Refer and earn */}
              <div 
                onClick={() => triggerToast("Get Rs. 50 bonus points upon inviting your first gamer friend!")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50">
                    <Gift className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Refer & Earn</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Share with friends & earn rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Settings */}
              <div 
                onClick={() => triggerToast("App settings are configured to optimal performance.")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center border border-zinc-150">
                    <Settings className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-zinc-800">Settings</h5>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">App preferences</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Admin Portal Shortcut */}
              <div 
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  const navEvent = new PopStateEvent('popstate');
                  window.dispatchEvent(navEvent);
                }}
                className="flex items-center justify-between p-2.5 bg-blue-50/40 hover:bg-blue-50 border border-blue-100/30 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center border border-blue-200/50">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-blue-950">Admin Portal 🔑</h5>
                    <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Manage products & orders</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>

            </div>

            {/* Legal Links section */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-3.5 space-y-2.5">
              <span className="block text-[9.5px] font-black text-zinc-400 px-2 tracking-wider uppercase">LEGAL</span>
              
              {/* Terms & Conditions */}
              <div 
                onClick={() => triggerToast("Displaying Terms & Conditions document...")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-150">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-850">Terms & Conditions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
              </div>

              {/* Refund Policy */}
              <div 
                onClick={() => triggerToast("Displaying Refund Policy details...")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-150">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-850">Refund Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
              </div>

              {/* Cancellation Policy */}
              <div 
                onClick={() => triggerToast("Displaying Cancellation Policy parameters...")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-150">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-850">Cancellation Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
              </div>

              {/* Privacy Policy */}
              <div 
                onClick={() => triggerToast("Displaying Privacy Policy details...")}
                className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-500 flex items-center justify-center border border-zinc-150">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-extrabold text-zinc-850">Privacy Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
              </div>

            </div>

            {/* Logout Row */}
            <div 
              onClick={() => {
                triggerToast("Session logged out successfully! Restarting profile context...");
              }}
              className="bg-rose-50 border border-rose-100 hover:bg-rose-100/50 rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all active:scale-99"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
                <LogOut className="w-5 h-5 shrink-0" />
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-black text-rose-700 leading-none">Logout</h5>
                <p className="text-[10px] text-rose-500 font-semibold">Sign out of your account</p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* SCROLL TO TOP BUTTON (Dynamic with smooth Framer Motion transition) */}
      <AnimatePresence>
        {showScrollToTop && activeBottomNav === 'home' && (
          <motion.button
            id="scroll-to-top-btn"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-5 sm:right-8 z-45 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-2xl border border-blue-500 cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>


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
