const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const app = require("./app");

// Default 4000, not 5000: on macOS, port 5000 is taken by the AirPlay Receiver
// (ControlCenter), which answers every request with an empty 403. The server
// looks like it started fine and the whole frontend fails with no clue why.
const PORT = process.env.PORT || 4000;

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(
    `\n✖ Missing required environment variable(s): ${missing.join(", ")}\n` +
      `  Copy backend/.env.example to backend/.env and fill them in.\n`
  );
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠ GEMINI_API_KEY is not set — AI routes will return 503 until you add one."
  );
}

(async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Without this, a port clash is an unhandled rejection that Node prints as a
  // wall of stack trace — or, worse, gets missed entirely.
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n✖ Port ${PORT} is already in use.\n` +
          `  On macOS, ports 5000 and 7000 are held by the AirPlay Receiver —\n` +
          `  disable it in System Settings → General → AirDrop & Handoff,\n` +
          `  or set PORT to something else in backend/.env.\n`
      );
    } else {
      console.error("\n✖ Server failed to start:", err.message, "\n");
    }
    process.exit(1);
  });
})();
