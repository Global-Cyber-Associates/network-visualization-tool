import express from "express";
import NetworkScan from "../models/NetworkScan.js";

const router = express.Router();

// POST /api/network-scan
router.post("/", async (req, res) => {
  try {
    const { network, hosts } = req.body;

    if (!network || !hosts) {
      return res.status(400).json({ message: "Missing network or hosts data" });
    }

    const scan = new NetworkScan({ network, hosts });
    await scan.save();

    res.json({ message: "Network scan saved successfully", scan });
  } catch (err) {
    console.error("Error saving network scan:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/network-scan
router.get("/", async (req, res) => {
  try {
    const scans = await NetworkScan.find().sort({ scannedAt: -1 });
    res.json(scans);
  } catch (err) {
    console.error("Error fetching scans:", err);
    res.status(500).json({ message: "Failed to fetch scans", error: err.message });
  }
});

export default router;
