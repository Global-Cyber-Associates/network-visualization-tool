// backend/visualizer/visualizer.js
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

// Helper to normalize IP (remove spaces, unwanted chars)
function normalizeIP(ip) {
  return (ip || "").trim().replace(/[^0-9.]/g, "");
}

export async function runVisualizerUpdate() {
  try {
    await connectDB();

    // Fetch latest scan result
    const latestScan = await ScanResult.findOne().sort({ createdAt: -1 });
    if (!latestScan) {
      console.log("⚠️ No scan results found.");
      return;
    }

    // Fetch all scan entries
    const allScans = await ScanResult.find({}).sort({ createdAt: -1 });

    // Fetch system info collection
    const systems = await SystemInfo.find();
    const systemIPs = new Set();
    const ipToHostname = new Map();

    // Build IP-to-hostname map
    systems.forEach((sys) => {
      (sys.wlan_ip || []).forEach((ipObj) => {
        const ip = normalizeIP(ipObj.address);
        if (ip) {
          systemIPs.add(ip);
          ipToHostname.set(ip, sys.hostname || "Unknown");
        }
      });
    });

    // Debug logs to verify mapping
    console.log("🧠 Hostname Map:", Object.fromEntries(ipToHostname.entries()));

    const scanIPs = allScans.map((d) => normalizeIP(d.ips?.[0]));
    console.log("📡 ScanResult IPs:", scanIPs);

    // Prepare visualizer data
    const finalDevices = allScans.map((dev) => {
      const ip = normalizeIP(dev.ips?.[0]);
      const hostname = ipToHostname.get(ip) || "Unknown";
      const hasAgent = systemIPs.has(ip);

      return {
        ip,
        hostname,
        mac: dev.mac || "Unknown",
        vendor: dev.vendor || "Unknown",
        ping_only: !!dev.ping_only,
        noAgent: !hasAgent,
      };
    });

    // Clear and insert new visualizer data
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
    await new Promise((resolve) => setTimeout(resolve, 3000)); // every 3 seconds
  }
}
