import express from "express";
import InstalledApp from "../models/InstalledApps.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body.results || req.body; // ✅ support both formats
    const { deviceId, applications } = data;

    if (!deviceId || !applications) {
      return res.status(400).json({ message: "Missing deviceId or applications" });
    }

    const newRecord = new InstalledApp({
      deviceId,
      applications
    });

    await newRecord.save();
    res.status(201).json({ message: "Installed apps saved successfully" });
  } catch (error) {
    console.error("[InstalledApps POST Error]", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


export default router;
