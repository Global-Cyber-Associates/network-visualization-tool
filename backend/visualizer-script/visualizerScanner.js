import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";
import Device from "../models/VisualizerScanner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scannerPath = path.join(__dirname, "scanner_service.py");

// ---------------- CONFIG ----------------
let MONGO_URI = "";
try {
  const configPath = path.join(__dirname, "../config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  MONGO_URI = config.mongoURI;
  console.log("✅ Loaded MongoDB URI from config.json");
} catch (err) {
  console.error("❌ Failed to load config.json:", err.message);
  process.exit(1);
}

// ---------------- MONGOOSE ----------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB (scanner)"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ---------------- RUN PYTHON ----------------
console.log("🚀 Starting continuous Python scanner...");

const scannerProcess = spawn("python", [scannerPath], {
  cwd: __dirname,
  stdio: ["ignore", "pipe", "pipe"],
});

scannerProcess.stdout.setEncoding("utf8");

let buffer = "";

scannerProcess.stdout.on("data", async (data) => {
  buffer += data.toString();

  // each JSON output from Python ends with ']'
  if (buffer.trim().endsWith("]")) {
    try {
      const jsonStart = buffer.indexOf("[");
      const jsonText = buffer.slice(jsonStart).trim();

      const devices = JSON.parse(jsonText);
      console.log(`📡 Received ${devices.length} devices from Python`);

      // Update DB
      const currentIPs = devices.map((d) => d.ips[0]);
      await Device.deleteMany({ "ips.0": { $nin: currentIPs } });

      for (const d of devices) {
        await Device.findOneAndUpdate(
          { "ips.0": d.ips[0] },
          { ...d, lastSeen: new Date() },
          { upsert: true, new: true }
        );
      }

      console.log(`✅ Synced ${devices.length} devices to DB`);
      buffer = ""; // reset for next JSON block
    } catch (err) {
      console.error("❌ JSON parse error:", err.message);
      buffer = ""; // clear buffer to avoid corrupt carryover
    }
  }
});

scannerProcess.stderr.on("data", (data) => {
  console.error("🔥 Python error:", data.toString());
});

scannerProcess.on("close", (code) => {
  console.error(`⚠️ Python scanner exited with code ${code}`);
  process.exit(1);
});
