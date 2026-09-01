/**
 * Starts a local MongoDB on 127.0.0.1:27017 with data persisted to
 * backend/.local-db, so the app can be demoed with no Atlas account, no
 * network, and no separate MongoDB install.
 *
 *   npm run db:local        # leave this running in its own terminal
 *
 * Then point backend/.env at it:
 *   MONGO_URI=mongodb://127.0.0.1:27017/bookforge
 */

const path = require("path");
const fs = require("fs");
const { MongoMemoryServer } = require("mongodb-memory-server");

const dbPath = path.join(__dirname, "..", ".local-db");
fs.mkdirSync(dbPath, { recursive: true });

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, dbPath, storageEngine: "wiredTiger" },
  });

  console.log(`\n  MongoDB running at ${mongod.getUri()}`);
  console.log(`  Data directory: ${dbPath}`);
  console.log(`  Set MONGO_URI=mongodb://127.0.0.1:27017/bookforge in backend/.env`);
  console.log(`  Press Ctrl+C to stop.\n`);

  const shutdown = async () => {
    console.log("\n  Stopping MongoDB...");
    await mongod.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})().catch((e) => {
  console.error("Failed to start local MongoDB:", e.message);
  process.exit(1);
});
