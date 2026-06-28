import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, Gamepad2 } from 'lucide-react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  doc, 
  setDoc, 
  getDoc 
} from '../firebase';

interface LoginRegisterProps {
  onSuccess: (user: { name: string; email: string; walletBalance: number; loyaltyPoints: number }) => void;
  getBackendUrl: (path: string) => string;
  triggerToast: (msg: string) => void;
}

export const LoginRegister: React.FC<LoginRegisterProps> = ({ onSuccess, getBackendUrl, triggerToast }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const emailLower = email.toLowerCase().trim();

      if (isLogin) {
        // Firebase Auth: Sign In
        const userCredential = await signInWithEmailAndPassword(auth, emailLower, password);
        
        // Fetch User profile from Firestore
        const userDocRef = doc(db, 'users', emailLower);
        const userDocSnap = await getDoc(userDocRef);
        
        let userProfile;
        if (userDocSnap.exists()) {
          userProfile = userDocSnap.data();
        } else {
          // Fallback bootstrap if user profile doesn't exist in Firestore
          userProfile = {
            name: userCredential.user.displayName || emailLower.split('@')[0],
            email: emailLower,
            walletBalance: 2500,
            loyaltyPoints: 0,
            registered: new Date().toISOString().split('T')[0]
          };
          await setDoc(userDocRef, userProfile);
        }

        triggerToast("Welcome back! Logged in successfully.");
        localStorage.setItem('mb_current_user', JSON.stringify(userProfile));
        onSuccess(userProfile as any);
      } else {
        // Firebase Auth: Register
        const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
        await updateProfile(userCredential.user, { displayName: name.trim() });

        // Save User profile in Firestore with starting 0 points and 2500 balance
        const userDocRef = doc(db, 'users', emailLower);
        const newUserProfile = {
          name: name.trim(),
          email: emailLower,
          walletBalance: 2500,
          loyaltyPoints: 0,
          registered: new Date().toISOString().split('T')[0]
        };
        await setDoc(userDocRef, newUserProfile);

        // Track a notification on server/db as well
        try {
          fetch(getBackendUrl('/api/notifications'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              title: "🎉 Registration Successful!",
              body: `Welcome, ${name.trim()}! Your account has been registered successfully.`,
              linkUrl: "/",
              iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg"
            })
          }).catch(() => {});
        } catch (e) {}

        triggerToast("Registration successful! Welcome to MB Gaming.");
        localStorage.setItem('mb_current_user', JSON.stringify(newUserProfile));
        onSuccess(newUserProfile);
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let errMsg = "Authentication failed. Please try again.";
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Invalid email address or incorrect password.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No account found with this email.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "An account with this email address already exists.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
      
      {/* BRAND & GAMING ICON HEADER */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-black text-zinc-950 tracking-tight">
            {isLogin ? "Sign In to MB Gaming" : "Create Gamer Account"}
          </h2>
        </div>
      </div>

      {/* CUSTOM AUTH SLIDER TAB */}
      <div className="grid grid-cols-2 p-1 bg-zinc-100/85 rounded-xl border border-zinc-200/40">
        <button
          type="button"
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            isLogin 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
            !isLogin 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Register
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200/50 rounded-xl text-xs font-extrabold text-red-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM FIELDS */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name field (Register only) */}
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Mandip Mahato"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm"
              />
            </div>
          </div>
        )}

        {/* Email Address field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="email"
              placeholder="gamer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password field (Register only) */}
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner-sm"
              />
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer border-none"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isLogin ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>LOG IN TO MB STORE</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>REGISTER ACCOUNT</span>
            </>
          )}
        </button>
      </form>

    </div>
  );
};
