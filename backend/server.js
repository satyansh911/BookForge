require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const aiRoutes = require("./routes/aiRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://book-forge-lovat.vercel.app,https://bookforgeweb.vercel.app"
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("BookForge API is running 🚀");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
