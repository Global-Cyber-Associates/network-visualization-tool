import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ScanResult from "../models/VisualizerScanner.js";
import SystemInfo from "../models/SystemInfo.js";
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
    console.log("✅ MongoDB connected for visualizer update");
  }
}

export async function runVisualizerUpdate() {
  try {
    await connectDB();

    // 1️⃣ Fetch all scan results (latest first)
    const allScans = await ScanResult.find({}).sort({ createdAt: -1 });
    if (!allScans.length) {
      console.log("⚠️ No scan results found.");
      return;
    }

    // 2️⃣ Fetch system info (for agent-installed systems)
    const systems = await SystemInfo.find();
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

    // 3️⃣ Filter only devices that are *alive* (ping successful)
    const aliveDevices = allScans.filter(
      (dev) =>
        dev.isAlive === true ||             // Explicit alive field
        dev.ping_only === true ||           // Or ping-only but alive
        dev.status === "alive" ||           // Or textual status
        dev.pingSuccess === true            // In case stored differently
    );

    if (!aliveDevices.length) {
      console.log("⚠️ No active devices detected — nothing updated.");
      return;
    }

    // 4️⃣ Map alive devices to visualizer format
    const finalDevices = aliveDevices.map((dev) => {
      const ip = (dev.ips?.[0] || "N/A").trim();
      const hasAgent = systemIPs.has(ip);
      const hostname = hasAgent ? ipToHostname.get(ip) || "Unknown" : "Unknown";

      return {
        ip,
        mac: dev.mac || "Unknown",
        hostname,
        ping_only: !!dev.ping_only,
        noAgent: ip === "N/A" ? true : !hasAgent,
        lastSeen: new Date(),
      };
    });

    // 5️⃣ Replace visualizer data with alive ones only
    await VisualizerData.deleteMany({});
    await VisualizerData.insertMany(finalDevices);

    console.log(
      `[${new Date().toLocaleTimeString()}] ✅ Visualizer updated — ${finalDevices.length} active devices stored`
    );
  } catch (err) {
    console.error(
      `[${new Date().toLocaleTimeString()}] ❌ Visualizer update failed:`,
      err.message
    );
  }
}
