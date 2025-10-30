import express from "express";
import Log from "../models/Log.js";
import { addLog } from "../utils/logger.js";

const router = express.Router();

/* ---------------- GET /api/logs ----------------
   → Fetch latest 100 logs
------------------------------------------------*/
router.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error("❌ Error fetching logs:", err);
    res.status(500).json({ success: false, message: "Error fetching logs" });
  }
});

/* ---------------- POST /api/logs/add ----------------
   → Add a new log entry manually
   Request body:
   {
     "type": "INFO",
     "message": "Test log entry",
     "actor": "admin",
     "metadata": { "ip": "127.0.0.1" }
   }
------------------------------------------------*/
router.post("/logs/add", async (req, res) => {
  try {
    const { type, message, actor, metadata } = req.body;
    if (!type || !message) {
      return res.status(400).json({ success: false, message: "Type and message required" });
    }

    await addLog(type, message, actor, metadata);
    res.status(201).json({ success: true, message: "Log added successfully" });
  } catch (err) {
    console.error("❌ Error creating log:", err);
    res.status(500).json({ success: false, message: "Error creating log" });
  }
});

export default router;
