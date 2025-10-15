import express from "express";
import NetworkScan from "../models/NetworkScan.js";

const router = express.Router();

// GET /api/network-scan/latest
router.get("/visualize", async (req, res) => {
  try {
    const latest = await NetworkScan.findOne().sort({ createdAt: -1 });
    if (!latest) return res.json({ ok: false, results: [], message: "No scan data yet" });
    res.json({ ok: true, results: latest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
