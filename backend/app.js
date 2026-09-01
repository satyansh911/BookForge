const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const aiRoutes = require("./routes/aiRoutes");
const exportRoutes = require("./routes/exportRoutes");
const socialRoutes = require("./routes/socialRoutes");

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:4173,https://book-forge-lovat.vercel.app,https://bookforgeweb.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelOriginRegex = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow tools and server-to-server requests without an Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || vercelOriginRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  // PATCH is required by /api/books/progress/:id — omitting it makes the
  // browser's preflight fail and reading progress silently stops saving.
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.send("BookForge API is running 🚀");
});

app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    ai: process.env.GEMINI_API_KEY ? "configured" : "missing",
    tts: process.env.SMALLEST_AI_API_KEY ? "configured" : "missing",
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/social", socialRoutes);

// Unknown /api/* paths must return JSON, never HTML — the frontend's axios
// interceptor treats an HTML body as a misconfiguration and fails loudly.
app.use("/api", (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler. Without this, a thrown error (or a rejected CORS
// origin, or a multer file-type rejection) produces Express's default HTML
// error page — which the frontend cannot parse.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("Unhandled error:", err);
  res.status(status).json({ message: err.message || "Internal server error" });
});

module.exports = app;
