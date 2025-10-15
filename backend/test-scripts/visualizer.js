import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import ScanResult from "../models/ScanResult.js";
import SystemInfo from "../models/system.js";
import VisualizerData from "../models/VisualizerData.js";


// Adjust path to the config file in parent folder
const configPath = path.resolve("../config.json"); // <-- ../ because script is in test-scripts
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const MONGO_URI = config.mongoURI;


// 2️⃣ Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => main())
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  try {
    console.log("[*] Fetching ScanResult and SystemInfo...");

    const latestScan = await ScanResult.findOne().sort({ createdAt: -1 });
    const scanDevices = latestScan?.devices || [];

    const systems = await SystemInfo.find();

    const systemDevices = systems.map((d) => ({
      ip: d.ip || d.internal_ip || "N/A",
      mac: d.mac || "Unknown",
      vendor: d.vendor || "Unknown",
    }));

    const scanMapped = scanDevices.map((d) => ({
      ip: d.ips?.[0] || "N/A",
      mac: d.mac || "Unknown",
      vendor: d.vendor || "Unknown",
    }));

    // Merge and mark noAgent
    const ipMap = {};

    scanMapped.forEach((d) => {
      ipMap[d.ip] = { ip: d.ip, mac: d.mac, vendor: d.vendor, noAgent: false };
    });

    systemDevices.forEach((d) => {
      if (ipMap[d.ip]) {
        ipMap[d.ip] = { ...ipMap[d.ip], mac: ipMap[d.ip].mac || d.mac, vendor: ipMap[d.ip].vendor || d.vendor, noAgent: false };
      } else {
        ipMap[d.ip] = { ip: d.ip, mac: d.mac, vendor: d.vendor, noAgent: true };
      }
    });

    const finalDevices = Object.values(ipMap);

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
