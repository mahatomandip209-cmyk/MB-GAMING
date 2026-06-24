import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initialize Express app
const app = express();
const PORT = 3000;

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
