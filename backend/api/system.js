// routes/system.js
import express from "express";
import SystemInfo from "../models/system.js";

const router = express.Router();

// POST /api/system
router.post("/system", async (req, res) => {
  try {
    const systemData = req.body.system; // expects { system: { ... } }

    if (!systemData) {
      return res.status(400).json({ message: "No system data provided" });
    }

    const newSystem = new SystemInfo(systemData);
    await newSystem.save();

    res.status(201).json({ message: "System info saved", id: newSystem._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save system info", error: err.message });
  }
});

// ✅ GET /api/system — returns all system records
router.get("/system", async (req, res) => {
  try {
    const systems = await SystemInfo.find();
    res.status(200).json(systems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch system info", error: err.message });
  }
});

export default router;
