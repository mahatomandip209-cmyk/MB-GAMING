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
  EyeIcon
} from 'lucide-react';
import { Product, Transaction } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export default function AdminPanel({
  products,
  setProducts,
  transactions,
  setTransactions,
  walletBalance,
  setWalletBalance,
  onClose
}: AdminPanelProps) {
  // Authentication & Recovery states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('mb_admin_logged_in') === 'true';
  });
  
  // Forgot Password flow states: 'login' | 'forgot_email' | 'enter_code' | 'reset_password' | 'reset_success'
  const [authStep, setAuthStep] = useState<'login' | 'forgot_email' | 'enter_code' | 'reset_password' | 'reset_success'>('login');
  const [recoveryEmail, setRecoveryEmail] = useState('mandipmahato95@gmail.com');
  const [codeInputValue, setCodeInputValue] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Errors & success
  const [loginError, setLoginError] = useState('');
  const [resetError, setResetError] = useState('');
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Admin Dashboard views: 'dashboard' | 'products' | 'transactions' | 'wallet'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'transactions' | 'wallet'>('dashboard');

  // Product editing/creation states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formCategory, setFormCategory] = useState<'top-up' | 'voucher' | 'subscription' | 'design' | 'vouchers'>('top-up');
  const [formMinAmount, setFormMinAmount] = useState<number>(100);
  const [formMaxAmount, setFormMaxAmount] = useState<number>(5000);
  const [formInputLabel, setFormInputLabel] = useState('Player Account UID');
  const [formInputPlaceholder, setFormInputPlaceholder] = useState('e.g. 123456789');
  const [formIconName, setFormIconName] = useState<'phone' | 'gamepad' | 'tv' | 'music' | 'shopping' | 'wifi' | 'layers'>('gamepad');
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
    triggerToast('Logged out successfully.');
  };

  // Code generation & sending securely
  const sendVerificationCode = async () => {
    setIsSendingCode(true);
    setResetError('');
    try {
      const res = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep('enter_code');
        triggerToast('Verification code sent to mandipmahato95@gmail.com!');
      } else {
        setResetError(data.error || 'Failed to send verification code.');
      }
    } catch (e) {
      console.error(e);
      setResetError('Network error while requesting verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Code verification handler
  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setResetError('');
    setIsVerifyingCode(true);
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInputValue })
      });
      const data = await res.json();
      if (data.success) {
        setAuthStep('reset_password');
      } else {
        setResetError(data.error || 'Invalid verification code. Please check and try again.');
      }
    } catch (e) {
      console.error(e);
      setResetError('Network error during code verification.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Save new password handler
  const handleSaveNewPassword = (e: FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    localStorage.setItem('mb_admin_password', newPassword);
    setAuthStep('reset_success');
    triggerToast('Password reset successfully!');
  };

  // Transaction quick status change
  const handleUpdateTransactionStatus = (txId: string, status: 'SUCCESS' | 'FAILED') => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status } : t));
    triggerToast(`Transaction status updated to ${status}`);
  };

  // Open modal for Product adding
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormId(`prod-${Date.now().toString().slice(-6)}`);
    setFormName('');
    setFormProvider('');
    setFormCategory('top-up');
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
      id: formId,
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
      setProducts(prev => prev.map(p => p.id === formId ? updatedProduct : p));
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

  // Adjust balance
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

  // Search filtered products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.provider.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Statistics
  const stats = {
    totalSales: transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + t.amount, 0),
    pendingCount: transactions.filter(t => t.status === 'PENDING').length,
    successCount: transactions.filter(t => t.status === 'SUCCESS').length,
    failedCount: transactions.filter(t => t.status === 'FAILED').length,
    totalProducts: products.length
  };

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



      {/* LOGIN OR AUTH RECOVERY SCREENS */}
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
              className="mx-auto flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1 px-3 bg-zinc-900 border border-zinc-800 rounded-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Gaming Store
            </button>

            {/* Auth card */}
            <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              
              {/* STEP 1: LOGIN FORM */}
              {authStep === 'login' && (
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
                        <button
                          type="button"
                          onClick={() => setAuthStep('forgot_email')}
                          className="text-[11px] font-bold text-blue-400 hover:underline hover:text-blue-300 focus:outline-none"
                        >
                          Forgot Password?
                        </button>
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
              )}

              {/* STEP 2: FORGOT PASSWORD / EMAIL CONFIRMATION */}
              {authStep === 'forgot_email' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1 pb-2 border-b border-zinc-800">
                    <h2 className="text-sm font-bold text-zinc-200">Reset Admin Password</h2>
                    <p className="text-[11px] text-zinc-500">A verification code will be sent to your registered Gmail address.</p>
                  </div>

                  <div className="p-3.5 bg-blue-950/30 border border-blue-900/50 rounded-xl space-y-2">
                    <p className="text-xs text-blue-300 font-semibold leading-relaxed">
                      For absolute security, the reset code is sent directly to your registered administrator recovery email:
                    </p>
                    <div className="font-mono text-xs bg-zinc-950/80 px-3 py-1.5 rounded border border-blue-950 text-white font-bold select-all text-center">
                      mandipmahato95@gmail.com
                    </div>
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={sendVerificationCode}
                      disabled={isSendingCode}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-zinc-400 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {isSendingCode ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        'Send Code to Gmail App'
                      )}
                    </button>
                    
                    <button
                      onClick={() => setAuthStep('login')}
                      disabled={isSendingCode}
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold py-3 rounded-xl border border-zinc-800 transition-all cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ENTER CODE */}
              {authStep === 'enter_code' && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center space-y-1 pb-2 border-b border-zinc-800">
                    <h2 className="text-sm font-bold text-zinc-200">Enter Verification Code</h2>
                    <p className="text-[11px] text-zinc-500">Check your <b>Gmail App</b> for the 6-digit code sent to mandipmahato95@gmail.com</p>
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 text-center">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={codeInputValue}
                      onChange={(e) => setCodeInputValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full text-center font-mono font-bold text-lg bg-zinc-950 border border-zinc-800 rounded-xl py-3 tracking-widest text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={isVerifyingCode || isSendingCode}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-zinc-400 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {isVerifyingCode ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isSendingCode || isVerifyingCode}
                      onClick={sendVerificationCode}
                      className="w-full text-[11px] text-zinc-400 hover:text-blue-400 hover:underline disabled:text-zinc-600 font-bold text-center py-1 flex items-center justify-center gap-1.5"
                    >
                      {isSendingCode ? (
                        <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      Resend Code to Gmail
                    </button>

                    <button
                      type="button"
                      disabled={isSendingCode || isVerifyingCode}
                      onClick={() => setAuthStep('forgot_email')}
                      className="w-full text-xs text-zinc-500 hover:text-zinc-300 font-semibold text-center mt-2"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: RESET PASSWORD FORMS */}
              {authStep === 'reset_password' && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="text-center space-y-1 pb-2 border-b border-zinc-800">
                    <h2 className="text-sm font-bold text-zinc-200">Set New Password</h2>
                    <p className="text-[11px] text-zinc-500">Provide a secure new credential for administrative login.</p>
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-900 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">1 new password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new secure password"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400">confirm password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype password to confirm"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider mt-2"
                  >
                    Update Password
                  </button>
                </form>
              )}

              {/* STEP 5: SUCCESS RESET */}
              {authStep === 'reset_success' && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-100">Reset Successful!</h3>
                    <p className="text-[11px] text-zinc-500">Your admin credentials have been securely updated.</p>
                  </div>

                  <button
                    onClick={() => {
                      setAuthStep('login');
                      setPasswordInput('');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Go back to Login
                  </button>
                </div>
              )}

            </div>



          </div>
        </div>
      ) : (
        /* LOGGED IN VIEW: ADMIN PANEL DASHBOARD */
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-zinc-900 text-white sticky top-0 z-30 px-4 py-3 sm:px-6 shadow-md border-b border-zinc-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-850 shrink-0">
                  <img 
                    src="https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg" 
                    alt="MB Gaming Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xs sm:text-sm font-black uppercase tracking-tight flex items-center gap-1.5 text-zinc-100">
                    MB GAMING STORE <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">ADMIN</span>
                  </h1>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Console manager</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border border-zinc-750 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Storefront</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-950/40 hover:bg-red-950/80 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border border-red-900/30 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>

            </div>
          </header>

          {/* Nav Tab selection bar */}
          <div className="bg-white border-b border-zinc-200 sticky top-[53px] z-20 px-4 py-2 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center overflow-x-auto scrollbar-none gap-1.5">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Products ({products.length})
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Recharge Requests ({transactions.length})
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Adjust Client Balance
              </button>

            </div>
          </div>

          {/* MAIN CONTENT WORKSPACE */}
          <main className="max-w-7xl mx-auto w-full px-4 py-6 sm:px-6 flex-1">
            
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Intro */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 border border-zinc-200 rounded-3xl">
                  <div>
                    <h2 className="text-base font-black text-zinc-900 tracking-tight">Welcome to MB GAMING Admin Console!</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Control product prices, handle client payments, and manage instant deliveries.</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Secure and fully offline system settings */}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Sales */}
                  <div className="bg-white p-4.5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">Total Sales (Approved)</span>
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-lg font-black text-zinc-900">Rs. {stats.totalSales.toLocaleString()}</p>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stats.successCount} successful purchases</span>
                    </div>
                  </div>

                  {/* Pending requests */}
                  <div className="bg-white p-4.5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">Pending Orders</span>
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className={`text-lg font-black ${stats.pendingCount > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
                      {stats.pendingCount} Pending
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">Needs direct approval review</p>
                  </div>

                  {/* Products count */}
                  <div className="bg-white p-4.5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">Total Catalog Products</span>
                      <PlusCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-lg font-black text-zinc-900">{stats.totalProducts} Items</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Configure instantly on Products tab</p>
                  </div>

                  {/* Simulation Wallet */}
                  <div className="bg-white p-4.5 rounded-2xl border border-zinc-200 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">Simulated User Wallet</span>
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    </div>
                    <p className="text-lg font-black text-indigo-600">Rs. {walletBalance.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Currently assigned to client dashboard</p>
                  </div>
                </div>

                {/* Main section: Pending queue & quick action */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">Immediate Action Queue</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Top-up requests that require manual processing approval.</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {stats.pendingCount} orders pending
                    </span>
                  </div>

                  {transactions.filter(t => t.status === 'PENDING').length === 0 ? (
                    <div className="text-center py-10 text-zinc-400 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-zinc-200 mx-auto" />
                      <p className="text-xs font-bold text-zinc-500">Inbox clear! No recharge requests are pending.</p>
                      <p className="text-[10px] text-zinc-400">When users top-up in the store, requests appear here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                            <th className="py-2.5 px-3">Date / ID</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3">Account UID</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3 text-right">Approve / Reject</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium">
                          {transactions.filter(t => t.status === 'PENDING').map(tx => (
                            <tr key={tx.id} className="hover:bg-zinc-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <div className="font-extrabold text-zinc-800 text-[11px]">{tx.timestamp}</div>
                                <div className="text-[9.5px] text-zinc-400 font-mono mt-0.5">{tx.id}</div>
                              </td>
                              <td className="py-3 px-3 font-extrabold text-zinc-800 text-[11px]">
                                {tx.productName}
                              </td>
                              <td className="py-3 px-3 font-mono text-blue-600 font-extrabold text-[11px] bg-blue-50/30 rounded-lg max-w-[150px] truncate">
                                {tx.targetAccount}
                              </td>
                              <td className="py-3 px-3 text-zinc-900 font-black text-[11px]">
                                Rs. {tx.amount}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleUpdateTransactionStatus(tx.id, 'SUCCESS')}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateTransactionStatus(tx.id, 'FAILED')}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1 rounded-lg border border-red-100 font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" /> Decline
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* 2. PRODUCTS MANAGER TAB */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4.5 border border-zinc-200 rounded-2xl">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search store items..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                  
                  <button
                    onClick={openAddProductModal}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add New Product
                  </button>
                </div>

                {/* Products Grid */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
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

            {/* 3. TRANSACTIONS/REQUESTS TAB */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                
                <div className="bg-white p-5 border border-zinc-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">Complete Recharge History</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Review and alter transaction statuses across all accounts.</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Clear transaction log?')) {
                          setTransactions([]);
                          triggerToast('Transaction history cleared.');
                        }
                      }}
                      className="bg-red-50 text-red-600 hover:bg-red-100 text-[9px] font-black px-2.5 py-1.5 rounded-lg border border-red-100 uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Reset Log
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 space-y-2">
                      <Clock className="w-10 h-10 text-zinc-200 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-zinc-500 font-mono">No transaction logs found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                            <th className="py-2.5 px-3">Transaction ID</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Item / Provider</th>
                            <th className="py-2.5 px-3">Target UID</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Update Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium">
                          {transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-zinc-50/40 transition-colors">
                              {/* ID */}
                              <td className="py-3 px-3 font-mono text-zinc-500 font-bold text-[10.5px]">
                                {tx.id}
                              </td>

                              {/* Date */}
                              <td className="py-3 px-3 text-zinc-600 text-[11px]">
                                {tx.timestamp}
                              </td>

                              {/* Item */}
                              <td className="py-3 px-3">
                                <div className="font-extrabold text-zinc-800 text-[11px]">{tx.productName}</div>
                                <div className="text-[9.5px] text-zinc-400 font-medium">{tx.provider}</div>
                              </td>

                              {/* Target */}
                              <td className="py-3 px-3 font-mono text-blue-600 font-extrabold text-[11px]">
                                {tx.targetAccount}
                              </td>

                              {/* Amount */}
                              <td className="py-3 px-3 text-zinc-900 font-black text-[11px]">
                                Rs. {tx.amount}
                              </td>

                              {/* Status badge */}
                              <td className="py-3 px-3 uppercase text-[9px] font-black">
                                <span className={`px-2 py-0.5 rounded-full ${
                                  tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/30' :
                                  tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100/30' :
                                  'bg-red-50 text-red-600 border border-red-100/30'
                                }`}>
                                  {tx.status}
                                </span>
                              </td>

                              {/* Update button */}
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {tx.status !== 'SUCCESS' && (
                                    <button
                                      onClick={() => handleUpdateTransactionStatus(tx.id, 'SUCCESS')}
                                      className="p-1 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 rounded transition-all cursor-pointer border border-zinc-100"
                                      title="Approve Order"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {tx.status !== 'FAILED' && (
                                    <button
                                      onClick={() => handleUpdateTransactionStatus(tx.id, 'FAILED')}
                                      className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-all cursor-pointer border border-zinc-100"
                                      title="Decline Order"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* 4. WALLET ADJUSTMENTS TAB */}
            {activeTab === 'wallet' && (
              <div className="max-w-md mx-auto">
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="text-center space-y-1.5 pb-3 border-b border-zinc-100">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Adjust Client Wallet</h3>
                    <p className="text-xs text-zinc-500">Edit the simulation client wallet balance instantly.</p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100/80 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Current Balance</p>
                      <h4 className="text-xl font-black text-blue-900 mt-1">Rs. {walletBalance.toLocaleString()}</h4>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-500 stroke-[1.5]" />
                  </div>

                  <form onSubmit={handleAdjustBalance} className="space-y-3 pt-2">
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
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
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
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-zinc-300"
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
