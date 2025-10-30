import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import fs from "fs";
import Device from "../models/VisualizerScanner.js";
import { runVisualizerUpdate } from "./visualizer.js"; // 👈 visualizer updater

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scannerPath = path.join(__dirname, "scanner_service.py");

// // ---------------- CONFIG ----------------
// let MONGO_URI = "";
// try {
//   const configPath = path.join(__dirname, "../config.json");
//   const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
//   MONGO_URI = config.mongoURI;
//   console.log("✅ Loaded MongoDB URI from config.json");
// } catch (err) {
//   console.error("❌ Failed to load config.json:", err.message);
//   process.exit(1);
// }

// ---------------- MONGOOSE ----------------
// await mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ Connected to MongoDB (scanner)"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err.message);
//     process.exit(1);
//   });

// ---------------- CONTINUOUS LOOP ----------------
async function runScannerCycle() {
  console.log("🚀 Starting Python scanner cycle...");

  return new Promise((resolve) => {
    const scannerProcess = spawn("python", [scannerPath], {
      cwd: __dirname,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let buffer = "";
    scannerProcess.stdout.setEncoding("utf8");

    scannerProcess.stdout.on("data", async (data) => {
      buffer += data.toString();

      // Each full scan result ends with ']'
      if (buffer.trim().endsWith("]")) {
        try {
          const jsonStart = buffer.indexOf("[");
          const jsonText = buffer.slice(jsonStart).trim();
          const devices = JSON.parse(jsonText);

          console.log(`📡 Received ${devices.length} devices from Python`);
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

          console.log("⚙️ Running visualizer update after scan...");
          await runVisualizerUpdate();
          console.log("✅ Visualizer update completed.");

          buffer = ""; // reset buffer
        } catch (err) {
          console.error("❌ JSON parse error:", err.message);
          buffer = "";
        }
      }
    });

    scannerProcess.stderr.on("data", (data) => {
      console.error("🔥 Python error:", data.toString());
    });

    scannerProcess.on("close", (code) => {
      console.log(`🔁 Scanner cycle finished with code ${code}`);
      resolve(); // continue next cycle
    });
  });
}

// ---------------- RUN FOREVER ----------------
async function startContinuousLoop() {
  while (true) {
    const startTime = new Date();
    console.log(`\n🌀 New scan cycle started at ${startTime.toLocaleTimeString()}`);

    await runScannerCycle();

    const endTime = new Date();
    console.log(`✅ Cycle completed at ${endTime.toLocaleTimeString()}`);

    console.log("⏳ Waiting 5 seconds before next scan...");
    await new Promise((r) => setTimeout(r, 50000)); // adjust interval if needed
  }
}

startContinuousLoop();
