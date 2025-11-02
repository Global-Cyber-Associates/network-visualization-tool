import express from "express";
import InstalledApp from "../models/InstalledApps.js";

const router = express.Router();

/* ---------------------- POST: Save Installed Apps ---------------------- */
router.post("/", async (req, res) => {
  try {
    const data = req.body.results || req.body;
    const { deviceId, applications } = data;

    if (!deviceId || !applications) {
      return res
        .status(400)
        .json({ success: false, message: "Missing deviceId or applications" });
    }

    console.log(`📦 Saving ${applications.length} apps for device: ${deviceId}`);

    // Optional: remove old records before saving new ones
    await InstalledApp.deleteMany({ deviceId });

    const record = new InstalledApp({
      deviceId,
      applications,
      timestamp: new Date(),
    });

    await record.save();

    res.status(201).json({ success: true, message: "Installed apps saved successfully" });
  } catch (error) {
    console.error("❌ [InstalledApps POST Error]:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

/* ---------------------- GET: Get Installed Apps List ---------------------- */
// Get all apps for all devices
router.get("/", async (req, res) => {
  try {
    const apps = await InstalledApp.find().sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: apps.length, data: apps });
  } catch (error) {
    console.error("❌ [InstalledApps GET Error]:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

/* ---------------------- GET: Get Apps for Specific Device ---------------------- */
router.get("/apps/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const apps = await InstalledApp.findOne({ deviceId });

    if (!apps) {
      return res.status(404).json({ success: false, message: "Device not found or no apps stored" });
    }

    res.status(200).json({ success: true, data: apps });
  } catch (error) {
    console.error("❌ [InstalledApps GET/:deviceId Error]:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
});

export default router;
