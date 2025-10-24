// backend/visualizer/visualizer.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ScanResult from "../models/ScanResult.js";
import SystemInfo from "../models/system.js";
import VisualizerData from "../models/VisualizerData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const MONGO_URI = config.mongoURI;

let connected = false;
async function connectDB() {
  if (!connected) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connected = true;
    console.log("✅ MongoDB connected for visualizer auto-sync");
  }
}

// Core update logic
export async function runVisualizerUpdate() {
  try {
    await connectDB();

    const latestScan = await ScanResult.findOne().sort({ createdAt: -1 });
    const scanDevices = latestScan?.devices || [];

    const systems = await SystemInfo.find();

    const systemIPs = new Set();
    systems.forEach((sys) => {
      (sys.wlan_ip || []).forEach((ipObj) => {
        const ip = (ipObj.address || "").trim();
        if (ip) systemIPs.add(ip);
      });
    });

    const finalDevices = scanDevices.map((dev) => {
      const ip = (dev.ips?.[0] || "N/A").trim();
      return {
        ip,
        mac: dev.mac || "Unknown",
        vendor: dev.vendor || "Unknown",
        noAgent: ip === "N/A" ? true : !systemIPs.has(ip),
      };
    });

    await VisualizerData.deleteMany({});
    await VisualizerData.insertMany(finalDevices);

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ Visualizer updated (${finalDevices.length} devices)`
    );
  } catch (err) {
    console.error(
      `[${new Date().toLocaleTimeString()}] ❌ Visualizer update failed:`,
      err.message
    );
  }
}

// Continuous async loop with ~30ms delay
export async function startContinuousSync() {
  while (true) {
    await runVisualizerUpdate();
    await new Promise((resolve) => setTimeout(resolve, 30)); // 30ms pause
  }
}
