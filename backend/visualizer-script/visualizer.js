import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ScanResult from "../models/ScanResult.js";
import SystemInfo from "../models/system.js";
import VisualizerData from "../models/VisualizerData.js";

// 🔧 Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Absolute path to config.json in project root
const configPath = path.resolve(__dirname, "../config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const MONGO_URI = config.mongoURI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => main())
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  try {
    console.log("[*] Fetching ScanResult and SystemInfo...");

    // Latest scan result
    const latestScan = await ScanResult.findOne().sort({ createdAt: -1 });
    const scanDevices = latestScan?.devices || [];

    // All system infos
    const systems = await SystemInfo.find();

    // Flatten system IPs from wlan_ip arrays
    const systemIPs = new Set();
    systems.forEach(sys => {
      (sys.wlan_ip || []).forEach(ipObj => {
        const ip = (ipObj.address || "").trim();
        if (ip) systemIPs.add(ip);
      });
    });

    // Map scan devices and mark noAgent correctly
    const finalDevices = scanDevices.map(dev => {
      const ip = (dev.ips?.[0] || "N/A").trim();
      return {
        ip,
        mac: dev.mac || "Unknown",
        vendor: dev.vendor || "Unknown",
        noAgent: ip === "N/A" ? true : !systemIPs.has(ip)
      };
    });

    // Save to VisualizerData collection
    await VisualizerData.deleteMany({});
    await VisualizerData.insertMany(finalDevices);

    console.log("[*] Visualizer data refreshed. JSON output:");
    console.log(JSON.stringify(finalDevices, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
