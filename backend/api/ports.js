import express from "express";
import PortScan from "../models/ports.js";

const router = express.Router();

// POST /api/ports
router.post("/ports", async (req, res) => {
  try {
    const { results } = req.body;
    if (!results || !Array.isArray(results))
      return res.status(400).json({ message: "Invalid scan results" });

    const newScan = new PortScan({ results });
    await newScan.save();

    res.status(201).json({ message: "Scan results saved", scanId: newScan._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save scan results", error: err.message });
  }
});

export default router;
