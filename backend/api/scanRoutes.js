// /api/scanRoutes.js
import express from "express";
import ScanResult from "../models/ScanResult.js";

const router = express.Router();

// 🧠 Fetch the latest scan result
router.get("/latest", async (req, res) => {
  try {
    const latestScan = await ScanResult.findOne().sort({ createdAt: -1 }).limit(1);

    if (!latestScan) {
      return res.status(404).json({ message: "No scan results found" });
    }

    res.json(latestScan);
  } catch (err) {
    console.error("Error fetching latest scan:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
