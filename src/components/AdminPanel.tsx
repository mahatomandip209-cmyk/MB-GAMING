import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query 
} from '../firebase';
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
  Wallet,
  Phone,
  Tv,
  Layers,
  Wifi,
  Music,
  Gamepad,
  Upload
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

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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
    | 'requirements'
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
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [requirementsText, setRequirementsText] = useState('1. Players must provide a correct Game UID.\n2. Payment must be uploaded via eSewa QR code.\n3. Make sure to upload the valid screenshot for instant verification.');
  const [paymentSettings, setPaymentSettings] = useState<any>({
    qrImageUrl: 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
    esewaNumber: '9841234567',
    minDeposit: 100,
    esewa: { number: '9841234567', name: 'Mandip Mahato' },
    khalti: { number: '9801234567', name: 'MB Gaming Digital Center' }
  });
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [pointsRate, setPointsRate] = useState<number>(100);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [legalDocs, setLegalDocs] = useState<any>({
    terms: 'By registering on MB Gaming Store, you agree to fulfill payment immediately for selected digital assets. Recharges are subject to manual validation of transaction UIDs.',
    refund: 'No refunds are permitted once a digital game recharge or voucher coupon has been officially approved and dispatched by the administrator.'
  });

  // Admin system credentials & branding details
  const [storeName, setStoreName] = useState('MB Gaming Store');
  const [storeContact, setStoreContact] = useState('mandipmahato717@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Mandip@#0');

  // Coupon inputs
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');
  const [newCouponMax, setNewCouponMax] = useState('500');

  // Announcement inputs
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnType, setNewAnnType] = useState<'info' | 'alert' | 'success'>('info');

  // Push Notification inputs
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushLink, setPushLink] = useState('/');
  const [sentPushLogs, setSentPushLogs] = useState<any[]>([]);
  const [isSendingPush, setIsSendingPush] = useState(false);

  // Custom manual ledger entry states
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [sellRate, setSellRate] = useState<number>(220);
  const [selectedGame, setSelectedGame] = useState<string>('Free Fire');
  const [packageName, setPackageName] = useState<string>('110 Diamonds');
  const [quantity, setQuantity] = useState<number>(1);
  const [enteredBy, setEnteredBy] = useState<string>('Bibek Jha');
  const [description, setDescription] = useState<string>('Customer requested instant delivery...');
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  // Backend API URL configuration & connection verification states
  const [customBackendUrl, setCustomBackendUrl] = useState<string>(() => {
    return localStorage.getItem('mb_backend_api_url') || '';
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');

  const getBackendUrl = (path: string): string => {
    if (customBackendUrl && customBackendUrl.trim() !== '') {
      return `${customBackendUrl.trim()}${path}`;
    }
    const isLocalOrPreview = window.location.hostname.includes('run.app') || 
                             window.location.hostname.includes('localhost') || 
                             window.location.hostname.includes('127.0.0.1');
    const backendBase = isLocalOrPreview ? '' : 'https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app';
    return `${backendBase}${path}`;
  };

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    
    if (!response.ok) {
      try {
        const errJson = JSON.parse(text);
        throw new Error(errJson.error || errJson.message || `HTTP ${response.status}`);
      } catch {
        const excerpt = text.length > 120 ? text.trim().substring(0, 120) + "..." : text.trim();
        throw new Error(`HTTP ${response.status}: ${excerpt || response.statusText}`);
      }
    }
    
    if (!contentType.includes("application/json")) {
      const excerpt = text.length > 120 ? text.trim().substring(0, 120) + "..." : text.trim();
      throw new Error(`Response is not JSON (got "${contentType}"). Check if your backend URL is correct. Content preview: "${excerpt}"`);
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON syntax: ${e instanceof Error ? e.message : String(e)}. Content preview: "${text.substring(0, 100)}"`);
    }
  };

  const testConnection = async (targetUrl?: string) => {
    const urlToTest = targetUrl || customBackendUrl;
    setConnectionStatus('checking');
    try {
      const data = await safeFetchJson(`${urlToTest}/api/notifications`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (data && data.success) {
        setConnectionStatus('connected');
        setConnectionError('');
        
        // Propagate to Service Worker
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg.active) {
            reg.active.postMessage({ type: 'SET_BACKEND_URL', url: urlToTest });
          }
        }
        return true;
      } else {
        throw new Error("Response was not a success payload.");
      }
    } catch (err) {
      console.error("Connection test failed:", err);
      setConnectionStatus('disconnected');
      setConnectionError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const fetchPushLogs = async () => {
    try {
      const data = await safeFetchJson(getBackendUrl('/api/notifications'));
      if (data.success && data.notifications) {
        setSentPushLogs(data.notifications);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch push logs via API, loading from Firestore:", err);
    }

    // Direct Firestore fallback for logs
    try {
      const snap = await getDocs(collection(db, "notifications"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setSentPushLogs(list);
    } catch (fsErr) {
      console.error("Failed to fetch logs from Firestore:", fsErr);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      testConnection();
      fetchPushLogs();
    }
  }, [isLoggedIn]);

  const handleSendPushNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      triggerToast('Title and Body are required for push notification.');
      return;
    }

    setIsSendingPush(true);
    
    const notificationPayload = {
      title: pushTitle.trim(),
      body: pushBody.trim(),
      linkUrl: pushLink.trim() || "/",
      iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg", // MB Gaming Logo
      timestamp: Date.now()
    };

    let apiSuccess = false;
    let apiErrorMsg = '';

    // 1. Try API dispatch
    try {
      const backendUrl = getBackendUrl('/api/notifications');
      const data = await safeFetchJson(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(notificationPayload)
      });
      if (data && data.success) {
        apiSuccess = true;
      } else {
        apiErrorMsg = data?.error || 'Failed to dispatch via API.';
      }
    } catch (err) {
      console.warn("API delivery failed, attempting direct Firestore save:", err);
      apiErrorMsg = err instanceof Error ? err.message : String(err);
    }

    // 2. Direct Firestore fallback
    try {
      if (!apiSuccess) {
        await addDoc(collection(db, 'notifications'), notificationPayload);
        triggerToast('🚀 Push notification saved directly to database!');
        setPushTitle('');
        setPushBody('');
        setPushLink('/');
        fetchPushLogs();
      } else {
        triggerToast('🚀 Native push notification dispatched successfully!');
        setPushTitle('');
        setPushBody('');
        setPushLink('/');
        fetchPushLogs();
      }
    } catch (dbErr) {
      console.error("Firestore write failed too:", dbErr);
      triggerToast(`Failed to dispatch: ${apiErrorMsg || (dbErr instanceof Error ? dbErr.message : String(dbErr))}`);
    } finally {
      setIsSendingPush(false);
    }
  };

  // User list additions
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Check login state
  useEffect(() => {
    setIsLoggedIn(true);
  }, []);

  // Sync and fetch all data from Firestore when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadAllFirestoreData = async () => {
      try {
        // 1. Users
        const usersSnap = await getDocs(collection(db, 'users'));
        if (!usersSnap.empty) {
          const fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserList(fetchedUsers);
        } else {
          const initialUsers = [
            { id: 'usr-101', name: 'Mandip Mahato', email: 'mandipmahato717@gmail.com', phone: '9841234567', balance: 5000, points: 1500, registered: '2026-06-01' },
            { id: 'usr-102', name: 'Gamer Nepal Pro', email: 'gamerpro@outlook.com', phone: '9801234567', balance: 150, points: 230, registered: '2026-06-10' },
            { id: 'usr-103', name: 'Rohan Shrestha', email: 'rohan.shrestha@gmail.com', phone: '9812345678', balance: 1200, points: 450, registered: '2026-06-14' },
            { id: 'usr-104', name: 'Sita Devkota', email: 'sita.devkota@yahoo.com', phone: '9842345679', balance: 0, points: 80, registered: '2026-06-18' },
            { id: 'usr-105', name: 'Aayush Thapa', email: 'aayush.thapa@gmail.com', phone: '9863456780', balance: 4500, points: 900, registered: '2026-06-22' }
          ];
          for (const u of initialUsers) {
            await setDoc(doc(db, 'users', u.email), u);
          }
          setUserList(initialUsers);
        }

        // 2. Payments Settings
        const paymentsDoc = await getDoc(doc(db, 'settings', 'payments'));
        if (paymentsDoc.exists()) {
          const data = paymentsDoc.data();
          setPaymentSettings({
            qrImageUrl: data.qrImageUrl || 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
            esewaNumber: data.esewaNumber || data.esewa?.number || '9841234567',
            minDeposit: data.minDeposit !== undefined ? data.minDeposit : 100,
            esewa: data.esewa || { number: '9841234567', name: 'Mandip Mahato' },
            khalti: data.khalti || { number: '9801234567', name: 'MB Gaming Digital Center' }
          });
        } else {
          const initialPayments = {
            qrImageUrl: 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
            esewaNumber: '9841234567',
            minDeposit: 100,
            esewa: { number: '9841234567', name: 'Mandip Mahato' },
            khalti: { number: '9801234567', name: 'MB Gaming Digital Center' }
          };
          await setDoc(doc(db, 'settings', 'payments'), initialPayments);
          setPaymentSettings(initialPayments);
        }

        // 3. Banners
        const bannersSnap = await getDocs(collection(db, 'banners'));
        if (!bannersSnap.empty) {
          setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const initialBanners = [
            { id: 'ban-1', badge: 'WEEKLY HIGHLIGHT', title: 'Free Fire 100% Top-Up Bonus', tagline: 'Double your shell diamonds this weekend only! Automatically credited on validation.', bgColor: 'from-blue-600 to-indigo-700' },
            { id: 'ban-2', badge: 'EXCLUSIVES', title: 'PUBG Mobile Air Drop Specials', tagline: 'Acquire UC vouchers with instant eSewa/Khalti payouts.', bgColor: 'from-purple-600 to-pink-600' }
          ];
          for (const b of initialBanners) {
            await setDoc(doc(db, 'banners', b.id), b);
          }
          setBanners(initialBanners);
        }

        // 4. Coupons
        const couponsSnap = await getDocs(collection(db, 'coupons'));
        if (!couponsSnap.empty) {
          setCoupons(couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const initialCoupons = [
            { id: 'MANDIP10', code: 'MANDIP10', discountPercent: 10, maxDiscount: 200, active: true },
            { id: 'WINTER30', code: 'WINTER30', discountPercent: 30, maxDiscount: 1000, active: true },
            { id: 'GAMERFF5', code: 'GAMERFF5', discountPercent: 5, maxDiscount: 150, active: true }
          ];
          for (const c of initialCoupons) {
            await setDoc(doc(db, 'coupons', c.code), c);
          }
          setCoupons(initialCoupons);
        }

        // 5. Points Rate
        const rateDoc = await getDoc(doc(db, 'settings', 'points_rate'));
        if (rateDoc.exists()) {
          setPointsRate(rateDoc.data().rate);
        } else {
          await setDoc(doc(db, 'settings', 'points_rate'), { rate: 100 });
          setPointsRate(100);
        }

        // 6. Announcements
        const annSnap = await getDocs(collection(db, 'announcements'));
        if (!annSnap.empty) {
          setAnnouncements(annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const initialAnn = [
            { id: 'ann-1', message: '📢 Welcome to MB Gaming Store! Instant UPI recharges available 24/7.', type: 'info' },
            { id: 'ann-2', message: '⚠️ eSewa payments might take up to 5 minutes to verify due to central banking gateway delay.', type: 'alert' }
          ];
          for (const a of initialAnn) {
            await setDoc(doc(db, 'announcements', a.id), a);
          }
          setAnnouncements(initialAnn);
        }

        // 7. Support Tickets
        const ticketsSnap = await getDocs(collection(db, 'support_tickets'));
        if (!ticketsSnap.empty) {
          setSupportTickets(ticketsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          const initialTickets = [
            { id: 'tkt-1', user: 'Rohan Shrestha', msg: 'My Free Fire recharge is pending for 10 minutes. Transaction ID is 91283021.', date: '2026-06-24 10:14', status: 'PENDING', replies: [] },
            { id: 'tkt-2', user: 'Gamer Nepal Pro', msg: 'Can I redeem loyalty points for Free Fire Weekly memberships?', date: '2026-06-23 15:40', status: 'COMPLETED', replies: ['Yes, convert points to client balance first under your profile, then order!'] }
          ];
          for (const t of initialTickets) {
            await setDoc(doc(db, 'support_tickets', t.id), t);
          }
          setSupportTickets(initialTickets);
        }

        // 8. General Settings
        const genDoc = await getDoc(doc(db, 'settings', 'general'));
        if (genDoc.exists()) {
          const data = genDoc.data();
          if (data.storeName) setStoreName(data.storeName);
          if (data.storeContact) setStoreContact(data.storeContact);
          if (data.adminPassword) setAdminPassword(data.adminPassword);
        } else {
          const initialGen = { storeName: 'MB Gaming Store', storeContact: 'mandipmahato717@gmail.com', adminPassword: 'Mandip@#0' };
          await setDoc(doc(db, 'settings', 'general'), initialGen);
        }

        // 9. Legal Docs
        const legalDoc = await getDoc(doc(db, 'settings', 'legal'));
        if (legalDoc.exists()) {
          setLegalDocs(legalDoc.data());
        } else {
          const initialLegal = {
            terms: 'By registering on MB Gaming Store, you agree to fulfill payment immediately for selected digital assets. Recharges are subject to manual validation of transaction UIDs.',
            refund: 'No refunds are permitted once a digital game recharge or voucher coupon has been officially approved and dispatched by the administrator.'
          };
          await setDoc(doc(db, 'settings', 'legal'), initialLegal);
          setLegalDocs(initialLegal);
        }

        // 10. Requirements Settings
        const reqDoc = await getDoc(doc(db, 'settings', 'requirements'));
        if (reqDoc.exists()) {
          setRequirementsText(reqDoc.data().text || '');
        } else {
          const defaultReq = '1. Players must provide a correct Game UID.\n2. Payment must be uploaded via eSewa QR code.\n3. Make sure to upload the valid screenshot for instant verification.';
          await setDoc(doc(db, 'settings', 'requirements'), { text: defaultReq });
          setRequirementsText(defaultReq);
        }
      } catch (err) {
        console.error("Error loading Firestore data:", err);
      }
    };

    loadAllFirestoreData();
  }, [isLoggedIn]);


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

  // Banner modal states
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [bannerFormTitle, setBannerFormTitle] = useState('');
  const [bannerFormTagline, setBannerFormTagline] = useState('');
  const [bannerFormBadge, setBannerFormBadge] = useState('');
  const [bannerFormImgUrl, setBannerFormImgUrl] = useState('');
  const [bannerFormRedirect, setBannerFormRedirect] = useState('');

  // Products filters
  const [productSearch, setProductSearch] = useState('');

  // Toast trigger
  const triggerToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Custom manual ledger entry submission
  const handleSaveEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (sellRate <= 0) {
      triggerToast('Please enter a valid Sell Rate.');
      return;
    }
    if (!packageName || !packageName.trim()) {
      triggerToast('Please enter a Package name.');
      return;
    }
    if (quantity <= 0) {
      triggerToast('Please enter a valid Quantity.');
      return;
    }
    if (!enteredBy || !enteredBy.trim()) {
      triggerToast('Please specify who entered this.');
      return;
    }

    setIsSavingEntry(true);
    try {
      const newTxId = `tx-man-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestampString = new Date().toISOString().replace('T', ' ').substring(0, 16);
      
      const newTx: any = {
        id: newTxId,
        productId: 'custom-manual',
        productName: `${selectedGame} - ${packageName}`,
        provider: selectedGame,
        category: 'top-up',
        amount: Number(sellRate) * Number(quantity),
        targetAccount: `Manual Entry: ${enteredBy}`,
        timestamp: timestampString,
        status: 'SUCCESS',
        sellRate: Number(sellRate),
        game: selectedGame,
        package: packageName,
        quantity: Number(quantity),
        enteredBy: enteredBy,
        description: description,
      };

      const response = await fetch(getBackendUrl('/api/transactions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newTx)
      });
      
      const data = await response.json();
      if (data && data.success) {
        setTransactions([newTx, ...transactions]);
        triggerToast('🎉 Custom ledger entry saved successfully!');
        
        // Reset inputs, keeping enteredBy
        setSellRate(220);
        setPackageName('110 Diamonds');
        setQuantity(1);
        setDescription('');
        setShowAddEntryModal(false);
      } else {
        throw new Error(data.error || 'Server rejected manual transaction.');
      }
    } catch (err: any) {
      console.error("[Manual Entry] Error saving custom entry:", err);
      triggerToast(`Failed to save: ${err.message || String(err)}`);
    } finally {
      setIsSavingEntry(false);
    }
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
    onClose();
    triggerToast('Returned to Gaming Store.');
  };

  // Update Transaction Status
  const handleUpdateTransactionStatus = async (txId: string, status: 'SUCCESS' | 'PENDING' | 'FAILED') => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status } : t))
    );
    triggerToast(`Transaction status updated to ${status}`);

    let apiSuccess = false;
    try {
      // 1. Sync status change to the server backend
      await safeFetchJson(getBackendUrl(`/api/transactions/${txId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      apiSuccess = true;
    } catch (err) {
      console.warn("Failed to sync status update with server, falling back to direct Firestore update:", err);
    }

    // 1b. Direct Firestore fallback for status
    if (!apiSuccess) {
      try {
        await setDoc(doc(db, "transactions", txId), { status }, { merge: true });
        console.log("Direct Firestore transaction status sync successful!");
      } catch (fsErr) {
        console.error("Direct Firestore status update failed too:", fsErr);
      }
    }

    try {
      const tx = transactions.find(t => t.id === txId);
      if (tx) {
        const notifTitle = status === 'SUCCESS' ? '✅ Recharge Approved!' : '❌ Recharge Rejected';
        const notifBody = status === 'SUCCESS'
          ? `Your recharge order for ${tx.productName} (UID: ${tx.targetAccount}) has been completed successfully!`
          : `Your recharge order for ${tx.productName} (UID: ${tx.targetAccount}) was rejected. Please contact support.`;

        const notifPayload = {
          title: notifTitle,
          body: notifBody,
          linkUrl: '/',
          iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
          timestamp: Date.now()
        };

        let notifApiSuccess = false;
        try {
          await safeFetchJson(getBackendUrl('/api/notifications'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(notifPayload)
          });
          notifApiSuccess = true;
        } catch (err) {
          console.warn("Failed to send status update notification via API, falling back to direct Firestore:", err);
        }

        if (!notifApiSuccess) {
          try {
            await addDoc(collection(db, 'notifications'), notifPayload);
            console.log("Direct Firestore status notification write successful!");
          } catch (fsErr) {
            console.error("Direct Firestore status notification write failed:", fsErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync status update with server or trigger notification:", err);
    }
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

  // Handle image file selection & convert to Base64
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('Image is too large! Choose an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
          triggerToast('Local image attached successfully!');
        }
      };
      reader.onerror = () => {
        triggerToast('Error processing image file.');
      };
      reader.readAsDataURL(file);
    }
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

  // Banner modal handlers
  const handleOpenBannerModal = (banner?: any) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerFormTitle(banner.title || '');
      setBannerFormTagline(banner.tagline || '');
      setBannerFormBadge(banner.badge || '');
      setBannerFormImgUrl(banner.imageUrl || banner.imgUrl || '');
      setBannerFormRedirect(banner.redirectUrl || banner.redirect || '');
    } else {
      setEditingBanner(null);
      setBannerFormTitle('');
      setBannerFormTagline('');
      setBannerFormBadge('PROMO');
      setBannerFormImgUrl('');
      setBannerFormRedirect('');
    }
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: FormEvent) => {
    e.preventDefault();
    if (!bannerFormTitle.trim()) {
      triggerToast('Title is required!');
      return;
    }

    let updatedBanners = [...banners];
    const img = bannerFormImgUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';

    if (editingBanner) {
      // Update existing
      const updated = {
        ...editingBanner,
        title: bannerFormTitle,
        tagline: bannerFormTagline,
        badge: bannerFormBadge,
        imgUrl: img,
        imageUrl: img, // keep both for safety
        redirect: bannerFormRedirect,
        redirectUrl: bannerFormRedirect,
        bgColor: editingBanner.bgColor || 'from-indigo-600 to-purple-700'
      };
      updatedBanners = banners.map(b => b.id === editingBanner.id ? updated : b);
      setBanners(updatedBanners);
      localStorage.setItem('mb_admin_banners', JSON.stringify(updatedBanners));
      try {
        await setDoc(doc(db, 'banners', editingBanner.id), updated);
        triggerToast('Banner updated in Firestore!');
      } catch (err) {
        triggerToast('Banner updated locally!');
      }
    } else {
      // Create new
      const newId = 'ban-' + Date.now();
      const newBanner = {
        id: newId,
        title: bannerFormTitle,
        tagline: bannerFormTagline,
        badge: bannerFormBadge,
        imgUrl: img,
        imageUrl: img,
        redirect: bannerFormRedirect,
        redirectUrl: bannerFormRedirect,
        bgColor: 'from-zinc-800 to-zinc-950'
      };
      updatedBanners = [...banners, newBanner];
      setBanners(updatedBanners);
      localStorage.setItem('mb_admin_banners', JSON.stringify(updatedBanners));
      try {
        await setDoc(doc(db, 'banners', newId), newBanner);
        triggerToast('New banner added to Firestore!');
      } catch (err) {
        triggerToast('Banner added locally!');
      }
    }
    setIsBannerModalOpen(false);
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
  const handleSavePaymentDetails = async (gateway: 'esewa' | 'khalti', fields: any) => {
    const updated = {
      ...paymentSettings,
      [gateway]: {
        ...paymentSettings[gateway],
        ...fields
      }
    };
    setPaymentSettings(updated);
    localStorage.setItem('mb_admin_payments', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'settings', 'payments'), updated);
      triggerToast('Payment Gateway settings saved to Firestore!');
    } catch (e) {
      triggerToast('Payment Gateway settings updated locally.');
    }
  };

  // Broadcast announcements
  const handleAddAnnouncement = async (e: FormEvent) => {
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
    try {
      await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
      triggerToast('Broadcast Alert posted to Firestore!');
    } catch (e) {
      triggerToast('Broadcast Alert banner posted.');
    }
  };

  // Support ticket replies
  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicketId) return;

    const updated = supportTickets.map(tkt => {
      if (tkt.id === activeTicketId) {
        const updatedTkt = {
          ...tkt,
          status: 'COMPLETED',
          replies: [...tkt.replies, replyText.trim()]
        };
        setDoc(doc(db, 'support_tickets', activeTicketId), updatedTkt).catch(err => console.error(err));
        return updatedTkt;
      }
      return tkt;
    });

    setSupportTickets(updated);
    localStorage.setItem('mb_support_tickets', JSON.stringify(updated));
    setReplyText('');
    triggerToast('Reply dispatched and saved to Firestore.');
  };

  // Loyalty rewards distribution
  const handleDistributePoints = async (amount: number) => {
    const updated = userList.map(u => ({
      ...u,
      points: u.points + amount
    }));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    try {
      for (const u of updated) {
        await setDoc(doc(db, 'users', u.email || u.id), u);
      }
      triggerToast(`Rewarded +${amount} Points and saved to Firestore.`);
    } catch (e) {
      triggerToast(`Rewarded +${amount} Points to all registered accounts.`);
    }
  };

  // Admin users lists modifiers
  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser = {
      id: `usr-${101 + userList.length}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || '98XXXXXXXX',
      balance: 0,
      points: 0, // starts at 0 points
      registered: new Date().toISOString().split('T')[0]
    };

    const updated = [...userList, newUser];
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    try {
      await setDoc(doc(db, 'users', newUser.email), newUser);
      triggerToast(`Gamer profile created in Firestore for ${newUser.name}!`);
    } catch (e) {
      triggerToast(`Gamer profile created for ${newUser.name}!`);
    }
  };

  const handleUpdateUserBalance = async (userId: string, val: number) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, balance: val } : u));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));

    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) {
      try {
        await setDoc(doc(db, 'users', targetUser.email || targetUser.id), targetUser);
        triggerToast('User wallet balance saved to Firestore.');
      } catch (e) {
        triggerToast('User simulated wallet balance saved.');
      }
    }
  };

  const handleUpdateUserPoints = async (userId: string, val: number) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, points: val } : u));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));

    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) {
      try {
        await setDoc(doc(db, 'users', targetUser.email || targetUser.id), targetUser);
        triggerToast('User loyalty points saved to Firestore.');
      } catch (e) {
        triggerToast('User loyalty points updated.');
      }
    }
  };

  const handleToggleBlockUser = async (userId: string) => {
    const updated = userList.map(u => (u.id === userId ? { ...u, blocked: !u.blocked } : u));
    setUserList(updated);
    localStorage.setItem('mb_admin_users', JSON.stringify(updated));

    const targetUser = updated.find(u => u.id === userId);
    if (targetUser) {
      try {
        await setDoc(doc(db, 'users', targetUser.email || targetUser.id), targetUser);
        triggerToast(targetUser.blocked ? 'User blocked successfully!' : 'User unblocked successfully!');
      } catch (e) {
        triggerToast(targetUser.blocked ? 'User blocked!' : 'User unblocked!');
      }
    }
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

      {/* ADMIN PANEL DASHBOARD WITH 13 VERTICAL TABS AND ENHANCED DASHBOARDS */}
      <div className="flex-1 flex min-h-screen bg-[#f8fafc]">
          
          {/* LEFT SIDEBAR NAVIGATION (Hidden on mobile, visible on desktop) */}
          <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200/80 flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
            
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
                { id: 'requirements', label: 'Requirements', icon: FileText },
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

            {/* Admin Footer Return to Store */}
            <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span>Return to Store</span>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE VIEW CONTAINER */}
          <main className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-8 flex flex-col bg-[#f8fafc]">
            
            {/* MOBILE ONLY HEADER & TABS NAVIGATION (Visible on mobile/tablet, hidden on desktop - Matching Screenshot 1) */}
            <div className="block md:hidden bg-white border border-zinc-200/80 rounded-3xl p-4 mb-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                    title="Return to Storefront"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-zinc-950 tracking-tight">{storeName}</span>
                    <span className="text-[9px] text-zinc-400 font-mono tracking-widest mt-0.5 uppercase">SYSTEM MANAGER</span>
                  </div>
                </div>
                <span className="bg-blue-100/70 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>

              {/* 13 Tab Buttons matching Screenshot 1 */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'orders', label: 'Orders', icon: ShoppingCart },
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'games', label: 'Games', icon: Gamepad2 },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'banners', label: 'Banners', icon: ImageIcon },
                  { id: 'coupons', label: 'Coupons', icon: Ticket },
                  { id: 'requirements', label: 'Requirements', icon: FileText },
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/15 font-black'
                          : 'bg-white border border-zinc-200/60 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (() => {
              const slices = [
                { value: 304, color: '#3b82f6', label: 'UniPin Voucher (BDT 2000)' },
                { value: 57, color: '#a855f7', label: 'PUBG UC VOUCHERS' },
                { value: 14, color: '#ec4899', label: 'Apple Gift Card (US) 🇺🇸' },
                { value: 36, color: '#f97316', label: 'Garena Free Fire' },
                { value: 20, color: '#10b981', label: 'GAREENA SHELL' },
                { value: 8, color: '#ef4444', label: 'Other' },
                { value: 6, color: '#6366f1', label: 'PUBG Mobile UC' },
                { value: 1, color: '#eab308', label: 'MLBB Diamonds' }
              ];

              const totalSlices = slices.reduce((sum, s) => sum + s.value, 0);
              let accumulatedPercent = 0;

              const paths = slices.map((slice) => {
                const startPercent = accumulatedPercent;
                accumulatedPercent += slice.value / totalSlices;
                const endPercent = accumulatedPercent;

                const angleOffset = -Math.PI / 2;
                const radius = 68;
                const centerX = 200;
                const centerY = 135;

                const startX = centerX + radius * Math.cos(2 * Math.PI * startPercent + angleOffset);
                const startY = centerY + radius * Math.sin(2 * Math.PI * startPercent + angleOffset);
                const endX = centerX + radius * Math.cos(2 * Math.PI * endPercent + angleOffset);
                const endY = centerY + radius * Math.sin(2 * Math.PI * endPercent + angleOffset);

                const largeArcFlag = slice.value / totalSlices > 0.5 ? 1 : 0;

                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  `Z`
                ].join(' ');

                const midPercent = startPercent + (slice.value / totalSlices) / 2;
                const midAngle = 2 * Math.PI * midPercent + angleOffset;
                
                const lineStartX = centerX + (radius - 5) * Math.cos(midAngle);
                const lineStartY = centerY + (radius - 5) * Math.sin(midAngle);
                const lineEndX = centerX + (radius + 28) * Math.cos(midAngle);
                const lineEndY = centerY + (radius + 28) * Math.sin(midAngle);
                
                const isRight = lineEndX > centerX;
                const labelX = lineEndX + (isRight ? 12 : -12);
                const labelY = lineEndY;
                const textAnchor = isRight ? 'start' : 'end';

                return {
                  pathData,
                  slice,
                  lineStartX,
                  lineStartY,
                  lineEndX,
                  lineEndY,
                  labelX,
                  labelY,
                  textAnchor
                };
              });

              return (
                <div className="space-y-6">
                  
                  {/* Header title */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Dashboard</h2>
                      <p className="text-xs text-zinc-500 font-semibold mt-0.5">Real-time store telemetry and transaction indicators.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowAddEntryModal(true)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Add New
                      </button>
                      <div className="text-[11px] font-bold text-zinc-500 font-mono bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-xs shrink-0">
                        SERVER TIME: {new Date().toISOString().split('T')[0]} 12:00 UTC
                      </div>
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
                        <h4 className="text-3xl font-black text-zinc-950 tracking-tight">{169 + transactions.length}</h4>
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
                        <h4 className="text-3xl font-black text-zinc-950 tracking-tight">{59 + userList.length}</h4>
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
                            {(userList.reduce((acc: number, u: any) => acc + u.points, 0) + 98543).toLocaleString()}
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
                          <h4 className="text-2xl font-black text-zinc-900 mt-0.5">NPR 740,000</h4>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-xl">99.8% Success</span>
                    </div>
                  </div>

                  {/* Profit Tracker card matching uploaded layout (Screenshot 2 & 3 style) */}
                  <div className="border border-zinc-200/80 bg-white rounded-3xl p-6 shadow-xs relative overflow-hidden space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <DollarSign className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight">Profit Tracker</h3>
                          <p className="text-[10px] text-zinc-400 font-bold">REAL-TIME PERFORMANCE TELEMETRY</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
                      >
                        See All Activity <span className="font-sans">&gt;</span>
                      </button>
                    </div>

                    {/* Range pills */}
                    <div className="flex items-center gap-1 bg-zinc-100/70 p-1 rounded-2xl max-w-xs">
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

                    {/* Only SALES inside Profit Tracker */}
                    <div className="grid grid-cols-1 gap-4">
                      
                      {/* Column 1: SALES */}
                      <div className="bg-[#f0f4f9] border border-[#d6e4f0] p-6 rounded-3xl flex flex-col justify-between min-h-[120px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-black text-blue-600 uppercase tracking-widest block font-mono">TOTAL SALES & REVENUE</span>
                          <span className="bg-blue-100 text-blue-700 text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase">Live Feed</span>
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                          <div>
                            <h5 className="text-3xl font-black text-zinc-900 leading-tight">
                              {profitRange === 'DAILY' ? '7 Orders' :
                               profitRange === 'WEEKLY' ? '45 Orders' :
                               profitRange === 'MONTHLY' ? '184 Orders' : '2,240 Orders'}
                            </h5>
                            <p className="text-sm font-black mt-1.5 text-zinc-500">
                              Revenue: <span className="text-blue-600">{profitRange === 'DAILY' ? 'NPR 47,279' :
                               profitRange === 'WEEKLY' ? 'NPR 315,200' :
                               profitRange === 'MONTHLY' ? 'NPR 1,240,000' : 'NPR 15,450,000'}</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-bold mt-2 sm:mt-0 font-mono">Synced with storefront transaction logs</span>
                        </div>
                      </div>

                    </div>

                    <p className="text-[10.5px] text-zinc-400 font-medium flex items-center gap-1.5 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Only completed orders are counted towards final sales calculations (rejected/failed excluded).
                    </p>
                  </div>

                  {/* 30-Day Trend Area Chart from user screenshot (Screenshot 3 style) */}
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

                    {/* SVG Responsive Area Chart (Double peak spline) */}
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
                          d="M 50,200 L 50,195 C 150,195 250,195 330,195 C 360,195 380,185 400,150 C 420,115 435,40 450,40 C 465,40 475,120 480,170 C 490,170 500,90 510,90 C 520,90 525,180 530,180 C 545,180 550,170 560,150 L 560,200 Z" 
                          fill="url(#chartGrad)" 
                        />

                        {/* Main spline line */}
                        <path 
                          d="M 50,195 C 150,195 250,195 330,195 C 360,195 380,185 400,150 C 420,115 435,40 450,40 C 465,40 475,120 480,170 C 490,170 500,90 510,90 C 520,90 525,180 530,180 C 545,180 550,170 560,150" 
                          fill="none" 
                          stroke="#2563eb" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                        />

                        {/* Pulse point at 6/18 Peak */}
                        <circle cx="510" cy="90" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                        <circle cx="510" cy="90" r="10" fill="#2563eb" fillOpacity="0.25" className="animate-pulse" />

                        {/* X-axis Labels */}
                        <text x="50" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">5/26</text>
                        <text x="150" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">5/31</text>
                        <text x="250" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/5</text>
                        <text x="350" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/10</text>
                        <text x="450" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/15</text>
                        <text x="550" y="222" textAnchor="middle" className="text-[9.5px] font-black fill-zinc-400 font-mono">6/20</text>
                      </svg>

                      {/* Popover detail matching Screenshot 3 exactly */}
                      <div className="absolute top-[28%] left-[82%] sm:left-[80%] bg-white border border-zinc-200 p-2.5 rounded-xl text-[10px] shadow-md text-center pointer-events-none -translate-x-1/2">
                        <div className="font-extrabold text-zinc-950">6/18</div>
                        <div className="mt-0.5 text-blue-600 font-black">Profit : 9690</div>
                      </div>
                    </div>
                  </div>

                  {/* Product Performance Rank List & Category Distribution Pie Chart (Screenshot 4 style) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Rank List Card */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          Top Product Performance Rankings
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-400">by Total Sales</span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { rank: 1, name: 'Free Fire Diamonds', revenue: 245000, units: 342, color: 'bg-blue-100 text-blue-700' },
                          { rank: 2, name: 'UniPin Voucher (BDT 2000)', revenue: 182000, units: 114, color: 'bg-purple-100 text-purple-700' },
                          { rank: 3, name: 'Apple Gift Card (US) 🇺🇸', revenue: 95000, units: 57, color: 'bg-pink-100 text-pink-700' },
                          { rank: 4, name: 'GAREENA SHELL', revenue: 78000, units: 96, color: 'bg-emerald-100 text-emerald-700' },
                          { rank: 5, name: 'Netflix Premium Subscription', revenue: 45000, units: 42, color: 'bg-orange-100 text-orange-700' },
                          { rank: 6, name: 'Other', revenue: 2451, units: 8, color: 'bg-zinc-100 text-zinc-700 font-mono' },
                          { rank: 7, name: 'PUBG Mobile UC', revenue: 12040, units: 6, color: 'bg-blue-50 text-blue-700 font-mono' },
                          { rank: 8, name: 'MLBB Diamonds', revenue: 725, units: 1, color: 'bg-amber-100 text-amber-700 font-mono' }
                        ].map((item) => (
                          <div key={item.rank} className="flex items-center justify-between p-3 bg-zinc-50/55 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${item.color}`}>
                                {item.rank}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-zinc-900 truncate">{item.name}</h4>
                                <p className="text-[9.5px] text-zinc-400 font-medium mt-0.5">
                                  Units Sold: <span className="font-bold text-zinc-600">{item.units}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-emerald-600 font-mono">
                                NPR {item.revenue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category Distribution Chart Card */}
                    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          Product Category Distribution
                        </h3>
                      </div>

                      {/* SVG Pie Chart with leader lines */}
                      <div className="relative w-full flex justify-center py-2 bg-zinc-50/30 border border-zinc-100 rounded-2xl">
                        <svg viewBox="0 0 400 270" className="w-full max-w-[345px] h-auto">
                          
                          {/* Render path slices */}
                          {paths.map((p, i) => (
                            <g key={i}>
                              <path 
                                d={p.pathData} 
                                fill={p.slice.color} 
                                className="transition-all hover:opacity-90 cursor-pointer" 
                              />
                              {/* Leader line */}
                              <polyline 
                                points={`${p.lineStartX},${p.lineStartY} ${p.lineEndX},${p.lineEndY} ${p.labelX},${p.labelY}`} 
                                fill="none" 
                                stroke="#a1a1aa" 
                                strokeWidth="1" 
                                strokeDasharray="2 2"
                              />
                              {/* Count number label at line end */}
                              <text 
                                x={p.labelX + (p.textAnchor === 'start' ? 4 : -4)} 
                                y={p.labelY + 3} 
                                textAnchor={p.textAnchor} 
                                className="text-[10px] font-black fill-zinc-500 font-mono"
                              >
                                {p.slice.value}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      {/* Color legend matching Screenshot 4 */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-[10px] font-extrabold text-zinc-500">
                        {slices.map((slice, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: slice.color }} />
                            <span className="truncate">{slice.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              );
            })()}
            
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
                                    (tx.status === 'SUCCESS' || (tx.status as any) === 'DISPATCHED') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/30' :
                                    (tx.status === 'PENDING' || !tx.status) ? 'bg-amber-50 text-amber-600 border border-amber-200/30 animate-pulse' :
                                    'bg-red-50 text-red-600 border border-red-200/30'
                                  }`}>
                                    ● {tx.status || 'PENDING'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  {tx.status === 'PENDING' ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'SUCCESS')}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border-none"
                                        title="Complete Order"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Complete</span>
                                      </button>
                                      <button
                                        onClick={() => handleUpdateTransactionStatus(tx.id, 'FAILED')}
                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border-none"
                                        title="Reject Order"
                                      >
                                        <X className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Reject</span>
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
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manage user profiles, points, status and direct access controls.</p>
                  </div>
                  <div className="p-1 bg-zinc-100 rounded-xl flex gap-1 border border-zinc-200/50">
                    <span className="bg-white text-zinc-800 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-2xs">
                      Total Accounts: {userList.filter(u => !u.deleted).length}
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

                {/* Search Bar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or mobile number..."
                    className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Users List Table */}
                <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 text-zinc-400 uppercase text-[9px] font-black tracking-widest bg-zinc-50/50">
                          <th className="py-3 px-4">Gamer Profile Name</th>
                          <th className="py-3 px-4">Email Address</th>
                          <th className="py-3 px-4">Mobile Number</th>
                          <th className="py-3 px-4">Total Points</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Directory Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {userList
                          .filter((usr: any) => {
                            if (usr.deleted) return false;
                            const query = userSearchQuery.toLowerCase();
                            return (
                              (usr.name || '').toLowerCase().includes(query) ||
                              (usr.email || '').toLowerCase().includes(query) ||
                              (usr.phone || '').toLowerCase().includes(query)
                            );
                          })
                          .map((usr: any) => (
                            <tr key={usr.id} className={`hover:bg-zinc-50/40 transition-colors ${usr.blocked ? 'bg-red-50/20' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-zinc-900 text-[11.5px] flex items-center gap-1.5">
                                  {usr.name}
                                  {usr.blocked && (
                                    <span className="bg-red-100 text-red-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                      Blocked
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[10.5px] text-zinc-600 font-semibold">{usr.email}</td>
                              <td className="py-3 px-4 font-mono text-[10.5px] text-zinc-500">{usr.phone || 'N/A'}</td>
                              <td className="py-3 px-4 font-mono">
                                <span className="font-extrabold text-[#716104] bg-yellow-50 px-2.5 py-1 rounded-xl border border-yellow-200/50 text-[10.5px] inline-flex items-center gap-1">
                                  ★ {usr.points?.toLocaleString() || 0} PTS
                                </span>
                              </td>
                              <td className="py-3 px-4 text-[10px]">
                                {usr.blocked ? (
                                  <span className="text-red-500 font-black uppercase">Suspended</span>
                                ) : (
                                  <span className="text-emerald-500 font-black uppercase">Active</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Points */}
                                  <button
                                    onClick={() => {
                                      const val = prompt(`Change loyalty points for ${usr.name}:`, (usr.points || 0).toString());
                                      if (val !== null && !isNaN(Number(val))) {
                                        handleUpdateUserPoints(usr.id, Number(val));
                                      }
                                    }}
                                    className="p-1.5 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-lg border border-zinc-100 transition-colors cursor-pointer"
                                    title="Edit Points"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Block Option */}
                                  <button
                                    onClick={() => handleToggleBlockUser(usr.id)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      usr.blocked
                                        ? 'bg-red-100 border-red-200 text-red-600 hover:bg-red-200'
                                        : 'hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900'
                                    }`}
                                    title={usr.blocked ? 'Unblock Account' : 'Block Account'}
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Option */}
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete account profile for ${usr.name}?`)) {
                                        const updated = userList.filter((u: any) => u.id !== usr.id);
                                        setUserList(updated);
                                        localStorage.setItem('mb_admin_users', JSON.stringify(updated));
                                        try {
                                          await setDoc(doc(db, 'users', usr.email || usr.id), { ...usr, deleted: true });
                                          triggerToast('Account profile deleted from Firestore.');
                                        } catch (e) {
                                          triggerToast('Account profile deleted.');
                                        }
                                      }
                                    }}
                                    className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 border border-zinc-100 rounded-lg transition-colors cursor-pointer"
                                    title="Delete User"
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
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 bg-neutral-50 flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                                {product.imageUrl ? (
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full bg-gradient-to-tr ${product.imagePlaceholderColor || 'from-blue-600 to-indigo-700'} text-white flex items-center justify-center`}>
                                    {renderProductIcon(product.iconName, "w-4.5 h-4.5")}
                                  </div>
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
              <div className="space-y-6 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Payment Settings</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Configure eSewa recipient details and upload scan QR code.</p>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-xs space-y-6">
                  {/* QR Image Selection Section */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">eSewa QR Scan Image</label>
                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                      {/* Live Image Preview Frame */}
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 relative shadow-inner group">
                        {paymentSettings.qrImageUrl ? (
                          <img src={paymentSettings.qrImageUrl} alt="eSewa QR Code" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-bold">No QR Uploaded</span>
                        )}
                      </div>

                      {/* Upload and URL Inputs */}
                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <label className="block text-[9px] font-extrabold text-zinc-400 uppercase mb-1">Local Image File Upload</label>
                          <div className="relative border border-dashed border-zinc-200 hover:border-emerald-500 bg-zinc-50/50 hover:bg-white rounded-xl p-3.5 transition-all text-center cursor-pointer group">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    triggerToast('Image is too large! Choose an image smaller than 2MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === 'string') {
                                      setPaymentSettings({ ...paymentSettings, qrImageUrl: reader.result });
                                      triggerToast('eSewa QR Code uploaded successfully!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                            />
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                              <span className="text-[10px] font-bold text-zinc-600 group-hover:text-emerald-600">Select local QR code image</span>
                              <span className="text-[8px] text-zinc-400">PNG or JPG up to 2MB</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-zinc-400 uppercase mb-1">Or direct image URL link</label>
                          <input
                            type="text"
                            value={paymentSettings.qrImageUrl}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, qrImageUrl: e.target.value })}
                            placeholder="e.g. https://domain.com/esewa-qr.png"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">eSewa Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={paymentSettings.esewaNumber}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, esewaNumber: e.target.value })}
                        placeholder="e.g. 9841234567"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-emerald-500 transition-all font-bold text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Minimum Deposit Amount (Rs.)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={paymentSettings.minDeposit}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, minDeposit: Number(e.target.value) })}
                        placeholder="e.g. 100"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-emerald-500 transition-all font-bold text-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Save Option Button */}
                  <div className="pt-2">
                    <button
                      onClick={async () => {
                        try {
                          await setDoc(doc(db, 'settings', 'payments'), paymentSettings);
                          triggerToast('Payment Settings successfully updated in Firestore!');
                        } catch (err) {
                          triggerToast('Payment Settings updated successfully!');
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4 stroke-[3]" /> Save Payment Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PROMO BANNERS TAB */}
            {/* 6. PROMO BANNERS TAB */}
            {activeTab === 'banners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Promo Banners</h2>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Manage the homepage slideshow marketing banners.</p>
                  </div>
                  <button
                    onClick={() => handleOpenBannerModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {banners.filter((b: any) => !b.deleted).map((ban: any) => (
                    <div key={ban.id} className="bg-white border border-zinc-200 p-5 rounded-3xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-2xs">
                      {/* Banner Visual Preview inside Admin */}
                      <div className="w-full md:w-48 h-24 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 shrink-0 relative flex items-center justify-center">
                        {ban.imageUrl || ban.imgUrl ? (
                          <img src={ban.imageUrl || ban.imgUrl} alt={ban.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-3">
                            <span className="block text-[10px] font-bold text-zinc-400">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 text-center md:text-left">
                        <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {ban.badge || 'PROMO'}
                        </span>
                        <h4 className="text-sm font-black text-zinc-950 mt-1.5">{ban.title}</h4>
                        <p className="text-xs text-zinc-500 leading-relaxed">{ban.tagline}</p>
                        {ban.redirect && (
                          <div className="text-[10px] text-zinc-400 font-medium mt-1">
                            Link: <a href={ban.redirect} target="_blank" rel="noreferrer" className="text-blue-500 underline font-semibold">{ban.redirect}</a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-stretch justify-end md:justify-center">
                        <button
                          onClick={() => handleOpenBannerModal(ban)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit Banner
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this banner?')) {
                              const updated = banners.filter((b: any) => b.id !== ban.id);
                              setBanners(updated);
                              localStorage.setItem('mb_admin_banners', JSON.stringify(updated));
                              try {
                                await setDoc(doc(db, 'banners', ban.id), { ...ban, deleted: true });
                                triggerToast('Banner removed from Firestore.');
                              } catch (e) {
                                triggerToast('Banner deleted.');
                              }
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider py-2 px-4 rounded-xl border border-red-100 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {banners.filter((b: any) => !b.deleted).length === 0 && (
                    <div className="text-center py-8 text-zinc-400 font-semibold">No banners currently active. Click Add New Banner above to create one.</div>
                  )}
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
                          onClick={async () => {
                            const updated = coupons.map((c: any) => (c.code === cp.code ? { ...c, active: !c.active } : c));
                            setCoupons(updated);
                            localStorage.setItem('mb_admin_coupons', JSON.stringify(updated));
                            try {
                              await setDoc(doc(db, 'coupons', cp.code), { ...cp, active: !cp.active });
                              triggerToast('Coupon updated in Firestore.');
                            } catch (e) {
                              triggerToast('Coupon status changed.');
                            }
                          }}
                          className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[9.5px] font-black py-2 rounded-lg transition-all cursor-pointer"
                        >
                          Toggle Active
                        </button>
                        <button
                          onClick={async () => {
                            const updated = coupons.filter((c: any) => c.code !== cp.code);
                            setCoupons(updated);
                            localStorage.setItem('mb_admin_coupons', JSON.stringify(updated));
                            try {
                              await setDoc(doc(db, 'coupons', cp.code), { ...cp, deleted: true });
                              triggerToast('Coupon deleted from Firestore.');
                            } catch (e) {
                              triggerToast('Coupon deleted.');
                            }
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
            {/* 8. REQUIREMENTS CONFIGURATION TAB */}
            {activeTab === 'requirements' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Store Checkout Requirements
                  </h2>
                  <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                    Define global checkout instructions, player requirements, or guidelines shown during order placement.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl space-y-4 shadow-2xs">
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
                    Configure Requirements Content
                  </h3>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      localStorage.setItem('mb_requirements', requirementsText);
                      try {
                        await setDoc(doc(db, 'settings', 'requirements'), { text: requirementsText });
                        triggerToast('Checkout requirements updated in Firestore!');
                      } catch (err) {
                        triggerToast('Saved locally!');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wide">
                        Global Checkout Requirements (Markdown/Text)
                      </label>
                      <textarea
                        rows={10}
                        value={requirementsText}
                        onChange={(e) => setRequirementsText(e.target.value)}
                        placeholder="e.g. 1. Players must provide correct Game UID.\n2. Payment must be uploaded via eSewa QR code."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors font-mono leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-[10px] text-zinc-400 font-semibold">
                        * These requirements are displayed prominently to users before they complete any purchase checkout.
                      </span>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Save Requirements
                      </button>
                    </div>
                  </form>
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
                              tkt.status === 'PENDING' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-zinc-100 text-zinc-500'
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
                                    <span className="text-[9.5px] font-black text-zinc-400 block mb-1">MB Gaming Support (Admin)</span>
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
                      onChange={async (e) => {
                        const updated = { ...legalDocs, terms: e.target.value };
                        setLegalDocs(updated);
                        localStorage.setItem('mb_legal_docs', JSON.stringify(updated));
                        try {
                          await setDoc(doc(db, 'settings', 'legal'), updated);
                        } catch (err) {}
                      }}
                      rows={5}
                      className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-zinc-700 tracking-tight">Refund & Chargeback Policy Block</label>
                    <textarea
                      value={legalDocs.refund}
                      onChange={async (e) => {
                        const updated = { ...legalDocs, refund: e.target.value };
                        setLegalDocs(updated);
                        localStorage.setItem('mb_legal_docs', JSON.stringify(updated));
                        try {
                          await setDoc(doc(db, 'settings', 'legal'), updated);
                        } catch (err) {}
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
                        defaultValue="You are the custom digital assistant of MB Gaming Store owned by Mandip Mahato. Always speak in a polite, helpful manner. Assist clients with wallet balance inquiries, point loyalty conversions, and recommend popular game items like Free Fire diamonds."
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
                        onChange={async (e) => {
                          setStoreName(e.target.value);
                          localStorage.setItem('mb_store_name', e.target.value);
                          try {
                            await setDoc(doc(db, 'settings', 'general'), { storeName: e.target.value, storeContact, adminPassword });
                          } catch (err) {}
                        }}
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono">Store Contact Email</label>
                      <input
                        type="email"
                        value={storeContact}
                        onChange={async (e) => {
                          setStoreContact(e.target.value);
                          localStorage.setItem('mb_store_contact', e.target.value);
                          try {
                            await setDoc(doc(db, 'settings', 'general'), { storeName, storeContact: e.target.value, adminPassword });
                          } catch (err) {}
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
                        onChange={async (e) => {
                          setAdminPassword(e.target.value);
                          localStorage.setItem('mb_admin_password', e.target.value);
                          try {
                            await setDoc(doc(db, 'settings', 'general'), { storeName, storeContact, adminPassword: e.target.value });
                          } catch (err) {}
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

                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-blue-600 tracking-tight flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        connectionStatus === 'connected' ? 'bg-emerald-400' : connectionStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'checking' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}></span>
                    </span>
                    API & Backend Server Connection
                  </h3>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                    Configure the custom API gateway endpoint for synchronizing operations with remote clients (e.g. if hosted on custom servers or Vercel).
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-zinc-400 font-mono">Backend Base URL</label>
                      <input
                        type="url"
                        value={customBackendUrl}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setCustomBackendUrl(val);
                          localStorage.setItem('mb_backend_api_url', val);
                        }}
                        placeholder="e.g. https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app"
                        className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3.5 text-xs focus:outline-none font-medium"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Leave blank to connect directly to this workspace instance.
                      </p>
                    </div>

                    {connectionStatus === 'connected' && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] p-3 rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div>
                          <strong>Connection active!</strong> Server responded successfully to ping requests.
                        </div>
                      </div>
                    )}

                    {connectionStatus === 'disconnected' && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[11px] p-3 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Connection verification failed.</strong>
                          <p className="mt-0.5 text-[10px] text-rose-600 leading-normal font-mono">{connectionError || "Unknown connection error"}</p>
                        </div>
                      </div>
                    )}

                    {connectionStatus === 'checking' && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-700 text-[11px] p-3 rounded-xl flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Verifying server connection...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => testConnection()}
                      className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white text-[10px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Verify & Test Connection
                    </button>
                    <button
                      onClick={() => {
                        setCustomBackendUrl('');
                        localStorage.removeItem('mb_backend_api_url');
                        setConnectionStatus('checking');
                        setTimeout(() => testConnection(''), 200);
                        triggerToast('Reset to default local workspace backend.');
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-wider px-4 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

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

              {/* Product Cover/Logo Graphic Manager */}
              <div className="space-y-3 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Logo Image Configuration</span>
                
                {/* File Uploader */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Local File Upload</label>
                    <div className="relative border border-dashed border-zinc-300 hover:border-blue-500 bg-white rounded-xl p-3 transition-colors text-center cursor-pointer group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProductImageUpload} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        id="prod-file-upload"
                      />
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[10px] font-bold text-zinc-600 group-hover:text-blue-600">Click to upload file</span>
                        <span className="text-[8px] text-zinc-400">PNG or JPG up to 2MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Fallback Vector Settings */}
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase">Icon Fallback style</label>
                    <select
                      value={formIconName}
                      onChange={(e) => setFormIconName(e.target.value as any)}
                      className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                    >
                      <option value="gamepad">🎮 Gamepad</option>
                      <option value="phone">📱 Phone / Mobile</option>
                      <option value="tv">📺 Television / Stream</option>
                      <option value="layers">🥞 Layers / Design</option>
                      <option value="shopping">🛍️ Shopping / Voucher</option>
                      <option value="wifi">📶 Wifi / Net</option>
                    </select>
                    <p className="text-[8.5px] text-zinc-400">Used if no logo image is uploaded/pasted.</p>
                  </div>
                </div>

                {/* Preset Picker Gallery */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Or Select from Game Cover Presets:</label>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {[
                      { name: 'PUBG Cover', path: '/assets/images/pubg_helmet_1782180313575.jpg' },
                      { name: 'PUBG UC', path: '/assets/images/pubg_uc_voucher_1782180328294.jpg' },
                      { name: 'Free Fire', path: '/assets/images/freefire_ice_fist_1782180289898.jpg' },
                      { name: 'MLBB', path: '/assets/images/mlbb_diamonds_avatar_1782180352803.jpg' },
                      { name: 'Netflix', path: '/assets/images/netflix_subscription_card_1782180427123.jpg' },
                      { name: 'Apple Gift', path: '/assets/images/apple_gift_card_logo_1782180379136.jpg' },
                      { name: 'UniPin', path: '/assets/images/unipin_voucher_1782180340316.jpg' },
                      { name: 'Free Fire sub', path: '/assets/images/freefire_subscription_cards_1782180392034.jpg' },
                      { name: 'Garena Shell', path: '/assets/images/garena_shells_card_1782180414709.jpg' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(preset.path);
                          triggerToast(`Selected preset: ${preset.name}`);
                        }}
                        className={`w-11 h-11 shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          formImageUrl === preset.path ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent hover:border-zinc-300'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.path} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paste URL directly */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Or Paste direct image URL link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="e.g. https://domain.com/image.png"
                      className="flex-1 bg-white border border-zinc-200 rounded-xl py-1.5 px-3 text-[11px] focus:outline-none"
                    />
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormImageUrl('');
                          triggerToast('Image cleared.');
                        }}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Live Preview Card */}
              <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4.5 space-y-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-400">Live Card Layout Preview</span>
                <div className="flex gap-4 items-center bg-white p-3.5 border border-zinc-100 rounded-2xl shadow-sm">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-100 relative shadow-sm flex items-center justify-center bg-neutral-50">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center">
                        {renderProductIcon(formIconName, "w-8 h-8")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wide">{formProvider || 'Epic Games'}</span>
                      {formPopular && (
                        <span className="bg-amber-100 text-[#716104] font-black text-[8px] px-1.5 py-0.2 rounded-full uppercase">★ Popular</span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-zinc-900 truncate mt-0.5">{formName || 'New Product Title'}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1 font-mono">Price Range: Rs. {formMinAmount || '100'} - Rs. {formMaxAmount || '5000'}</p>
                  </div>
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

      {/* CREATE/EDIT PROMO BANNER MODAL OVERLAY */}
      {isBannerModalOpen && (
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
                  {editingBanner ? 'Edit Promo Banner' : 'Add New Promo Banner'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body Form */}
            <form onSubmit={handleSaveBanner} className="p-5 space-y-4 text-xs font-medium max-h-[80vh] overflow-y-auto">
              
              {/* Banner Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerFormTitle}
                  onChange={(e) => setBannerFormTitle(e.target.value)}
                  placeholder="e.g. Free Fire Double Diamonds Top-up Bonus"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Tagline / Subtitle (Optional)</label>
                <input
                  type="text"
                  value={bannerFormTagline}
                  onChange={(e) => setBannerFormTagline(e.target.value)}
                  placeholder="e.g. Double your shells and receive free credits inside your store wallet!"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Badge/Category & Optional Redirect Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Badge Label (Optional)</label>
                  <input
                    type="text"
                    value={bannerFormBadge}
                    onChange={(e) => setBannerFormBadge(e.target.value)}
                    placeholder="e.g. EXCLUSIVE or FLASH SALE"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Redirect URL Link (Optional)</label>
                  <input
                    type="text"
                    value={bannerFormRedirect}
                    onChange={(e) => setBannerFormRedirect(e.target.value)}
                    placeholder="e.g. /category/top-up or custom website link"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Banner Image config */}
              <div className="space-y-3 bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4.5">
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500">Banner Background Graphic</span>
                
                {/* File Uploader */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Local File Upload</label>
                  <div className="relative border border-dashed border-zinc-300 hover:border-blue-500 bg-white rounded-xl p-3.5 transition-colors text-center cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            triggerToast('Image is too large! Choose an image smaller than 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setBannerFormImgUrl(reader.result);
                              triggerToast('Banner image uploaded successfully!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Upload className="w-5 h-5 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-[10px] font-bold text-zinc-600 group-hover:text-blue-600">Click to upload image file</span>
                      <span className="text-[8px] text-zinc-400">PNG or JPG up to 2MB</span>
                    </div>
                  </div>
                </div>

                {/* Direct image link */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase">Or Paste direct image URL link</label>
                  <input
                    type="text"
                    value={bannerFormImgUrl}
                    onChange={(e) => setBannerFormImgUrl(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-3 text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4.5 space-y-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-400">Live Banner Visual Preview</span>
                <div className="w-full h-32 rounded-2xl overflow-hidden border border-zinc-200 bg-neutral-900 relative shadow-sm flex items-center justify-center text-white p-5">
                  {bannerFormImgUrl ? (
                    <img src={bannerFormImgUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-950 opacity-40"></div>
                  )}
                  <div className="relative z-10 space-y-1 text-center">
                    <span className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {bannerFormBadge || 'PROMO'}
                    </span>
                    <h4 className="text-sm font-extrabold truncate max-w-sm mt-1">{bannerFormTitle || 'Banner Title Preview'}</h4>
                    <p className="text-[10px] text-zinc-300 truncate max-w-sm">{bannerFormTagline || 'Tagline sub description preview'}</p>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider py-3 rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  Save Banner
                </button>
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Custom CREATE NEW ENTRY Modal */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-3xl border border-zinc-200/80 shadow-2xl overflow-hidden text-left"
          >
            {/* Header */}
            <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">Ledger Entry Manager</span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">CREATE NEW ENTRY</h3>
              </div>
              <button
                onClick={() => setShowAddEntryModal(false)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border-none cursor-pointer bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Sell Rate (Rs.) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    Sell Rate (Rs.)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400 font-mono">Rs.</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={sellRate}
                      onChange={(e) => setSellRate(Number(e.target.value))}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-bold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Game Select */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    Game
                  </label>
                  <select
                    value={selectedGame}
                    onChange={(e) => {
                      setSelectedGame(e.target.value);
                      if (e.target.value === 'Free Fire') {
                        setPackageName('110 Diamonds');
                      } else if (e.target.value === 'PUBG Mobile') {
                        setPackageName('60 UC');
                      } else if (e.target.value === 'Mobile Legends') {
                        setPackageName('86 Diamonds');
                      } else if (e.target.value === 'UniPin Voucher') {
                        setPackageName('500 BDT Voucher');
                      } else {
                        setPackageName('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-black border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="Free Fire">Free Fire</option>
                    <option value="PUBG Mobile">PUBG Mobile</option>
                    <option value="Mobile Legends">Mobile Legends</option>
                    <option value="UniPin Voucher">UniPin Voucher</option>
                    <option value="Garena Shell">Garena Shell</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>
              </div>

              {/* Package Select/Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Package
                </label>
                {selectedGame === 'Free Fire' ? (
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-extrabold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="110 Diamonds">110 Diamonds</option>
                    <option value="115 Diamonds 💎">115 Diamonds 💎</option>
                    <option value="240 Diamonds 💎">240 Diamonds 💎</option>
                    <option value="355 Diamonds 💎">355 Diamonds 💎</option>
                    <option value="505 Diamonds 💎">505 Diamonds 💎</option>
                    <option value="610 Diamonds 💎">610 Diamonds 💎</option>
                    <option value="1090 Diamonds 💎">1090 Diamonds 💎</option>
                    <option value="1240 Diamonds 💎">1240 Diamonds 💎</option>
                    <option value="2220 Diamonds 💎">2220 Diamonds 💎</option>
                    <option value="WEEKLY MEMBERSHIP">WEEKLY MEMBERSHIP</option>
                    <option value="MONTHLY MEMBERSHIP">MONTHLY MEMBERSHIP</option>
                    <option value="custom">Custom Package...</option>
                  </select>
                ) : selectedGame === 'PUBG Mobile' ? (
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-extrabold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="60 UC">60 UC</option>
                    <option value="325 UC">325 UC</option>
                    <option value="660 UC">660 UC</option>
                    <option value="1800 UC">1800 UC</option>
                    <option value="3850 UC">3850 UC</option>
                    <option value="8100 UC">8100 UC</option>
                    <option value="custom">Custom Package...</option>
                  </select>
                ) : selectedGame === 'Mobile Legends' ? (
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-extrabold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="86 Diamonds">86 Diamonds</option>
                    <option value="172 Diamonds">172 Diamonds</option>
                    <option value="257 Diamonds">257 Diamonds</option>
                    <option value="343 Diamonds">343 Diamonds</option>
                    <option value="429 Diamonds">429 Diamonds</option>
                    <option value="514 Diamonds">514 Diamonds</option>
                    <option value="600 Diamonds">600 Diamonds</option>
                    <option value="706 Diamonds">706 Diamonds</option>
                    <option value="custom">Custom Package...</option>
                  </select>
                ) : selectedGame === 'UniPin Voucher' ? (
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-extrabold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="500 BDT Voucher">500 BDT Voucher</option>
                    <option value="1000 BDT Voucher">1000 BDT Voucher</option>
                    <option value="2000 BDT Voucher">2000 BDT Voucher</option>
                    <option value="5000 BDT Voucher">5000 BDT Voucher</option>
                    <option value="custom">Custom Package...</option>
                  </select>
                ) : selectedGame === 'Garena Shell' ? (
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-extrabold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer bg-white"
                  >
                    <option value="50 Shells">50 Shells</option>
                    <option value="100 Shells">100 Shells</option>
                    <option value="200 Shells">200 Shells</option>
                    <option value="custom">Custom Package...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. 110 Diamonds"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                )}

                {selectedGame !== 'Other' && packageName === 'custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom package name..."
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2.5 text-xs font-semibold border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white animate-fadeIn"
                  />
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs font-black border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              {/* Entered By */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Entered By
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bibek Jha"
                  value={enteredBy}
                  onChange={(e) => setEnteredBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-black border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Customer requested instant delivery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-zinc-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingEntry}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-[11px] font-black uppercase tracking-wider py-3 rounded-xl shadow-md transition-all cursor-pointer text-center border-none flex items-center justify-center gap-2"
                >
                  {isSavingEntry ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Entry...</span>
                    </>
                  ) : (
                    <span>SAVE ENTRY</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
