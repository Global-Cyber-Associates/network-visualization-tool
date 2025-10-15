// backend/api/visualizerData.js
import express from "express";
import VisualizerData from "./models/visualizerData.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await VisualizerData.find().sort({ createdAt: -1 });

    // If you’re using a wrapped "devices" field, unwrap it here:
    if (result.length === 1 && result[0].devices) {
      return res.json(result[0].devices);
    }

    // Otherwise, just return as-is
    res.json(result);
  } catch (err) {
    console.error("Error fetching visualizer data:", err);
    res.status(500).json({ message: "Failed to fetch visualizer data" });
  }
});

export default router;
