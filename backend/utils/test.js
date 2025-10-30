import connectDB from "../db.js";
import { addLog } from "../utils/logger.js";

// 1️⃣ First connect to MongoDB
await connectDB();

// 2️⃣ Then, once connected, write the log
await addLog("TEST", "Logger is working", "admin", { test: true });

console.log("✅ Log successfully written");
process.exit(0);
