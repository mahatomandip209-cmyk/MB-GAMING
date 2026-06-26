import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

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

// Store notifications in-memory with initial sample notifications
let systemNotifications = [
  {
    id: "notif-sample-1",
    title: "🔥 Welcome to MB Gaming Store!",
    body: "Get instant recharges, game diamonds, vouchers and subscriptions with 24/7 automatic processing. Enable push notifications for flash sales!",
    iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: "/",
    timestamp: Date.now() - 3600000 * 2 // 2 hours ago
  },
  {
    id: "notif-sample-2",
    title: "⚡ Free Fire Weekly Membership Special Offer",
    body: "Claim extra bonus points on every Free Fire diamond purchase this week. Live validation takes less than 3 minutes!",
    iconUrl: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: "/",
    timestamp: Date.now() - 3600000 * 24 // 24 hours ago
  }
];

// GET api/notifications - retrieve list
app.get("/api/notifications", (req, res) => {
  res.json({ success: true, notifications: systemNotifications });
});

// POST api/notifications - publish a new push notification from Admin Panel
app.post("/api/notifications", (req, res) => {
  const { title, body, iconUrl, linkUrl } = req.body;
  
  if (!title || !body) {
    res.status(400).json({ success: false, error: "Title and description are required." });
    return;
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    title: title.trim(),
    body: body.trim(),
    iconUrl: iconUrl ? iconUrl.trim() : "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
    linkUrl: linkUrl ? linkUrl.trim() : "/",
    timestamp: Date.now()
  };

  systemNotifications.unshift(newNotif);
  
  // Keep last 40 notifications
  if (systemNotifications.length > 40) {
    systemNotifications = systemNotifications.slice(0, 40);
  }

  res.json({ success: true, notification: newNotif });
});

// Store transactions/orders in-memory for server-side persistence & multi-device sync
let systemTransactions = [
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

// GET api/transactions - retrieve orders list
app.get("/api/transactions", (req, res) => {
  res.json({ success: true, transactions: systemTransactions });
});

// POST api/transactions - submit new order (placed by users or admins)
app.post("/api/transactions", (req, res) => {
  const newTx = req.body;
  if (!newTx || !newTx.id) {
    res.status(400).json({ success: false, error: "Invalid transaction data." });
    return;
  }
  
  // Prepend new order
  systemTransactions.unshift(newTx);
  
  // Keep last 150 transactions
  if (systemTransactions.length > 150) {
    systemTransactions = systemTransactions.slice(0, 150);
  }
  
  res.json({ success: true, transaction: newTx });
});

// PUT api/transactions/:id - update order status (approve / reject)
app.put("/api/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    res.status(400).json({ success: false, error: "Status is required." });
    return;
  }
  
  const tx = systemTransactions.find(t => t.id === id);
  if (!tx) {
    res.status(404).json({ success: false, error: "Order not found." });
    return;
  }
  
  tx.status = status;
  res.json({ success: true, transaction: tx });
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
