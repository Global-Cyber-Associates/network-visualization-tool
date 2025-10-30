import express from "express";
import Log from "../models/Log.js";

const router = express.Router(); // ← this is the missing part

// GET /api/logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ success: false, message: "Error fetching logs" });
  }
});

export default router;
