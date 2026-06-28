import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, getDoc, doc, addDoc } from "firebase/firestore";

// Initialize Express app
const app = express();
const PORT = 3000;

// Enable CORS for Vercel and external testing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Enable JSON body parsing
app.use(express.json());

const firebaseConfig = {
  projectId: "gen-lang-client-0930602584",
  appId: "1:140989933378:web:1d77d39a8a7febe1a60adb",
  apiKey: "AIzaSyCOyrRlJz8voqUF7UXSe7Lsz-OfEnZcAP4",
  authDomain: "gen-lang-client-0930602584.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-topupapp-7cbcfc1d-d676-4eac-bf74-e4e2c2d49ceb",
  storageBucket: "gen-lang-client-0930602584.firebasestorage.app",
  messagingSenderId: "140989933378"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);


// In-memory store for the verification code (single administrator scope)
let currentCode: string | null = null;
let codeExpiry: number = 0;

// API route to send verification code
app.post("/api/send-code", async (req, res) => {
  try {
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    currentCode = code;
    codeExpiry = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

    const recipientEmail = "mandipmahato717@gmail.com";

    // Send the email to mandipmahato717@gmail.com using FormSubmit AJAX API
    const response = await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: "MB Gaming Store Security",
        _subject: "🔑 MB GAMING STORE - Admin Verification Code",
        message: `Hello Mandip,

We received a request to reset your MB GAMING STORE administrator password.
Your 6-digit password reset verification code is:

👉 [ ${code} ] 👈

Enter this code in the admin portal reset screen to change your password. 
If you didn't request this, you can safely ignore this email.

Best regards,
MB GAMING STORE Security Team`,
        _honey: ""
      })
    });

    const data = await response.json();
    console.log("FormSubmit response:", data);

    // FormSubmit returns success as a string or a boolean, or might indicate email activation is pending
    const isSuccess = data.success === true || data.success === "true";
    const msg = data.message || "";

    if (msg.toLowerCase().includes("activation") || msg.toLowerCase().includes("first submit")) {
      res.json({ 
        success: true, 
        isActivationPending: true,
        message: "Activation email sent! Please check your Gmail (including Spam folder) and click 'Confirm' to enable reset codes." 
      });
      return;
    }

    if (!isSuccess) {
      res.status(400).json({ 
        success: false, 
        error: msg || "Failed to send verification code. Please make sure the recovery email is correct." 
      });
      return;
    }

    res.json({ success: true, isActivationPending: false, message: "Verification code sent to Gmail app!" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ success: false, error: "Failed to send verification code via mail service." });
  }
});

// API route to verify code
app.post("/api/verify-code", (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ success: false, error: "Verification code is required." });
    return;
  }

  if (!currentCode || Date.now() > codeExpiry) {
    res.status(400).json({ success: false, error: "Verification code has expired. Please request a new one." });
    return;
  }

  if (code.trim() === currentCode) {
    res.json({ success: true, message: "Code verified successfully." });
  } else {
    res.status(400).json({ success: false, error: "Invalid verification code. Please check and try again." });
  }
});

// GET api/notifications - retrieve list
app.get("/api/notifications", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "notifications"));
    let notifications: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (notifications.length === 0) {
      notifications = [
        {
          id: "notif-sample-1",
          title: "🔥 Welcome to MB Gaming Store!",
          body: "Get instant recharges, game diamonds, vouchers and subscriptions with 24/7 automatic processing. Enable push notifications for flash sales!",
          iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
          linkUrl: "/",
          timestamp: Date.now() - 3600000 * 2
        }
      ];
    }
    notifications.sort((a: any, b: any) => b.timestamp - a.timestamp);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST api/notifications - publish a new push notification from Admin Panel
app.post("/api/notifications", async (req, res) => {
  const { title, body, iconUrl, linkUrl } = req.body;
  if (!title || !body) {
    res.status(400).json({ success: false, error: "Title and description are required." });
    return;
  }
  const newNotif = {
    title: title.trim(),
    body: body.trim(),
    iconUrl: iconUrl ? iconUrl.trim() : "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: linkUrl ? linkUrl.trim() : "/",
    timestamp: Date.now()
  };
  try {
    const docRef = await addDoc(collection(db, "notifications"), newNotif);
    res.json({ success: true, notification: { id: docRef.id, ...newNotif } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// GET api/transactions - retrieve orders list
app.get("/api/transactions", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, "transactions"));
    let transactions: any[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (transactions.length === 0) {
      transactions = [
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
        }
      ];
    }
    transactions.sort((a: any, b: any) => String(b.timestamp).localeCompare(String(a.timestamp)));
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// POST api/transactions - submit new order (placed by users or admins)
app.post("/api/transactions", async (req, res) => {
  const newTx = req.body;
  if (!newTx || !newTx.id) {
    res.status(400).json({ success: false, error: "Invalid transaction data." });
    return;
  }
  try {
    await setDoc(doc(db, "transactions", newTx.id), newTx);
    res.json({ success: true, transaction: newTx });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// PUT api/transactions/:id - update order status (approve / reject)
app.put("/api/transactions/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: "Status is required." });
    return;
  }
  try {
    const txDoc = await getDoc(doc(db, "transactions", id));
    if (!txDoc.exists()) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    const txData = txDoc.data();
    txData.status = status;
    await setDoc(doc(db, "transactions", id), txData);
    res.json({ success: true, transaction: { id, ...txData } });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Server-side in-memory user registry
let systemUsers = [
  {
    name: "Mandip Mahato",
    email: "mandipmahato717@gmail.com",
    password: "password123",
    walletBalance: 2450,
    loyaltyPoints: 86534
  }
];

// POST api/auth/register - Register a new account
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: "Please enter your name, email, and password." });
    return;
  }
  
  const emailLower = email.toLowerCase().trim();
  const exists = systemUsers.some(u => u.email.toLowerCase() === emailLower);
  
  if (exists) {
    res.status(400).json({ success: false, error: "An account with this email address already exists." });
    return;
  }
  
  const newUser = {
    name: name.trim(),
    email: emailLower,
    password: password,
    walletBalance: 2500, // starting gift balance
    loyaltyPoints: 0 // starting points are zero
  };
  
  systemUsers.push(newUser);
  
  // Add a server-side registration notification
  const newNotif = {
    title: "🎉 Registration Successful!",
    body: `Welcome, ${newUser.name}! Your account has been registered successfully.`,
    iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: "/",
    timestamp: Date.now()
  };
  addDoc(collection(db, "notifications"), newNotif).catch(e => console.error(e));

  
  // Return the user session details (excluding password)
  const { password: _, ...userSession } = newUser;
  res.json({ success: true, user: userSession, message: "Account registered successfully!" });
});

// POST api/auth/login - Log in with existing account
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ success: false, error: "Please enter both email and password." });
    return;
  }
  
  const emailLower = email.toLowerCase().trim();
  const user = systemUsers.find(u => u.email.toLowerCase() === emailLower);
  
  if (!user || user.password !== password) {
    res.status(400).json({ success: false, error: "Invalid email address or incorrect password. Please try again." });
    return;
  }
  
  // Add a server-side login notification
  const newNotif = {
    title: "🔑 Login Successful!",
    body: `Welcome back, ${user.name}! You have logged in successfully to your MB Gaming account.`,
    iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: "/",
    timestamp: Date.now()
  };
  addDoc(collection(db, "notifications"), newNotif).catch(e => console.error(e));

  
  const { password: _, ...userSession } = user;
  res.json({ success: true, user: userSession, message: "Welcome back!" });
});

// POST api/auth/sync-profile - Sync wallet and points with the server
app.post("/api/auth/sync-profile", (req, res) => {
  const { email, walletBalance, loyaltyPoints } = req.body;
  
  if (!email) {
    res.status(400).json({ success: false, error: "Email is required to sync profile." });
    return;
  }
  
  const emailLower = email.toLowerCase().trim();
  const user = systemUsers.find(u => u.email.toLowerCase() === emailLower);
  
  if (user) {
    if (walletBalance !== undefined) user.walletBalance = walletBalance;
    if (loyaltyPoints !== undefined) user.loyaltyPoints = loyaltyPoints;
    
    const { password: _, ...userSession } = user;
    res.json({ success: true, user: userSession });
  } else {
    // If the server restarted and the session is local, register it in server memory
    const newUser = {
      name: emailLower.split('@')[0],
      email: emailLower,
      password: "password123",
      walletBalance: walletBalance ?? 2500,
      loyaltyPoints: loyaltyPoints ?? 0
    };
    systemUsers.push(newUser);
    res.json({ success: true, user: newUser });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
