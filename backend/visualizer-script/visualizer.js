import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ScanResult from "../models/VisualizerScanner.js";
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

export async function runVisualizerUpdate() {
  try {
    await connectDB();

    // Fetch all scan entries (latest first)
    const allScans = await ScanResult.find({}).sort({ createdAt: -1 });
    if (!allScans.length) {
      console.log("⚠️ No scan results found.");
      return;
    }

    // Fetch all system info documents
    const systems = await SystemInfo.find();

    // Build a mapping of IP -> hostname from system info
    const ipToHostname = new Map();
    const systemIPs = new Set();

    systems.forEach((sys) => {
      (sys.wlan_ip || []).forEach((ipObj) => {
        const ip = (ipObj.address || "").trim();
        if (ip) {
          systemIPs.add(ip);
          ipToHostname.set(ip, sys.hostname || "Unknown");
        }
      });
    });

    // Build final visualizer data
    const finalDevices = allScans.map((dev) => {
      const ip = (dev.ips?.[0] || "N/A").trim();
      const hasAgent = systemIPs.has(ip);
      const hostname = hasAgent ? ipToHostname.get(ip) || "Unknown" : "Unknown";

      return {
        ip,
        mac: dev.mac || "Unknown",
        hostname, // 👈 Used by frontend for display
        ping_only: !!dev.ping_only,
        noAgent: ip === "N/A" ? true : !hasAgent,
      };
    });

    // Replace all existing visualizer data
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

// Continuous background sync loop
export async function startContinuousSync() {
  while (true) {
    await runVisualizerUpdate();
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Run every 3 seconds
  }
}
