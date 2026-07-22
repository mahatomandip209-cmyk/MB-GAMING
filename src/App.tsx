import { useState, useMemo, FormEvent, MouseEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Gamepad,
  Tv,
  Music,
  Search,
  Plus,
  Minus,
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
  ShieldAlert,
  LogIn,
  LogOut,
  Headphones,
  Shield,
  Zap,
  Percent,
  Coins,
  Facebook,
  Copy,
  Upload,
  Eye,
  Lock
} from 'lucide-react';
import { Category, Product, Transaction } from './types';
import { ALL_PRODUCTS, PROMO_BANNERS } from './data';
import AdminPanel from './components/AdminPanel';
import { LoginRegister } from './components/LoginRegister';
import { db, auth, signOut, collection, getDocs, onSnapshot, doc, setDoc } from './firebase';

export function getProductPackages(product: Product): { name: string; price: number }[] {
  // Check if the product has custom packages stored on the database object
  if (product.packages && product.packages.length > 0) {
    return product.packages;
  }
  return [];
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export default function App() {
  // STATE MANAGEMENT
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('mb_products_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(() => [
    { id: 'top-up', name: 'Top Up' },
    { id: 'subscription', name: 'Subscription' },
    { id: 'design', name: 'Design' }
  ]);

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; walletBalance: number; loyaltyPoints: number } | null>(() => {
    const saved = localStorage.getItem('mb_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const unified = parsed.walletBalance ?? parsed.balance ?? parsed.loyaltyPoints ?? parsed.points;
          if (unified !== undefined) {
            parsed.walletBalance = Number(unified);
            parsed.loyaltyPoints = Number(unified);
          }
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const savedUser = localStorage.getItem('mb_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const unified = u.walletBalance ?? u.balance ?? u.loyaltyPoints ?? u.points;
        if (unified !== undefined) return Number(unified);
      } catch {}
    }
    const saved = localStorage.getItem('mb_gaming_wallet');
    if (saved) return Number(saved);
    const savedPts = localStorage.getItem('mb_gaming_loyalty');
    return savedPts ? Number(savedPts) : 0;
  });

  useEffect(() => {
    localStorage.setItem('mb_gaming_wallet', walletBalance.toString());
  }, [walletBalance]);

  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(() => walletBalance);

  useEffect(() => {
    localStorage.setItem('mb_gaming_loyalty', walletBalance.toString());
  }, [walletBalance]);

  const [teamMembers, setTeamMembers] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('mb_team_member_emails');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const unsubscribeTeam = onSnapshot(collection(db, 'team_members'), (snapshot) => {
      const emails: string[] = [];
      snapshot.forEach((doc) => {
        emails.push(doc.id.toLowerCase());
      });
      setTeamMembers(emails);
      localStorage.setItem('mb_team_member_emails', JSON.stringify(emails));
    }, (error) => {
      console.warn("Team members snapshot notice:", error?.message || error);
      try {
        const cached = localStorage.getItem('mb_team_member_emails');
        if (cached) setTeamMembers(JSON.parse(cached));
      } catch {}
    });
    return () => unsubscribeTeam();
  }, []);

  // Real-time account deletion auto-logout listener
  useEffect(() => {
    if (!currentUser?.email) return;
    const emailLower = currentUser.email.toLowerCase();

    // 1. Listen for deleted_users collection entry
    const unsubDeleted = onSnapshot(doc(db, 'deleted_users', emailLower), (snap) => {
      if (snap.exists()) {
        signOut(auth).catch(() => {});
        setCurrentUser(null);
        localStorage.removeItem('mb_current_user');
        localStorage.removeItem('mb_gaming_wallet');
        localStorage.removeItem('mb_gaming_loyalty');
        triggerToast("Your account has been deleted.");
      }
    }, (err) => {
      console.warn("Deleted user listener error:", err);
    });

    // 2. Listen for removal from users collection (for non-primary admin)
    const unsubUser = onSnapshot(doc(db, 'users', emailLower), (snap) => {
      const isPrimaryAdmin = emailLower === 'mandipmahato717@gmail.com' || 
                             emailLower === 'bnyshopadminpanel@gmail.com' || 
                             emailLower === 'bnyadminpanel@hotmail.com';
      if (!snap.exists() && !isPrimaryAdmin) {
        signOut(auth).catch(() => {});
        setCurrentUser(null);
        localStorage.removeItem('mb_current_user');
        localStorage.removeItem('mb_gaming_wallet');
        localStorage.removeItem('mb_gaming_loyalty');
        triggerToast("Your account has been deleted.");
      } else if (snap.exists()) {
        const data = snap.data();
        if (data?.status === 'DELETED' || data?.isDeleted) {
          signOut(auth).catch(() => {});
          setCurrentUser(null);
          localStorage.removeItem('mb_current_user');
          localStorage.removeItem('mb_gaming_wallet');
          localStorage.removeItem('mb_gaming_loyalty');
          triggerToast("Your account has been deleted.");
        }
      }
    }, (err) => {
      console.warn("User status listener error:", err);
    });

    return () => {
      unsubDeleted();
      unsubUser();
    };
  }, [currentUser?.email]);

  // Sync user profile state changes
  useEffect(() => {
    if (currentUser) {
      const updated = {
        ...currentUser,
        walletBalance,
        loyaltyPoints
      };
      localStorage.setItem('mb_current_user', JSON.stringify(updated));
      
      // Update Firestore directly
      try {
        const userDocRef = doc(db, 'users', currentUser.email);
        setDoc(userDocRef, { walletBalance, loyaltyPoints }, { merge: true }).catch(err => {
          console.warn("Direct Firestore profile sync warning:", err);
        });
      } catch (e) {
        console.error("Firestore direct sync error:", e);
      }
      
      fetch(getBackendUrl('/api/auth/sync-profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: currentUser.email,
          walletBalance,
          loyaltyPoints
        })
      }).catch(err => {
        console.warn("Background auth profile sync warning:", err);
      });
    } else {
      localStorage.removeItem('mb_current_user');
    }
  }, [currentUser, walletBalance, loyaltyPoints]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Web Push Subscription Diagnostics State
  const [pushSubscriptionState, setPushSubscriptionState] = useState<'checking' | 'active' | 'inactive' | 'error' | 'unsupported'>('checking');
  const [pushSubscriptionError, setPushSubscriptionError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState<boolean>(false);
  
  // Navigation states
  const [activeBottomNav, setActiveBottomNav] = useState<'home' | 'orders' | 'wallet' | 'favorites' | 'profile'>('home');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('all');
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<string>('');
  const [mlbbUserId, setMlbbUserId] = useState<string>('');
  const [mlbbZoneId, setMlbbZoneId] = useState<string>('');
  const [checkoutAmount, setCheckoutAmount] = useState<number>(0);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // Wallet top-up state
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [customWalletAdd, setCustomWalletAdd] = useState<string>('');
  const [paymentSettings, setPaymentSettings] = useState({
    qrImageUrl: 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
    esewaNumber: '9841234567',
    minDeposit: 100,
  });
  const [depositRequests, setDepositRequests] = useState<any[]>([]);
  const [selectedDepositScreenshot, setSelectedDepositScreenshot] = useState<string | null>(null);
  const [depositScreenshotBase64, setDepositScreenshotBase64] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  
  // Success states
  const [showSuccessOverlay, setShowSuccessOverlay] = useState<boolean>(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // App settings/blocking states
  const [themeMode, setThemeMode] = useState<'light' | 'black'>('light');
  const [isUserBlocked, setIsUserBlocked] = useState<boolean>(false);

  // Active Promo Index for the main slider
  const [promoIndex, setPromoIndex] = useState<number>(0);
  const [banners, setBanners] = useState<any[]>(PROMO_BANNERS);

  // Client Notification states
  const [serverNotifications, setServerNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [showAutoNotifPrompt, setShowAutoNotifPrompt] = useState<boolean>(false);

  // Connection states for other mobile devices
  const [customBackendUrl, setCustomBackendUrl] = useState<string>(() => {
    return localStorage.getItem('mb_backend_api_url') || '';
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [connectionError, setConnectionError] = useState<string>('');

  const testConnection = async (targetUrl?: string) => {
    const urlToTest = targetUrl || customBackendUrl;
    if (!urlToTest) {
      setConnectionStatus('disconnected');
      setConnectionError('No backend URL configured.');
      return false;
    }
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
        throw new Error("Response is not successful");
      }
    } catch (err) {
      console.error("Connection test failed:", err);
      setConnectionStatus('disconnected');
      setConnectionError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const getBackendUrl = (path: string): string => {
    const savedBackend = localStorage.getItem('mb_backend_api_url');
    if (savedBackend && savedBackend.trim() !== '') {
      return `${savedBackend.trim()}${path}`;
    }
    const isLocalOrPreview = window.location.hostname.includes('run.app') || 
                             window.location.hostname.includes('localhost') || 
                             window.location.hostname.includes('127.0.0.1');
    const backendBase = isLocalOrPreview ? '' : 'https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app';
    return `${backendBase}${path}`;
  };

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
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
        throw new Error(`Response is not JSON (got "${contentType}"). Content preview: "${excerpt}"`);
      }
      
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON syntax: ${e instanceof Error ? e.message : String(e)}. Content preview: "${text.substring(0, 100)}"`);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleNewNotificationAlert = async (notificationsList: any[]) => {
    if (notificationsList.length > 0) {
      const latest = notificationsList[0];
      const lastSeenId = localStorage.getItem('mb_gaming_last_seen_notif_id');
      
      if (lastSeenId) {
        if (lastSeenId !== latest.id) {
          // Play a premium professional notification chime
          try {
            const audio = new Audio("https://raw.githubusercontent.com/yis6/Sound-files/master/Notification.mp3");
            audio.volume = 0.9;
            audio.play().catch(e => console.log('[Notification Sound] Autoplay blocked or deferred:', e));
          } catch (soundErr) {
            console.warn('[Notification Sound] Could not play chime:', soundErr);
          }

          // Display a beautiful in-app toast notification instantly!
          triggerToast(`🔔 ${latest.title}: ${latest.body}`);
          
          // Also trigger a device native push notification if permission is granted
          if ('Notification' in window && Notification.permission === 'granted') {
            if ('serviceWorker' in navigator) {
              const reg = await navigator.serviceWorker.ready;
              reg.showNotification(latest.title, {
                body: latest.body,
                icon: latest.iconUrl || "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
                badge: "https://img.icons8.com/ios-filled/96/ffffff/game-controller.png",
                vibrate: [300, 100, 300],
                tag: latest.id,
                data: {
                  url: '/'
                }
              } as any);
            } else {
              new Notification(latest.title, {
                body: latest.body,
                icon: latest.iconUrl || "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg"
              });
            }
          }
        }
      }
      
      // Record the ID so we only alert on brand new incoming notifications
      localStorage.setItem('mb_gaming_last_seen_notif_id', latest.id);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await safeFetchJson(getBackendUrl('/api/notifications'));
      if (data.success && data.notifications) {
        setServerNotifications(data.notifications);
        handleNewNotificationAlert(data.notifications);
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch notifications via API, fallback to Firestore direct:", err);
    }

    // Direct Firestore fallback
    try {
      const snap = await getDocs(collection(db, "notifications"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setServerNotifications(list);
      handleNewNotificationAlert(list);
    } catch (fsErr: any) {
      console.warn("Firestore notifications fallback notice:", fsErr?.message || fsErr);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await safeFetchJson(getBackendUrl('/api/transactions'));
      if (data.success && data.transactions) {
        setTransactions(data.transactions);
        return;
      }
    } catch (err) {
      console.warn("Error fetching transactions from server, fallback to Firestore:", err);
    }

    // Direct Firestore fallback
    try {
      const snap = await getDocs(collection(db, "transactions"));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
      setTransactions(list);
    } catch (fsErr: any) {
      console.warn("Firestore transactions fallback notice:", fsErr?.message || fsErr);
    }
  };

  // Register PWA Service Worker & subscribe to real-time updates
  useEffect(() => {
    setIsIframe(window.self !== window.top);
    testConnection();

    // 1. Real-time notifications listener
    const unsubscribeNotif = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => b.timestamp - a.timestamp);
      setServerNotifications(list);
      handleNewNotificationAlert(list);
    }, (error) => {
      console.warn("Real-time notifications listener notice:", error?.message || error);
      fetchNotifications();
    });

    // 2. Real-time transactions listener
    const unsubscribeTx = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
      setTransactions(list);
    }, (error) => {
      console.warn("Real-time transactions listener notice:", error?.message || error);
      fetchTransactions();
    });

    // Real-time payments settings listener
    const unsubscribePayments = onSnapshot(doc(db, "settings", "payments"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPaymentSettings({
          qrImageUrl: data.qrImageUrl || 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
          esewaNumber: data.esewaNumber || data.esewa?.number || '9841234567',
          minDeposit: data.minDeposit !== undefined ? Number(data.minDeposit) : 100,
        });
      }
    }, (error) => {
      console.warn("Failed to load payments settings notice:", error?.message || error);
    });

    // Real-time general/theme settings listener
    const unsubscribeGeneral = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.themeMode === 'black' || data.themeMode === 'dark') {
          setThemeMode('black');
        } else {
          setThemeMode('light');
        }
      }
    }, (error) => {
      console.warn("Failed to load general settings notice:", error?.message || error);
    });

    // 3. Real-time products listener
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setProducts(list);
      try {
        localStorage.setItem('mb_products_cache', JSON.stringify(list));
      } catch {}
    }, (error) => {
      console.warn("Real-time products listener notice:", error?.message || error);
      try {
        const cached = localStorage.getItem('mb_products_cache');
        if (cached) setProducts(JSON.parse(cached));
      } catch {}
    });

    // 3b. Real-time categories listener
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setCategories(list);
      } else {
        // Seed initial categories directly to Firestore when empty
        const defaultCategories = [
          { id: 'top-up', name: 'Top Up' },
          { id: 'subscription', name: 'Subscription' },
          { id: 'design', name: 'Design' }
        ];
        defaultCategories.forEach(async (cat) => {
          try {
            await setDoc(doc(db, "categories", cat.id), { id: cat.id, name: cat.name });
          } catch (err) {
            console.warn("Failed to populate initial category:", cat.id, err);
          }
        });
        setCategories(defaultCategories);
      }
    }, (error) => {
      console.warn("Real-time categories listener notice:", error?.message || error);
    });

    // 3c. Real-time banners listener
    const unsubscribeBanners = onSnapshot(collection(db, "banners"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((b: any) => !b.deleted) as any[];
        setBanners(list.length > 0 ? list : PROMO_BANNERS);
      } else {
        setBanners(PROMO_BANNERS);
      }
    }, (error) => {
      console.warn("Real-time banners listener notice:", error?.message || error);
      setBanners(PROMO_BANNERS);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[App] Service Worker registered with scope:', reg.scope);
          // Send backend url to service worker
          const savedBackend = localStorage.getItem('mb_backend_api_url') || 'https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app';
          
          // Send message immediately if there is an active worker
          if (reg.active) {
            reg.active.postMessage({ type: 'SET_BACKEND_URL', url: savedBackend });
            syncPushSubscription();
          }
          
          // Also set up a listener for controllerchange or statechange to send it as soon as a worker becomes active
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  newWorker.postMessage({ type: 'SET_BACKEND_URL', url: savedBackend });
                  syncPushSubscription();
                }
              });
            }
          });
        })
        .catch((err) => {
          console.error('[App] Service Worker registration failed:', err);
        });
    }

    if ('Notification' in window) {
      const currentPerm = Notification.permission;
      setNotifPermission(currentPerm);
    }

    return () => {
      unsubscribeNotif();
      unsubscribeTx();
      unsubscribePayments();
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeBanners();
      unsubscribeGeneral();
    };
  }, []);

  // Subscribe to logged-in user profile changes (real-time balance and points)
  useEffect(() => {
    if (!currentUser) {
      setIsUserBlocked(false);
      return;
    }
    
    const userDocRef = doc(db, 'users', currentUser.email);
    const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const unified = data.walletBalance ?? data.balance ?? data.loyaltyPoints ?? data.points;
        if (unified !== undefined) {
          const val = Number(unified);
          setWalletBalance(val);
          setLoyaltyPoints(val);
        }
        setIsUserBlocked(!!data.blocked);
      }
    }, (error) => {
      console.warn("User profile subscription notice:", error?.message || error);
    });
    
    return () => unsubscribeUser();
  }, [currentUser?.email]);

  // Synchronize system theme modes (light vs black)
  useEffect(() => {
    if (themeMode === 'black') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [themeMode]);

  // Subscribe to logged-in user's deposit/refill requests
  useEffect(() => {
    if (!currentUser) {
      setDepositRequests([]);
      return;
    }
    const unsubscribeDeposits = onSnapshot(collection(db, "deposits"), (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((dep: any) => dep.userEmail?.toLowerCase() === currentUser.email.toLowerCase());
      list.sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
      setDepositRequests(list);
    }, (error) => {
      console.warn("Failed to load user deposit requests notice:", error?.message || error);
    });
    return () => unsubscribeDeposits();
  }, [currentUser?.email]);

  // Synchronize Push Subscription with Backend
  const syncPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      setPushSubscriptionState('unsupported');
      return;
    }
    if (Notification.permission !== 'granted') {
      setPushSubscriptionState('inactive');
      return;
    }
    
    setPushSubscriptionState('checking');
    try {
      const reg = await navigator.serviceWorker.ready;
      
      // Check if pushManager is supported (some platforms/browsers disable it)
      if (!reg.pushManager) {
        console.warn('[Push] reg.pushManager is not available on this device/browser context.');
        setPushSubscriptionState('unsupported');
        return;
      }
      
      // Get current subscription
      let subscription = await reg.pushManager.getSubscription();
      
      // Fetch VAPID public key from backend
      const response = await fetch(getBackendUrl('/api/push/public-key'));
      const data = await response.json();
      
      if (data && data.success && data.publicKey) {
        const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);
        
        let shouldSubscribe = !subscription;
        
        if (subscription && subscription.options && subscription.options.applicationServerKey) {
          try {
            const existingKey = new Uint8Array(subscription.options.applicationServerKey);
            const newKey = convertedVapidKey;
            let match = existingKey.length === newKey.length;
            if (match) {
              for (let i = 0; i < existingKey.length; i++) {
                if (existingKey[i] !== newKey[i]) {
                  match = false;
                  break;
                }
              }
            }
            if (!match) {
              console.log('[Push] VAPID key mismatch detected. Re-subscribing device with current key...');
              await subscription.unsubscribe();
              shouldSubscribe = true;
            }
          } catch (e) {
            console.warn('[Push] Error checking existing subscription key, re-subscribing as fallback:', e);
            shouldSubscribe = true;
          }
        }
        
        // If there's no subscription or there was a key mismatch, subscribe
        if (shouldSubscribe) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        }
        
        console.log('[Push] Subscription synchronized successfully:', subscription);
        
        // Save/Sync on backend
        const syncResponse = await fetch(getBackendUrl('/api/push/subscribe'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription,
            email: currentUser ? currentUser.email : null
          })
        });
        
        const syncResult = await syncResponse.json();
        if (syncResult && syncResult.success) {
          setPushSubscriptionState('active');
          setPushSubscriptionError(null);
        } else {
          setPushSubscriptionState('error');
          setPushSubscriptionError(syncResult.error || 'Server rejected push subscription.');
        }
      } else {
        setPushSubscriptionState('error');
        setPushSubscriptionError(data?.error || 'Failed to fetch public key from backend.');
      }
    } catch (err: any) {
      console.warn('[Push] Error synchronizing push subscription:', err);
      setPushSubscriptionState('error');
      setPushSubscriptionError(err instanceof Error ? err.message : String(err));
    }
  };

  // Sync push subscription when current user logs in/out
  useEffect(() => {
    syncPushSubscription();
  }, [currentUser]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      triggerToast("Notifications are not supported on this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        triggerToast("🎉 Push Notifications successfully enabled!");
        
        // Sync push subscription right away
        syncPushSubscription();

        // Show immediate confirmation message using Service Worker
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("BNY SHOP", {
            body: "You will now receive alerts for recharges & flash sales! 🔔",
            icon: "https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg",
            badge: "https://img.icons8.com/ios-filled/96/ffffff/game-controller.png"
          });
        }
      } else {
        triggerToast("Notification permission denied.");
      }
    } catch (error) {
      console.error("Permission request error:", error);
      triggerToast("Could not request notification permissions.");
    }
  };

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

  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    
    // 2. Check if already dismissed
    const isDismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';

    if (isStandalone || isDismissed) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback for iOS Safari which doesn't support 'beforeinstallprompt'
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone && !isDismissed) {
      setShowPWAInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_banner_dismissed', 'true');
        setShowPWAInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Manual prompt fallback / guide
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        triggerToast("Tap the Safari 'Share' button at the bottom and select 'Add to Home Screen'! 📱");
      } else {
        triggerToast("Open browser options menu and click 'Install App' or 'Add to Home Screen'!");
      }
    }
  };

  const handleDismissInstall = () => {
    localStorage.setItem('pwa_banner_dismissed', 'true');
    setShowPWAInstallBanner(false);
  };

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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

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
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory || (selectedCategory === 'voucher' && product.category === 'vouchers');
      const matchSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.provider || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
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
    (window as any)._customReqValues = {};
    setMlbbUserId('');
    setMlbbZoneId('');
    setModalError('');
    
    // Set amount to 0 initially so no package is pre-selected from before
    setCheckoutAmount(0);
    setCustomAmountText('');
    setQuantity(1);
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

    if (!currentUser) {
      triggerToast('⚠️ Please Login or Register first to purchase products.');
      setSelectedProduct(null);
      setActiveBottomNav('profile');
      return;
    }

    if (isUserBlocked) {
      triggerToast('❌ Your account has been suspended by the administrator. Ordering is disabled.');
      setModalError('Your account has been suspended. Ordering is disabled.');
      return;
    }

    // Requirements validation
    const reqs = selectedProduct.requirements && Array.isArray(selectedProduct.requirements) ? selectedProduct.requirements : [];

    let finalTarget = '';
    if (reqs.length > 0) {
      const missing = reqs.filter(r => !((window as any)._customReqValues?.[r.name]?.trim()));
      if (missing.length > 0) {
        setModalError(`Please fill in all required fields: ${missing.map(m => m.name).join(', ')}`);
        return;
      }
      finalTarget = reqs.map(r => `${r.name}: ${((window as any)._customReqValues?.[r.name] || '').trim()}`).join(' | ');
    } else {
      if (!checkoutTarget.trim()) {
        setModalError(`Please enter a valid ${selectedProduct.inputLabel || 'Player ID'}.`);
        return;
      }
      finalTarget = checkoutTarget.trim();
    }

    if (checkoutAmount <= 0) {
      setModalError('Enter or choose a valid positive topup amount.');
      return;
    }

    // Skip min/max validation for preset/fixed packages to avoid errors on custom package listings
    const packages = getProductPackages(selectedProduct);
    const isPresetPackage = packages.some(p => p.price === checkoutAmount);

    if (!isPresetPackage) {
      if (checkoutAmount < selectedProduct.minAmount) {
        setModalError(`Minimum recharge amount is Rs. ${selectedProduct.minAmount}`);
        return;
      }

      if (selectedProduct.maxAmount && checkoutAmount > selectedProduct.maxAmount) {
        setModalError(`Maximum limit allowed is Rs. ${selectedProduct.maxAmount}`);
        return;
      }
    }

    // Check balance / points
    const totalCost = checkoutAmount * quantity;
    if (walletBalance < totalCost) {
      setModalError(`Insufficient funds/points in wallet! Your available balance is Rs. ${walletBalance}. Click "Wallet" in the top right to refill.`);
      return;
    }

    // Success flow! Deduct balance and create transaction
    const newBalance = walletBalance - totalCost;
    setWalletBalance(newBalance);
    setLoyaltyPoints(newBalance);

    if (!finalTarget) {
      finalTarget = currentUser?.email || 'N/A';
    }
    const selectedPkgName = getProductPackages(selectedProduct).find(p => p.price === checkoutAmount)?.name || `${selectedProduct.name} Custom`;
    const finalProdName = quantity > 1 ? `${selectedPkgName} (Qty: ${quantity})` : selectedPkgName;

    const newTx: Transaction = {
      id: `BNY-${Math.floor(100000 + Math.random() * 900000)}`,
      productId: selectedProduct.id,
      productName: finalProdName,
      provider: selectedProduct.provider,
      category: selectedProduct.category,
      amount: totalCost,
      targetAccount: finalTarget,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'PENDING',
      userEmail: currentUser?.email,
      email: currentUser?.email,
      quantity: quantity
    };

    setTransactions([newTx, ...transactions]);
    setLastCompletedTransaction(newTx);
    setSelectedProduct(null); // Close modal/view
    setShowSuccessOverlay(true); // Open success overlay
    triggerToast('Purchase request submitted for administrator review!');

    // Post to server for multi-device admin sync
    safeFetchJson(getBackendUrl('/api/transactions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newTx)
    }).then(() => {
      fetchTransactions();
    }).catch(err => {
      console.error("Failed to sync new order with server:", err);
    });
  };

  // Trigger brief alert messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle submission of deposit request with screenshot to Firestore
  const handleDepositSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setWalletError('Please sign in to submit a deposit request.');
      return;
    }

    if (isUserBlocked) {
      setWalletError('❌ Your account is suspended. Depositing is disabled.');
      triggerToast('❌ Your account is suspended. Depositing is disabled.');
      return;
    }

    const cleanAmt = Number(customWalletAdd);
    if (isNaN(cleanAmt) || cleanAmt < paymentSettings.minDeposit) {
      setWalletError(`Minimum deposit amount is Rs. ${paymentSettings.minDeposit}`);
      return;
    }

    if (!depositScreenshotBase64) {
      setWalletError('Please select or upload a payment receipt screenshot.');
      return;
    }

    setIsDepositing(true);
    setWalletError('');
    try {
      const depId = `DEP-${Math.floor(100000 + Math.random() * 900000)}`;
      const newDeposit = {
        id: depId,
        userEmail: currentUser.email,
        amount: cleanAmt,
        screenshot: depositScreenshotBase64,
        status: 'PENDING',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      await setDoc(doc(db, 'deposits', depId), newDeposit);
      setCustomWalletAdd('');
      setDepositScreenshotBase64('');
      triggerToast('🎉 Deposit request submitted! Pending verification.');
    } catch (err: any) {
      setWalletError('Failed to submit deposit request. Please try again.');
      console.error(err);
    } finally {
      setIsDepositing(false);
    }
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
        categories={categories}
        setCategories={setCategories}
        currentUser={currentUser || undefined}
        teamMembers={teamMembers}
        onClose={() => {
          window.history.pushState({}, '', '/');
          const navEvent = new PopStateEvent('popstate');
          window.dispatchEvent(navEvent);
        }}
      />
    );
  }

  const displayProduct = selectedProduct ? (products.find(p => p.id === selectedProduct.id) || selectedProduct) : null;

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

      {/* PRODUCT SPECIFIC STICKY HEADER */}
      {selectedProduct && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 py-3 sm:px-6 shadow-sm">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 transition-all text-zinc-700 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-sm shrink-0">
                  {selectedProduct.imageUrl ? (
                    <img 
                      src={selectedProduct.imageUrl} 
                      alt={selectedProduct.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-tr ${selectedProduct.imagePlaceholderColor} text-white flex items-center justify-center`}>
                      {renderProductIcon(selectedProduct.iconName, "w-4 h-4")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-sm font-black text-zinc-950 font-display tracking-tight leading-none uppercase">
                    {selectedProduct.name}
                  </h1>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 leading-none">
                    {selectedProduct.provider}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <span className="bg-blue-50 text-blue-600 font-extrabold px-3.5 py-1 rounded-full text-[9px] tracking-widest uppercase">
                TOPUP
              </span>
            </div>
          </div>
        </header>
      )}

      {/* TOP COMPACT BRAND HEADER */}
      {!selectedProduct && (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-4 py-3 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            
            {/* Logo element representing BNY SHOP */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setSelectedCategory('all')}>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-sm shrink-0">
                <img 
                  src="https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg" 
                  alt="BNY SHOP Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-zinc-950 font-display tracking-tight leading-none">
                  BNY SHOP
                </span>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider mt-0.5 leading-none">
                  S T O R E
                </span>
              </div>
            </div>

            {/* Right Area: Blue Points Pill Button or Log In Button */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <button
                  onClick={() => { setShowWalletModal(true); setWalletError(''); }}
                  className="px-4 py-1.5 rounded-full bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#3b82f6] flex items-center gap-1.5 text-xs font-black tracking-wide transition-all cursor-pointer shadow-sm active:scale-95 border-none"
                >
                  <Link className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                  <span>Pts {(loyaltyPoints ?? 0).toLocaleString()}</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveBottomNav('profile')}
                  className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-black tracking-wide transition-all cursor-pointer shadow-sm active:scale-95 border-none"
                >
                  <LogIn className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN VIEW CONTROLLER */}
      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {selectedProduct ? (
          /* GORGEOUS INLINE PRODUCT DETAIL PAGE FOR CLICKED GAME AND REQUIREMENTS */
          <div className="max-w-xl mx-auto space-y-6">
            
            {/* PLAYER / GAME REQUIREMENTS CARD */}
            <div className="bg-white rounded-[24px] p-5 border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left animate-fade-in">
              <div className="flex items-center gap-2 pb-1 border-b border-zinc-100">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <User className="w-4.5 h-4.5" />
                </div>
                <span className="block text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                  Required Account Details
                </span>
              </div>

              {(() => {
                const reqs = displayProduct && displayProduct.requirements && Array.isArray(displayProduct.requirements) ? displayProduct.requirements : [];

                if (reqs.length > 0) {
                  return (
                    <div className="space-y-3">
                      {reqs.map((req) => (
                        <div key={req.id} className="space-y-1.5">
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wide">
                            {req.name} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type={req.type === 'number' ? 'number' : 'text'}
                            required
                            placeholder={`Enter ${req.name}`}
                            onChange={(e) => {
                              const nextValues = { ...((window as any)._customReqValues || {}), [req.name]: e.target.value };
                              (window as any)._customReqValues = nextValues;
                              const combined = reqs.map(r => `${r.name}: ${nextValues[r.name] || ''}`).join(' | ');
                              setCheckoutTarget(combined);
                            }}
                            className="w-full text-xs font-bold px-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wide" htmlFor="checkout-target-acc-inline">
                      {displayProduct?.inputLabel || 'Player ID / Account'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkout-target-acc-inline"
                      type="text"
                      required
                      value={checkoutTarget}
                      onChange={(e) => setCheckoutTarget(e.target.value)}
                      placeholder={displayProduct?.inputPlaceholder || 'Enter Player ID'}
                      className="w-full text-xs font-bold px-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                );
              })()}
              <p className="text-[9px] text-zinc-400 font-semibold leading-relaxed">
                * Please ensure your details are 100% correct. Recharges are completed instantly using these details and cannot be reversed.
              </p>
            </div>

            {/* ERROR SUMMARY */}
            {modalError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-3 text-xs text-red-600 font-bold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            {/* SELECT PACKAGE BUNDLE / PACKAGE CARDS */}
            <div className="space-y-4">
              <span className="block text-[10px] font-black text-zinc-400 tracking-wider uppercase px-1">
                Select Package Bundle
              </span>

              <div className="grid grid-cols-2 gap-4">
                {getProductPackages(displayProduct).map((pkg) => {
                  const isSelected = checkoutAmount === pkg.price;
                  return (
                    <div
                      key={pkg.name}
                      onClick={() => {
                        setCheckoutAmount(pkg.price);
                        setCustomAmountText(pkg.price.toString());
                      }}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between h-[96px] text-left relative overflow-hidden ${
                        isSelected
                          ? 'bg-blue-50/15 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                          : 'bg-white border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300'
                      }`}
                    >
                      {/* Checkmark corner visual */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      
                      <span className="text-[11.5px] font-black text-zinc-900 uppercase leading-snug line-clamp-2 pr-4">
                        {pkg.name}
                      </span>
                      <span className="text-xs font-extrabold text-blue-600 font-mono mt-2">
                        NPR {pkg.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SELECT QUANTITY */}
            {displayProduct && (
              <div className="bg-white rounded-[24px] p-5 border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between animate-fade-in">
                <div className="space-y-0.5 text-left">
                  <span className="block text-[10px] font-black text-blue-600 tracking-wider uppercase">
                    Select Quantity
                  </span>
                  <span className="text-[11px] text-zinc-400 font-semibold leading-none block">
                    Choose quantity for this purchase
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 flex items-center justify-center text-zinc-700 transition-all font-bold cursor-pointer active:scale-95 bg-white"
                  >
                    <Minus className="w-4 h-4 text-zinc-600" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-zinc-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.min(100, prev + 1))}
                    className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 flex items-center justify-center text-zinc-700 transition-all font-bold cursor-pointer active:scale-95 bg-white"
                  >
                    <Plus className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>
              </div>
            )}

            {/* SUB TOTAL BILL & PAY BUTTON (Removed from flow and locked at the bottom) */}

            {/* TRUST BADGES CONTAINER */}
            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-zinc-100 mt-6 text-center">
              <div className="flex flex-col items-center p-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 border border-blue-100/30">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <h5 className="text-[10px] font-black text-zinc-900 uppercase">Instant Delivery</h5>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Under 5 mins</p>
              </div>

              <div className="flex flex-col items-center p-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 border border-blue-100/30">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h5 className="text-[10px] font-black text-zinc-900 uppercase">100% Secure</h5>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Trusted by 10K+</p>
              </div>

              <div className="flex flex-col items-center p-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 border border-blue-100/30">
                  <Headphones className="w-4.5 h-4.5" />
                </div>
                <h5 className="text-[10px] font-black text-zinc-900 uppercase">24/7 Support</h5>
                <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Always here</p>
              </div>
            </div>

            {/* STORE FOOTER (DUPLICATED HERE FOR BEAUTIFUL SCROLLING FLOW AS IN SCREENSHOT 2) */}
            <footer className="bg-zinc-50/20 border border-zinc-100 rounded-[32px] p-8 sm:p-10 space-y-10 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                
                {/* Col 1: Brand Info (6 cols) */}
                <div className="md:col-span-6 space-y-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-sm shrink-0">
                      <img 
                        src="https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg" 
                        alt="BNY SHOP Logo" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-zinc-950 font-display tracking-tight leading-none">
                        BNY SHOP
                      </span>
                      <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                        NEPAL'S PREMIUM TOP-UP
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-[11px] font-semibold leading-relaxed max-w-sm">
                    Nepal's #1 Digital Top-Up Store — fast, secure, and always at the best price.
                  </p>
                </div>

                {/* Col 2: Quick Links (3 cols) */}
                <div className="md:col-span-3 space-y-3.5 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">QUICK LINKS</h4>
                  <ul className="space-y-2 text-[11px] font-bold text-zinc-600">
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setActiveBottomNav('home'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">Home</button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setActiveBottomNav('orders'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">My Orders</button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setActiveBottomNav('wallet'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">Wallet</button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setActiveBottomNav('profile'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">Profile</button>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Top Services (3 cols) */}
                <div className="md:col-span-3 space-y-3.5 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">TOP SERVICES</h4>
                  <ul className="space-y-2 text-[11px] font-bold text-zinc-600">
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setSelectedCategory('top-up'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Free Fire Diamond
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setSelectedCategory('top-up'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        PUBG Mobile UC
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setSelectedCategory('top-up'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Mobile Legends
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setSelectedCategory('subscription'); setSearchQuery('Premium'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        YouTube Premium
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedProduct(null); setSelectedCategory('voucher'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Gift Cards
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Copyright Area */}
              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-zinc-400">
                <div>
                  © 2026 <span className="text-zinc-750 font-extrabold">BNY SHOP</span>. All rights reserved.
                </div>
                <div className="flex items-center gap-2">
                  <span>Developed by</span>
                  <span className="text-blue-600 font-extrabold hover:underline cursor-pointer">Mandip Mahato</span>
                </div>
                <div className="flex gap-3 text-zinc-400">
                  <button onClick={() => triggerToast("Terms policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Terms</button>
                  <button onClick={() => triggerToast("Privacy policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Privacy</button>
                  <button onClick={() => triggerToast("Refund policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Refund</button>
                  <button onClick={() => triggerToast("Cancellation policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Cancellation</button>
                </div>
              </div>
            </footer>
            {checkoutAmount > 0 && (
              <div className="h-64 w-full" />
            )}
          </div>
        ) : (
          <>
            {activeBottomNav === 'home' && (
          <>
            {/* WEEKEND SPECIAL PROMO SLIDER BANNER WITH DYNAMIC FIRESTORE RECONCILIATION */}
            {banners.length > 0 && (() => {
              const activeBanner = banners[promoIndex] || banners[0] || {};
              const bannerImg = activeBanner.imageUrl || activeBanner.imgUrl;
              
              // We consider it has overlays only if the title is not the default 'Banner' or 'Ad Banner' and isn't empty
              const hasText = activeBanner.title && 
                              activeBanner.title !== 'Banner' && 
                              activeBanner.title !== 'Ad Banner' &&
                              activeBanner.title.trim() !== '';

              return (
                <section className="relative overflow-hidden rounded-[24px] bg-neutral-950 text-white h-[180px] sm:h-[240px] md:h-[280px] flex items-center shadow-md border border-zinc-900">
                  {/* BACKGROUND GRAPHIC */}
                  {bannerImg ? (
                    <img 
                      src={bannerImg} 
                      alt={activeBanner.title || "Banner Image"} 
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black pointer-events-none" />
                  )}

                  {/* Dark overlay for readability (darker when there is overlay text) */}
                  <div className={`absolute inset-0 pointer-events-none transition-all ${hasText ? 'bg-black/45' : 'bg-black/10'}`} />

                  {/* GLOWING AMBIENT DECORATION (Only when no custom image background is set) */}
                  {!bannerImg && (
                    <>
                      <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-blue-500/15 blur-3xl pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                      <div className="absolute right-[15%] top-[25%] w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-60 rounded-lg blur-[1px] rotate-45 transform pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.4)] animate-pulse" />
                      <div className="absolute right-[8%] bottom-[15%] w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 opacity-50 rounded-tr-2xl rotate-12 blur-[1px] pointer-events-none shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                    </>
                  )}

                  {/* Optional click-through redirect URL link */}
                  {activeBanner.redirect && (
                    <a 
                      href={activeBanner.redirect}
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={(e) => {
                        if (activeBanner.redirect.startsWith('/') || activeBanner.redirect.startsWith('category')) {
                          e.preventDefault();
                          setSelectedCategory('top-up');
                          triggerToast('Loading Special Deals & Top-Ups...');
                        }
                      }}
                      title={activeBanner.title || "Special Deal"}
                    />
                  )}

                  {/* Overlay Text Content - rendered only if valid title or tagline exists */}
                  {hasText && (
                    <div className="relative z-10 px-6 sm:px-12 py-4 sm:py-6 max-w-md sm:max-w-xl space-y-2 sm:space-y-3 bg-gradient-to-r from-black/80 via-black/40 to-transparent h-full flex flex-col justify-center text-left">
                      {activeBanner.badge && (
                        <span className="inline-block text-[9px] sm:text-[10px] font-black tracking-widest text-blue-400 uppercase leading-none font-mono">
                          {activeBanner.badge}
                        </span>
                      )}
                      
                      <h3 className="text-lg sm:text-2xl md:text-3xl font-black font-display tracking-tight text-white leading-tight">
                        {activeBanner.title}
                      </h3>

                      {activeBanner.tagline && (
                        <p className="text-zinc-200 text-[10px] sm:text-xs leading-relaxed max-w-[280px] sm:max-w-md line-clamp-2 font-semibold">
                          {activeBanner.tagline}
                        </p>
                      )}

                      <div className="pt-1.5">
                        <button 
                          onClick={() => {
                            setSelectedCategory('top-up');
                            triggerToast('Browsing special products...');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] sm:text-[11px] font-black tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          🚀 {activeBanner.buttonText || 'Recharge Now'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Left Slider Arrow Navigation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPromoIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none z-20 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Previous Promo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right Slider Arrow Navigation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPromoIndex(prev => (prev === banners.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white backdrop-blur-sm transition-all focus:outline-none z-20 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Next Promo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Slide Indicators at the bottom */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPromoIndex(idx);
                        }}
                        className={`h-1.5 transition-all duration-300 rounded-full ${idx === promoIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-zinc-600'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </section>
              );
            })()}

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
                    className="w-[160px] sm:w-[180px] shrink-0 group cursor-pointer bg-white border border-white hover:border-blue-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Upper image frame */}
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 relative border border-zinc-100 flex items-center justify-center shadow-sm">
                        {/* Heart favorite clicker */}
                        <button
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm transition-all shadow-[0_1px_5px_rgba(0,0,0,0.04)] text-black focus:outline-none"
                          title="Favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors ${favoriteIds.includes(product.id) ? 'fill-red-500' : ''}`} />
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
                            {renderProductIcon(product.iconName, "w-8 h-8")}
                          </div>
                        )}
                      </div>

                      {/* Title Underneath */}
                      <div className="px-1">
                        <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 tracking-tight leading-snug text-left group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ALL CAPSULE CATEGORIES COVERED IN BOX */}
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

                {/* Dynamic Category Buttons */}
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-5 py-2.5 text-xs font-black rounded-full text-center whitespace-nowrap transition-all uppercase cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                        : 'bg-white text-zinc-500 hover:text-zinc-950 border-zinc-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}

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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                  {filteredProducts.map((product) => (
                    <div
                       key={product.id}
                       onClick={() => openCheckout(product)}
                       className="group cursor-pointer bg-white border border-white hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="space-y-4">
                        {/* Upper image frame */}
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-50 relative border border-zinc-100 flex items-center justify-center shadow-sm">
                          
                          {/* Heart favorite clicker */}
                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/85 hover:bg-white backdrop-blur-sm transition-all shadow-[0_1px_5px_rgba(0,0,0,0.04)] text-black focus:outline-none"
                            title="Favorite"
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${favoriteIds.includes(product.id) ? 'fill-red-500' : ''}`} />
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
                              {renderProductIcon(product.iconName, "w-8 h-8")}
                            </div>
                          )}
                        </div>

                        {/* Title Underneath */}
                        <div className="px-1">
                          <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 tracking-tight leading-snug text-left group-hover:text-blue-600 transition-colors line-clamp-2">
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

            {/* WHY CHOOSE US? SECTION (Matching design from screenshots, fully responsive and interactive) */}
            <section className="pt-10 pb-6 border-t border-zinc-100">
              <div className="text-center space-y-2 mb-10">
                <h3 className="text-base sm:text-lg font-black tracking-widest text-zinc-900 uppercase">
                  WHY CHOOSE <span className="text-blue-600">BNY SHOP</span>?
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto font-medium">
                  We provide the fastest, most secure, and affordable top-up service.
                </p>
              </div>

              {/* 2x2 Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="bg-white border border-zinc-100 rounded-[32px] p-5 sm:p-8 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-blue-600 flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900">Instant Delivery</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold leading-normal">
                      Get your credits instantly after payment
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-white border border-zinc-100 rounded-[32px] p-5 sm:p-8 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-blue-600 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900">Secure Payment</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold leading-normal">
                      100% safe and encrypted transactions
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-white border border-zinc-100 rounded-[32px] p-5 sm:p-8 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-blue-600 flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900">24/7 Support</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold leading-normal">
                      Always here to help you anytime
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="bg-white border border-zinc-100 rounded-[32px] p-5 sm:p-8 hover:shadow-md transition-all flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-blue-600 flex items-center justify-center shrink-0">
                    <Percent className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900">Best Prices</h4>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-semibold leading-normal">
                      Guaranteed cheapest rates in market
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* THREE-ROW QUICK BADGE STRIP */}
            <div className="bg-white border border-zinc-100 rounded-[28px] p-5 grid grid-cols-3 gap-2 text-center mt-8">
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-zinc-900 mt-1 truncate max-w-full">Instant Delivery</span>
                <span className="text-[9px] sm:text-[10.5px] font-bold text-zinc-400 truncate max-w-full">Under 5 mins</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-zinc-900 mt-1 truncate max-w-full">100% Secure</span>
                <span className="text-[9px] sm:text-[10.5px] font-bold text-zinc-400 truncate max-w-full">Trusted by 10K+</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-zinc-900 mt-1 truncate max-w-full">24/7 Support</span>
                <span className="text-[9px] sm:text-[10.5px] font-bold text-zinc-400 truncate max-w-full">Always here</span>
              </div>
            </div>

            {/* MAIN COMPLEX FOOTER (Directly matching user design constraints) */}
            <footer className="bg-zinc-50/20 border border-zinc-100 rounded-[32px] p-8 sm:p-10 space-y-10 mt-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                
                {/* Col 1: Brand Info (6 cols) */}
                <div className="md:col-span-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-sm shrink-0">
                      <img 
                        src="https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg" 
                        alt="BNY SHOP Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-950 font-display tracking-tight leading-none">
                        BNY SHOP
                      </span>
                      <span className="text-[9.5px] font-black text-blue-600 uppercase tracking-wider mt-0.5 leading-none">
                        S T O R E
                      </span>
                    </div>
                  </div>
                  
                  <span className="block text-[10px] font-black uppercase tracking-wider text-blue-600">NEPAL'S PREMIUM TOP-UP</span>
                  
                  <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
                  Welcome to BNY SHOP, your trusted destination for digital gaming top-ups and gift cards. We provide fast and secure delivery of PUBG Mobile UC, Free Fire Diamonds, Mobile Legends Diamonds, UniPin Vouchers, iTunes Gift Cards, Razer Gold PINs, and other digital products at competitive prices. Enjoy instant service, reliable support, and convenient payment options for all your gaming and digital needs.
                  </p>

                  {/* Social Buttons */}
                  <div className="flex items-center gap-2.5 pt-1.5">
                    <a 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-blue-600 hover:text-white text-zinc-600 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Col 2: Quick Links (3 cols) */}
                <div className="md:col-span-3 space-y-3.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">QUICK LINKS</h4>
                  <ul className="space-y-2 text-[11px] font-bold text-zinc-600">
                    <li>
                      <button onClick={() => { setActiveBottomNav('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Home
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setActiveBottomNav('orders'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        My Orders
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setShowWalletModal(true); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Wallet
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setActiveBottomNav('profile'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Profile
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Top Services (3 cols) */}
                <div className="md:col-span-3 space-y-3.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">TOP SERVICES</h4>
                  <ul className="space-y-2 text-[11px] font-bold text-zinc-600">
                    <li>
                      <button onClick={() => { setSelectedCategory('top-up'); setSearchQuery('Diamond'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Free Fire Diamond
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedCategory('top-up'); setSearchQuery('PUBG'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        PUBG Mobile UC
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedCategory('top-up'); setSearchQuery('Legends'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Mobile Legends
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedCategory('subscription'); setSearchQuery('Premium'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        YouTube Premium
                      </button>
                    </li>
                    <li>
                      <button onClick={() => { setSelectedCategory('voucher'); }} className="hover:text-blue-600 transition-colors cursor-pointer text-left">
                        Gift Cards
                      </button>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Bottom Copyright Area */}
              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-zinc-400">
                <div>
                  © 2026 <span className="text-zinc-750 font-extrabold">BNY SHOP</span>. All rights reserved.
                </div>
                <div className="flex items-center gap-2">
                  <span>Developed by</span>
                  <span className="text-blue-600 font-extrabold hover:underline cursor-pointer">Mandip Mahato</span>
                </div>
                <div className="flex gap-3 text-zinc-400">
                  <button onClick={() => triggerToast("Terms policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Terms</button>
                  <button onClick={() => triggerToast("Privacy policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Privacy</button>
                  <button onClick={() => triggerToast("Refund policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Refund</button>
                  <button onClick={() => triggerToast("Cancellation policy loaded.")} className="hover:text-zinc-650 transition-colors cursor-pointer">Cancellation</button>
                </div>
              </div>
            </footer>

          </>
        )}

        {/* ORDERS VIEW */}
        {activeBottomNav === 'orders' && (
          <section className="bg-white rounded-2xl p-5 border border-zinc-200/80 space-y-4">
            {!currentUser ? (
              <div className="py-12 text-center text-zinc-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
                  <ShoppingBag className="w-5.5 h-5.5" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h4 className="text-xs font-black text-zinc-800 uppercase">View Order History</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Please sign in or register to view your order logs and track live top-up status updates.</p>
                </div>
                <button
                  onClick={() => setActiveBottomNav('profile')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            ) : (() => {
              const userTxs = transactions.filter(tx => 
                currentUser && (
                  tx.userEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
                  tx.email?.toLowerCase() === currentUser.email.toLowerCase()
                )
              );

              const filteredUserTxs = userTxs.filter(tx => {
                if (orderStatusFilter === 'all') return true;
                const txStatus = tx.status || 'PENDING';
                if (orderStatusFilter === 'PENDING') return txStatus === 'PENDING';
                if (orderStatusFilter === 'COMPLETED') return txStatus === 'SUCCESS' || txStatus === 'DISPATCHED' || txStatus === 'COMPLETED';
                if (orderStatusFilter === 'REJECTED') return txStatus === 'FAILED' || txStatus === 'REJECTED';
                return true;
              });

              if (userTxs.length === 0) {
                return (
                  <div className="py-12 text-center text-zinc-400">
                    <ReceiptText className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-700">No Orders Placed Yet</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Order some game diamonds or top-ups below to see your history!</p>
                  </div>
                );
              }
              return (
                <div className="space-y-4 text-left">
                  {/* Status Filters */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-zinc-800 uppercase tracking-tight">My Order History</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">
                        Showing {filteredUserTxs.length} of {userTxs.length} orders
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {(['all', 'PENDING', 'COMPLETED', 'REJECTED'] as const).map((st) => {
                        const count = st === 'all' 
                          ? userTxs.length 
                          : userTxs.filter(tx => {
                              const txStatus = tx.status || 'PENDING';
                              if (st === 'PENDING') return txStatus === 'PENDING';
                              if (st === 'COMPLETED') return txStatus === 'SUCCESS' || txStatus === 'DISPATCHED' || txStatus === 'COMPLETED';
                              if (st === 'REJECTED') return txStatus === 'FAILED' || txStatus === 'REJECTED';
                              return false;
                            }).length;

                        return (
                          <button
                            key={st}
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1.5 text-[9px] font-black tracking-wide uppercase rounded-full border cursor-pointer transition-all ${
                              orderStatusFilter === st
                                ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                                : 'bg-white text-zinc-500 hover:text-zinc-900 border-zinc-200'
                            }`}
                          >
                            {st} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredUserTxs.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 bg-zinc-50/50 rounded-2xl border border-zinc-150">
                      <ReceiptText className="w-9 h-9 text-zinc-200 mx-auto mb-2" />
                      <p className="text-xs font-extrabold text-zinc-650 uppercase">No {orderStatusFilter !== 'all' ? orderStatusFilter.toLowerCase() : ''} orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUserTxs.map((tx) => {
                        const displayId = tx.id.startsWith('BNY-') ? tx.id : `BNY-${tx.id.replace(/\D/g, '').slice(0, 6).padEnd(6, '0')}`;
                    const associatedProduct = products.find(p => p.id === tx.productId);
                    const gameName = tx.provider || associatedProduct?.provider || associatedProduct?.name || 'Game';
                    
                    return (
                      <div key={tx.id} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/60 shadow-sm relative space-y-3.5 hover:shadow-md transition-all">
                        {/* Top Bar inside Order Box: Game Image, Name & Order ID in Top Right */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 text-left">
                            {associatedProduct?.imageUrl ? (
                              <div className="w-11 h-11 rounded-xl overflow-hidden border border-zinc-200 shrink-0 shadow-sm">
                                <img
                                  src={associatedProduct.imageUrl}
                                  alt={gameName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                                <ReceiptText className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight leading-tight">{gameName}</h4>
                              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{tx.timestamp}</p>
                            </div>
                          </div>

                          {/* Order ID on the top right with Copy Option */}
                          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <span className="text-[10px] font-mono font-black text-zinc-650 tracking-wider">
                              {displayId}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(displayId);
                                triggerToast('📋 Order ID copied!');
                              }}
                              className="text-zinc-400 hover:text-blue-600 p-0.5 hover:bg-zinc-100 rounded transition-all cursor-pointer"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Mid Section: Product Name, Product Price, and Status Badge */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-zinc-200/50">
                          {/* Product Info */}
                          <div className="space-y-1 text-left">
                            <span className="block text-[10px] font-black text-zinc-400 tracking-wider uppercase">Product Bundle / Price</span>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-extrabold text-zinc-800 uppercase">{tx.productName}</span>
                              {tx.quantity && tx.quantity > 1 && (
                                <span className="text-[10px] font-black bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded-md font-mono">
                                  Qty: {tx.quantity}
                                </span>
                              )}
                              <span className="text-xs font-black text-blue-600">NPR {tx.amount}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center justify-start md:justify-end gap-2">
                            <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase mr-1">Status:</span>
                            {(tx.status === 'PENDING' || !tx.status) && (
                              <div className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] rounded-lg font-black flex items-center gap-1.5 border border-amber-200/50 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>PENDING</span>
                              </div>
                            )}
                            {(tx.status === 'SUCCESS' || tx.status === 'DISPATCHED') && (
                              <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg font-black flex items-center gap-1.5 border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>COMPLETED</span>
                              </div>
                            )}
                            {(tx.status === 'FAILED' || tx.status === 'REJECTED') && (
                              <div className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] rounded-lg font-black flex items-center gap-1.5 border border-red-200/40">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>REJECTED</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Section: Order Requirements */}
                        <div className="bg-white rounded-xl p-3 border border-zinc-200/60 text-left space-y-2">
                          <span className="block text-[9px] font-black text-zinc-400 tracking-wider uppercase">Provided Requirements / Account Details</span>
                          
                          {/* Requirements with Copy Buttons */}
                          <div className="space-y-1.5">
                            {tx.targetAccount ? (
                              tx.targetAccount.split('|').map((part, index) => {
                                if (part.includes(':')) {
                                  const [key, ...valParts] = part.split(':');
                                  const val = valParts.join(':').trim();
                                  const label = key ? key.trim() : 'Detail';
                                  return (
                                    <div key={index} className="flex items-center justify-between gap-4 text-xs bg-zinc-50/60 px-2.5 py-1.5 rounded-lg border border-zinc-150">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-zinc-500">{label}:</span>
                                        <span className="font-bold text-zinc-800 font-mono">{val}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(val);
                                          triggerToast(`📋 Copied ${label}!`);
                                        }}
                                        className="text-zinc-400 hover:text-blue-600 p-0.5 hover:bg-zinc-100 rounded transition-all cursor-pointer shrink-0"
                                        title={`Copy ${label}`}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                } else {
                                  const label = associatedProduct?.inputLabel || 'Account ID';
                                  return (
                                    <div key={index} className="flex items-center justify-between gap-4 text-xs bg-zinc-50/60 px-2.5 py-1.5 rounded-lg border border-zinc-150">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-zinc-500">{label}:</span>
                                        <span className="font-bold text-zinc-800 font-mono">{part.trim()}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(part.trim());
                                          triggerToast(`📋 Copied ${label}!`);
                                        }}
                                        className="text-zinc-400 hover:text-blue-600 p-0.5 hover:bg-zinc-100 rounded transition-all cursor-pointer shrink-0"
                                        title={`Copy ${label}`}
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                }
                              })
                            ) : null}

                            {tx.pinCode && (
                              <div className="flex items-center justify-between gap-4 text-xs bg-blue-50/40 px-2.5 py-1.5 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-blue-600 uppercase">PIN CODE:</span>
                                  <span className="font-black text-blue-700 font-mono select-all">{tx.pinCode}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(tx.pinCode || '');
                                    triggerToast('📋 Copied PIN Code!');
                                  }}
                                  className="text-blue-400 hover:text-blue-700 p-0.5 hover:bg-blue-100 rounded transition-all cursor-pointer shrink-0"
                                  title="Copy PIN Code"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        )}

        {/* WALLET DEPOSIT REQUESTS VIEW */}
        {activeBottomNav === 'wallet' && (
          <section className="space-y-6">
            {!currentUser ? (
              <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 uppercase">App Wallet Panel</h3>
                  <p className="text-xs text-zinc-400">Load funds securely and track your transaction status</p>
                </div>
                <div className="py-12 text-center text-zinc-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
                    <Wallet className="w-5.5 h-5.5 text-blue-600" />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <h4 className="text-xs font-black text-zinc-800 uppercase">Manage App Wallet</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">Please log in or register to load extra credit, view wallet status, and run secure transactions.</p>
                  </div>
                  <button
                    onClick={() => setActiveBottomNav('profile')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-md transition-all active:scale-98 cursor-pointer border-none"
                  >
                    Log In / Register
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Wallet Balance Card & Header */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                  <div className="text-left">
                    <h3 className="text-base font-extrabold text-zinc-900 uppercase">My Wallet Balance</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Use your prepaid balance to top up instantly at any time.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:w-auto shrink-0">
                    {/* Points Card */}
                    <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between min-w-[170px] sm:min-w-[190px] relative overflow-hidden shadow-md flex-1">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent pointer-events-none rounded-bl-full" />
                      <div className="text-left">
                        <span className="text-[9px] font-extrabold tracking-wider text-blue-100 uppercase block">Available Points</span>
                        <span className="text-xl font-black text-white font-mono tracking-tight leading-none block mt-1">
                          {(loyaltyPoints ?? 0).toLocaleString()} Pts
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs ml-4 shrink-0">
                        <Link className="w-5 h-5 text-blue-200" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Big QR Code & Form Container */}
                <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-6">
                  <div className="text-left">
                    <h3 className="text-base font-extrabold text-zinc-900 uppercase">Refill Wallet Cash</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Scan the QR below via eSewa / Bank app, then upload receipt details to request credit.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Big QR Code Panel */}
                    <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200/60 flex flex-col items-center text-center space-y-4">
                      <div className="bg-white p-3.5 rounded-3xl border border-zinc-200 shadow-sm transition-transform hover:scale-102 duration-300">
                        <img 
                          src={paymentSettings.qrImageUrl} 
                          alt="eSewa QR Scan" 
                          referrerPolicy="no-referrer"
                          className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                        />
                      </div>
                      <div className="space-y-2 w-full max-w-xs">
                        <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase block">Recipient eSewa details</span>
                        <div className="flex items-center justify-between bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-xs">
                          <span className="text-xs font-extrabold text-zinc-800 font-mono">eSewa: {paymentSettings.esewaNumber}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentSettings.esewaNumber);
                              triggerToast('📋 Recipient eSewa number copied!');
                            }}
                            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-blue-600 transition-all cursor-pointer border-none"
                            title="Copy eSewa Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-semibold leading-normal pt-1">
                          Scan QR or send funds directly to the eSewa wallet listed above.
                        </p>
                      </div>
                    </div>

                    {/* Form Input fields */}
                    <div className="space-y-5">
                      {walletError && (
                        <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-bold animate-shake">
                          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                          <span>{walletError}</span>
                        </div>
                      )}

                      <form onSubmit={handleDepositSubmit} className="space-y-5">
                        {/* Deposit Amount */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-xs font-black text-zinc-700 uppercase tracking-wide">
                            Deposit Amount (Rs.) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={paymentSettings.minDeposit}
                              required
                              value={customWalletAdd}
                              onChange={(e) => setCustomWalletAdd(e.target.value)}
                              placeholder={`Min Rs. ${paymentSettings.minDeposit}`}
                              className="w-full text-xs font-bold pl-10 pr-3 py-3.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-blue-500 rounded-xl focus:outline-none transition-all font-mono shadow-xs"
                            />
                            <span className="text-xs font-bold text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">
                              Rs.
                            </span>
                          </div>
                        </div>

                        {/* Screenshot Input */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-xs font-black text-zinc-700 uppercase tracking-wide">
                            Payment Receipt Screenshot <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              required={!depositScreenshotBase64}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    if (typeof reader.result === 'string') {
                                      try {
                                        const compressed = await compressImage(reader.result);
                                        setDepositScreenshotBase64(compressed);
                                        setWalletError('');
                                      } catch (error) {
                                        setDepositScreenshotBase64(reader.result);
                                        setWalletError('');
                                      }
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <div className={`border border-dashed ${depositScreenshotBase64 ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-300 hover:border-blue-500 bg-zinc-50 hover:bg-white'} rounded-xl py-3.5 px-4 text-center transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs`}>
                              <Upload className={`w-4.5 h-4.5 ${depositScreenshotBase64 ? 'text-emerald-600' : 'text-zinc-400'} shrink-0`} />
                              <span className={`text-xs font-black ${depositScreenshotBase64 ? 'text-emerald-800' : 'text-zinc-700'} truncate`}>
                                {depositScreenshotBase64 ? '✓ Receipt Screenshot Selected' : 'Choose Payment Screenshot'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Screenshot Preview */}
                        {depositScreenshotBase64 && (
                          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/80 px-4 py-3 rounded-xl animate-fade-in shadow-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <img 
                                src={depositScreenshotBase64} 
                                alt="Receipt preview" 
                                className="w-12 h-12 object-cover rounded-lg border border-emerald-200 shadow-xs shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <span className="block text-xs font-black text-emerald-900 truncate">Payment Receipt Attached</span>
                                <span className="block text-[10px] text-emerald-700 font-bold">Ready to submit</span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setDepositScreenshotBase64('')}
                              className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        )}

                        {/* Submit button */}
                        <button
                          type="submit"
                          disabled={isDepositing}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98 border-none mt-4"
                        >
                          {isDepositing ? (
                            <>
                              <div className="w-4.5 h-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                              <span>Submitting Request...</span>
                            </>
                          ) : (
                            <span>Submit Deposit Request</span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* 3. Deposit History Logs - Beautiful Design */}
                <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <div className="text-left">
                      <h4 className="text-sm font-black text-zinc-950 uppercase tracking-tight">Deposit Requests History</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold">Real-time status of your deposit verifications.</p>
                    </div>
                    <span className="bg-zinc-100 text-zinc-600 text-[10px] font-black px-2.5 py-1 rounded-full">
                      Total Requests: {depositRequests.length}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {depositRequests.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 text-xs font-bold space-y-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-150 flex items-center justify-center mx-auto text-zinc-300">
                          <Eye className="w-4 h-4" />
                        </div>
                        <p>No deposit requests submitted yet.</p>
                      </div>
                    ) : (
                      depositRequests.map((dep) => (
                        <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50/40 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-xs gap-3">
                          <div className="flex items-center gap-3.5 text-left">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/30 flex items-center justify-center text-blue-600 shrink-0">
                              <span className="text-xs font-black font-mono">Rs</span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-zinc-900 font-mono">Rs. {dep.amount}</span>
                                <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase bg-zinc-100 px-1.5 py-0.5 rounded">ID: {dep.id}</span>
                              </div>
                              <span className="block text-[10px] text-zinc-400 font-semibold">{dep.timestamp}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 border-zinc-100 pt-2.5 sm:pt-0">
                            {/* Status Badge */}
                            {dep.status === 'PENDING' && (
                              <span className="px-2.5 py-1 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg animate-pulse">
                                PENDING
                              </span>
                            )}
                            {dep.status === 'COMPLETED' && (
                              <span className="px-2.5 py-1 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-150 rounded-lg">
                                APPROVED
                              </span>
                            )}
                            {dep.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 text-[9px] font-black bg-red-50 text-red-700 border border-red-150 rounded-lg">
                                REJECTED
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedDepositScreenshot(dep.screenshot)}
                              className="bg-white hover:bg-zinc-100 active:scale-97 text-zinc-700 text-[10px] font-black px-3.5 py-2 rounded-xl border border-zinc-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-500" />
                              <span>View Receipt</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
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

            {!currentUser ? (
              <LoginRegister 
                onSuccess={(user) => {
                  setCurrentUser(user);
                  setWalletBalance(user.walletBalance);
                  setLoyaltyPoints(user.loyaltyPoints);
                  fetchNotifications();
                }}
                getBackendUrl={getBackendUrl}
                triggerToast={triggerToast}
              />
            ) : (
              <>
                {/* Profile Summary Card */}
                <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* User Profile Avatar Image from Unsplash or initials */}
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-500 shrink-0 shadow-md flex items-center justify-center bg-blue-50">
                      {(currentUser.email.toLowerCase() === 'mandipmahato717@gmail.com' || currentUser.email.toLowerCase() === 'bnyshopadminpanel@gmail.com' || currentUser.email.toLowerCase() === 'bnyadminpanel@hotmail.com') ? (
                        <img 
                          src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80" 
                          alt={currentUser.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-550 to-indigo-600 flex items-center justify-center text-white text-base font-black uppercase">
                          {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-black text-zinc-800 leading-tight">{currentUser.name}</h4>
                        {(currentUser.email.toLowerCase() === 'mandipmahato717@gmail.com' || currentUser.email.toLowerCase() === 'bnyshopadminpanel@gmail.com' || currentUser.email.toLowerCase() === 'bnyadminpanel@hotmail.com' || teamMembers.includes(currentUser.email.toLowerCase())) && (
                          <span className="bg-blue-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold">{currentUser.email}</p>
                      
                      {/* Points Indicator with link icon */}
                      <div className="pt-1 flex items-center gap-1 text-blue-600 font-extrabold">
                        <Link className="w-3.5 h-3.5" />
                        <span className="text-[11px] hover:underline cursor-pointer">{(loyaltyPoints ?? 0).toLocaleString()} Points</span>
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
                  
                  {/* Admin Panel Option (Visible only to authorized members) */}
                  {currentUser && (currentUser.email.toLowerCase() === 'mandipmahato717@gmail.com' || currentUser.email.toLowerCase() === 'bnyshopadminpanel@gmail.com' || currentUser.email.toLowerCase() === 'bnyadminpanel@hotmail.com' || teamMembers.includes(currentUser.email.toLowerCase())) && (
                    <div 
                      onClick={() => {
                        window.history.pushState({}, '', '/admin');
                        const navEvent = new PopStateEvent('popstate');
                        window.dispatchEvent(navEvent);
                      }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl cursor-pointer transition-all hover:opacity-95 shadow-md shadow-blue-500/15 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                          <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black tracking-tight">Admin Control Panel</h5>
                          <p className="text-[10px] text-blue-100 font-medium mt-0.5">Manage deposits, orders, products & users</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}

                  {/* Store Points Option */}
                  <div className="flex items-center justify-between p-2.5 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                        <Link className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-extrabold text-zinc-800">Store Points</h5>
                        <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Balance: {(loyaltyPoints ?? 0).toLocaleString()} Points</p>
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
                    onClick={() => setShowNotifModal(true)}
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
                    setCurrentUser(null);
                    triggerToast("Session logged out successfully!");
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
              </>
            )}

          </div>
        )}

          </>
        )}

      </main>

      {/* SCROLL TO TOP BUTTON (Disabled per user request) */}


      {/* FIXED FLOATING STEADY BOTTOM NAVIGATION BAR OR LOCKED CONFIRM BAR FOR SEAMLESS FLOW */}
      {selectedProduct ? (
        /* LOCKED/STICKY PAYMENT CONFIRM BAR FOR SELECTED PRODUCT (No need to scroll) */
        checkoutAmount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200/90 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] sm:rounded-t-3xl flex justify-center">
            <form 
              onSubmit={executeRecharge} 
              className="w-full max-w-lg p-5 space-y-4 pb-6 bg-white sm:rounded-t-3xl"
            >
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                  Order Summary
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                  Secure Checkout
                </span>
              </div>
              
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between text-zinc-500">
                  <span>Selected Option:</span>
                  <span className="font-extrabold text-zinc-900 uppercase truncate max-w-[220px]" title={getProductPackages(selectedProduct).find(p => p.price === checkoutAmount)?.name || `${selectedProduct.name} Custom`}>
                    {getProductPackages(selectedProduct).find(p => p.price === checkoutAmount)?.name || `${selectedProduct.name} Custom`}
                  </span>
                </div>
                {quantity > 1 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Quantity:</span>
                    <span className="font-extrabold text-zinc-900 font-mono">
                      x {quantity}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Processor Handling Fee:</span>
                  <span className="text-emerald-600 font-black uppercase">FREE (Rs. 0)</span>
                </div>
                <div className="h-px bg-zinc-100 my-1.5" />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-black text-zinc-950 uppercase">Estimated Total Cost:</span>
                  <span className="font-mono font-black text-blue-600 text-base">
                    NPR {checkoutAmount * quantity}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUserBlocked}
                className={`w-full py-4 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-98 ${
                  isUserBlocked 
                    ? 'bg-red-600 hover:bg-red-600 opacity-90 cursor-not-allowed shadow-red-500/10' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
                }`}
              >
                {isUserBlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Account Suspended - Cannot Order</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay NPR {checkoutAmount * quantity}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )
      ) : (
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

            {/* Admin Option (Visible only to authorized owners and team members) */}
            {currentUser && (currentUser.email.toLowerCase() === 'mandipmahato717@gmail.com' || currentUser.email.toLowerCase() === 'bnyshopadminpanel@gmail.com' || currentUser.email.toLowerCase() === 'bnyadminpanel@hotmail.com' || teamMembers.includes(currentUser.email.toLowerCase())) && (
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  const navEvent = new PopStateEvent('popstate');
                  window.dispatchEvent(navEvent);
                }}
                className="flex flex-col items-center gap-1 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-650"
              >
                <div className="p-1.5 rounded-xl transition-all hover:bg-zinc-100 text-zinc-500">
                  <ShieldCheck className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold">Admin</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* POPUP: NOTIFICATIONS HUB MODAL */}
      <AnimatePresence>
        {showNotifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifModal(false)}
              className="absolute inset-0 bg-neutral-900/45 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-3xl w-full max-w-md p-6 relative z-10 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-start shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-zinc-900 tracking-tight">Notifications Hub</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Stay updated with top-ups & deals</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotifModal(false)}
                  className="p-1 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Push Permission Prompt Status card */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Background Alerts Status</span>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        pushSubscriptionState === 'active' ? 'bg-emerald-500 animate-pulse' :
                        pushSubscriptionState === 'checking' ? 'bg-blue-500 animate-spin' :
                        'bg-amber-500 animate-pulse'
                      }`} />
                      <span className="text-xs font-black text-zinc-800">
                        {pushSubscriptionState === 'active' && 'CONNECTED & READY ✅'}
                        {pushSubscriptionState === 'checking' && 'VERIFYING CONNECTION... 🔄'}
                        {pushSubscriptionState === 'inactive' && 'NOT GRANTED YET ⚠️'}
                        {pushSubscriptionState === 'error' && 'CONNECTION ERROR ❌'}
                        {pushSubscriptionState === 'unsupported' && 'UNSUPPORTED BY BROWSER 🛑'}
                      </span>
                    </div>
                  </div>
                  
                  {notifPermission !== 'granted' && (
                    <button
                      onClick={requestNotificationPermission}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs border-none cursor-pointer"
                    >
                      Enable Push
                    </button>
                  )}

                  {notifPermission === 'granted' && (pushSubscriptionState === 'active' || pushSubscriptionState === 'error') && (
                    <button
                      onClick={async () => {
                        setPushSubscriptionState('checking');
                        try {
                          if ('serviceWorker' in navigator) {
                            const reg = await navigator.serviceWorker.ready;
                            const sub = await reg.pushManager.getSubscription();
                            if (sub) {
                              await sub.unsubscribe();
                            }
                          }
                          await syncPushSubscription();
                          triggerToast("🔄 Background subscription repaired successfully!");
                        } catch (e: any) {
                          console.error(e);
                          triggerToast("Failed to re-register: " + String(e.message || e));
                        }
                      }}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center gap-1"
                    >
                      <span>Repair</span>
                    </button>
                  )}
                </div>

                {pushSubscriptionError && (
                  <p className="text-[10px] text-red-500 font-bold bg-red-50/50 p-2 rounded-xl border border-red-150/40">
                    ⚠️ Error: {pushSubscriptionError}
                  </p>
                )}

                {pushSubscriptionState === 'unsupported' && (
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
                    Standard Background Alerts are not supported in this browser layout. Please use Chrome/Edge or open this app in standard Safari and "Add to Home Screen".
                  </p>
                )}
                
                {pushSubscriptionState === 'active' && (
                  <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50/40 px-2 py-1.5 rounded-xl border border-emerald-200/30">
                    🔔 Background alerts are active! You will receive notification sound and banners even when this browser tab is closed.
                  </p>
                )}
              </div>

              {/* Iframe detection warning & Open Link card */}
              {isIframe && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/60 flex flex-col gap-1.5 shrink-0 text-left">
                  <span className="text-[10px] font-black text-blue-800 tracking-wider">🔗 STANDALONE TAB LINK (ACTION REQUIRED)</span>
                  <p className="text-[11px] text-blue-700 leading-normal font-bold">
                    Browsers block background push notification setup inside iframe previews. To make push notifications work when the app is closed:
                  </p>
                  <ol className="text-[10px] text-blue-800/90 space-y-1 pl-4 list-decimal font-semibold">
                    <li>Click the button below to open the app in a new, standalone browser tab.</li>
                    <li>Inside the new tab, click <strong className="text-blue-900 font-extrabold">"Enable Push"</strong>.</li>
                    <li>If you are on iPhone/iOS, make sure to read the yellow guide below too!</li>
                  </ol>
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm border-none cursor-pointer text-center block no-underline"
                  >
                    Open App in Standalone Tab 🚀
                  </a>
                </div>
              )}

              {/* iOS / Safari Setup Guide if on iPhone but not installed */}
              {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 flex flex-col gap-1.5 shrink-0 text-left">
                  <span className="text-[10px] font-black text-amber-800 tracking-wider">📲 IPHONE / iOS USER ACTION REQUIRED</span>
                  <p className="text-[11px] text-amber-700 leading-normal font-bold">
                    Apple blocks background alerts unless the app is saved to your screen. To receive notifications when this app is closed:
                  </p>
                  <ol className="text-[10px] text-amber-800/90 space-y-1 pl-4 list-decimal font-semibold">
                    <li>Tap the <strong className="text-amber-900 font-extrabold">Share button</strong> at the bottom of Safari.</li>
                    <li>Choose <strong className="text-amber-900 font-extrabold">"Add to Home Screen"</strong>.</li>
                    <li>Open BNY SHOP from your Home Screen and click <strong className="text-amber-900 font-extrabold">"Enable Push"</strong>.</li>
                  </ol>
                </div>
              )}



              {/* Notifications List Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recent Alerts</span>
                
                {serverNotifications.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Bell className="w-8 h-8 text-zinc-350 mx-auto opacity-40" />
                    <p className="text-xs text-zinc-400 font-bold">Your notification feed is clear.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {serverNotifications.map((notif: any) => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          if (notif.linkUrl) {
                            if (notif.linkUrl.startsWith('/#') || notif.linkUrl === '/') {
                              // Standard local anchors or routes
                              setShowNotifModal(false);
                            } else {
                              window.open(notif.linkUrl, '_blank');
                            }
                          }
                        }}
                        className="p-3.5 bg-white hover:bg-zinc-50 border border-zinc-150 rounded-2xl transition-all cursor-pointer flex items-start gap-3 group text-left"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-150 bg-zinc-50 shrink-0 flex items-center justify-center">
                          <img src={notif.iconUrl || "https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg"} alt="logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <h5 className="text-xs font-extrabold text-zinc-900 group-hover:text-blue-600 transition-colors">{notif.title}</h5>
                          <p className="text-[11px] text-zinc-500 leading-normal">{notif.body}</p>
                          <span className="block text-[8px] font-bold text-zinc-400 font-mono pt-1">
                            {notif?.timestamp ? new Date(notif.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-center text-[9px] font-bold text-zinc-400 tracking-wider uppercase shrink-0">
                🔒 Secured by BNY SHOP PWA Gateway
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 1: RELOAD WALLET CASH MODAL */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalletModal(false)}
              className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-[28px] w-full max-w-lg p-6 relative z-10 max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/40">
                    <Wallet className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-extrabold text-zinc-950 uppercase tracking-tight">Refill Wallet Cash</h4>
                    <p className="text-xs text-zinc-500 font-semibold mt-0.5">Deposit funds securely using eSewa QR</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowWalletModal(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Available Balance & Points Cards in Modal */}
              <div className="w-full">
                <div className="bg-blue-600 text-white rounded-xl p-3 relative overflow-hidden shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[8px] font-extrabold tracking-wider text-blue-100 uppercase block">Available Points</span>
                    <span className="text-sm font-black text-white font-mono tracking-tight block mt-0.5">{(loyaltyPoints ?? 0).toLocaleString()} Pts</span>
                  </div>
                  <Link className="w-4 h-4 text-blue-200 opacity-85 shrink-0" />
                </div>
              </div>

              {walletError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 font-bold">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{walletError}</span>
                </div>
              )}

              {/* Big QR Code Section */}
              <div className="bg-zinc-50 rounded-2xl p-4.5 border border-zinc-200/60 flex flex-col items-center text-center space-y-3.5">
                <div className="bg-white p-3 rounded-2xl border border-zinc-150 shadow-sm">
                  <img 
                    src={paymentSettings.qrImageUrl} 
                    alt="eSewa QR Scan" 
                    referrerPolicy="no-referrer"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-600 tracking-wider uppercase block">Recipient Details</span>
                  <div className="flex items-center gap-2 justify-center bg-white border border-zinc-200 px-3.5 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-black text-zinc-800 font-mono">eSewa: {paymentSettings.esewaNumber}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentSettings.esewaNumber);
                        triggerToast('📋 Recipient eSewa number copied!');
                      }}
                      className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-blue-600 transition-all cursor-pointer"
                      title="Copy eSewa Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-semibold pt-1 leading-normal max-w-xs">
                    Please scan this QR code or transfer to the mobile number above, then submit your receipt screenshot below.
                  </p>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleDepositSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Enter Amount */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wide">
                      Deposit Amount (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={paymentSettings.minDeposit}
                        required
                        value={customWalletAdd}
                        onChange={(e) => setCustomWalletAdd(e.target.value)}
                        placeholder={`Min Rs. ${paymentSettings.minDeposit}`}
                        className="w-full text-xs font-bold pl-10 pr-3 py-3 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-blue-500 rounded-xl focus:outline-none transition-all font-mono"
                      />
                      <span className="text-xs font-bold text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">
                        Rs.
                      </span>
                    </div>
                  </div>

                  {/* Upload Receipt Screen */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wide">
                      Payment Screenshot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        required={!depositScreenshotBase64}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                try {
                                  const compressed = await compressImage(reader.result);
                                  setDepositScreenshotBase64(compressed);
                                  setWalletError('');
                                } catch (error) {
                                  setDepositScreenshotBase64(reader.result);
                                  setWalletError('');
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      <div className={`border border-dashed ${depositScreenshotBase64 ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 hover:border-blue-500 bg-zinc-50 hover:bg-white'} rounded-xl py-2 px-3 text-center transition-all cursor-pointer flex items-center justify-center gap-2 h-[42px]`}>
                        <Upload className={`w-4 h-4 ${depositScreenshotBase64 ? 'text-emerald-600' : 'text-zinc-400'} shrink-0`} />
                        <span className={`text-[10px] font-extrabold ${depositScreenshotBase64 ? 'text-emerald-800' : 'text-zinc-600'} truncate`}>
                          {depositScreenshotBase64 ? '✓ Receipt Selected' : 'Choose Receipt'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshot Preview */}
                {depositScreenshotBase64 && (
                  <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/80 px-3.5 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={depositScreenshotBase64} 
                        alt="Receipt preview" 
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-200 shadow-xs shrink-0"
                      />
                      <div className="text-left min-w-0">
                        <span className="block text-[10px] font-black text-emerald-900 truncate">Screenshot Attached</span>
                        <span className="block text-[9px] text-emerald-700 font-bold">Ready to submit</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setDepositScreenshotBase64('')}
                      className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-red-200/60 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDepositing}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  {isDepositing ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Submit Deposit Request</span>
                  )}
                </button>
              </form>

              {/* Deposit History Logs */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 text-left">
                <span className="block text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                  Your Deposit Requests History
                </span>

                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {depositRequests.length === 0 ? (
                    <div className="py-6 text-center text-zinc-400 text-[11px] font-bold">
                      No deposit request logs found yet.
                    </div>
                  ) : (
                    depositRequests.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl border border-zinc-200/70 shadow-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-zinc-900 font-mono">Rs. {dep.amount}</span>
                            <span className="text-[9px] text-zinc-400 font-bold">{dep.timestamp}</span>
                          </div>
                          <span className="block text-[9px] font-bold text-zinc-400 font-mono uppercase">ID: {dep.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Status Badge */}
                          {dep.status === 'PENDING' && (
                            <span className="px-2 py-0.5 text-[8.5px] font-black bg-amber-50 text-amber-700 border border-amber-200 rounded-md animate-pulse">
                              PENDING
                            </span>
                          )}
                          {dep.status === 'COMPLETED' && (
                            <span className="px-2 py-0.5 text-[8.5px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                              APPROVED
                            </span>
                          )}
                          {dep.status === 'REJECTED' && (
                            <span className="px-2 py-0.5 text-[8.5px] font-black bg-red-50 text-red-700 border border-red-100 rounded-md">
                              REJECTED
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedDepositScreenshot(dep.screenshot)}
                            className="bg-white hover:bg-zinc-100 text-zinc-700 text-[9px] font-black px-2 py-1 rounded-lg border border-zinc-200 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Eye className="w-3 h-3 text-zinc-500" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BIG SCREENSHOT PREVIEW OVERLAY */}
      <AnimatePresence>
        {selectedDepositScreenshot && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-zoom-out"
              onClick={() => setSelectedDepositScreenshot(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-xl max-h-[85vh] bg-neutral-900 border border-zinc-800 rounded-3xl p-3 z-10 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setSelectedDepositScreenshot(null)}
                className="absolute -top-3 -right-3 p-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-full shadow-lg border border-zinc-800 transition-all cursor-pointer hover:scale-105"
                title="Close receipt image"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div className="overflow-auto rounded-2xl flex items-center justify-center max-h-[80vh]">
                <img 
                  src={selectedDepositScreenshot} 
                  alt="Receipt Full View" 
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[75vh] object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP 2: PRODUCT CHECKOUT DRAWER / MODAL */}
      <AnimatePresence>
        {false && selectedProduct && (
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
                  {(() => {
                    const reqs = selectedProduct.requirements && Array.isArray(selectedProduct.requirements) ? selectedProduct.requirements : [];

                    if (reqs.length > 0) {
                      return (
                        <div className="space-y-3">
                          {reqs.map((req) => (
                            <div key={req.id}>
                              <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">
                                {req.name} <span className="text-red-500">*</span>
                              </label>
                              <input
                                type={req.type === 'number' ? 'number' : 'text'}
                                required
                                placeholder={`ENTER YOUR ${req.name.toUpperCase()}`}
                                onChange={(e) => {
                                  const nextValues = { ...(window as any)._customReqValues, [req.name]: e.target.value };
                                  (window as any)._customReqValues = nextValues;
                                  const combined = reqs.map(r => `${r.name}: ${nextValues[r.name] || ''}`).join(' | ');
                                  setCheckoutTarget(combined);
                                }}
                                className="w-full text-xs font-medium px-4 py-3 bg-zinc-50 focus:bg-white rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-400 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }

                    return (
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
                      </div>
                    );
                  })()}
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

      {/* POPUP: AUTOMATIC NOTIFICATION PROMPT */}
      <AnimatePresence>
        {showAutoNotifPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAutoNotifPrompt(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-zinc-200 shadow-2xl rounded-3xl w-full max-w-sm p-6 relative z-10 space-y-4"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100 animate-bounce">
                  <Bell className="w-7 h-7 text-blue-600" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-base font-black text-zinc-900 tracking-tight">Enable Push Alerts? 🔔</h4>
                  <p className="text-xs text-zinc-505 font-semibold leading-relaxed">
                    Get real-time updates for Free Fire, PUBG recharges, automatic processing statuses, and flash discount sales on your device!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-150 text-[10px] text-zinc-500 font-medium text-center flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>Works instantly even when the app is completely closed</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAutoNotifPrompt(false)}
                  className="flex-1 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer bg-white"
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAutoNotifPrompt(false);
                    requestNotificationPermission();
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Yes, Notify Me
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA INSTALLATION BANNER */}
      <AnimatePresence>
        {showPWAInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-[999] bg-white border border-zinc-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              {/* Logo */}
              <img
                src="https://i.ibb.co/Qv0ZyF0w/IMG-20260713-WA0032.jpg"
                alt="BNY SHOP Logo"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-zinc-150 shrink-0 shadow-sm"
              />
              
              {/* App Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-zinc-900 tracking-tight text-zinc-900">BNY SHOP</h5>
                  {/* Cross Option */}
                  <button
                    type="button"
                    onClick={handleDismissInstall}
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0 -mt-1 -mr-1"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed mt-1">
                  Install BNY SHOP on your screen for instant access to in-game top-ups and super-fast order processing!
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDismissInstall}
                className="flex-1 py-2 px-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-white"
              >
                No Thanks
              </button>
              <button
                type="button"
                onClick={handleInstallApp}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center"
              >
                Install Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
