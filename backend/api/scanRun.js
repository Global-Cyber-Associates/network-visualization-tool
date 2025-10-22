// backend/api/scanRun.js
import express from "express";
import { spawn } from "child_process";
import ScanResult from "../models/ScanResult.js";

const router = express.Router();

// POST /api/scan
router.post("/", async (req, res) => {
  console.log("[*] Starting network scan...");

  // Correct path to Python scanner relative to backend root
  const py = spawn("python", ["./scanner/scan_to_json.py", "--auto", "--json"], {
    cwd: process.cwd(), // backend folder
  });

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  py.stderr.on("data", (data) => {
    stderr += data.toString();
    console.error("Scanner stderr:", data.toString());
  });

  py.on("close", async (code) => {
    if (code !== 0) {
      return res.status(500).json({ ok: false, error: stderr || "Scan failed" });
    }

    try {
      const parsed = JSON.parse(stdout);

      // Save scan result to MongoDB
      const scanDoc = new ScanResult({
        network: parsed.results.network,
        devices: parsed.results.devices,
        createdAt: new Date(),
      });

      await scanDoc.save();

      // Return results to frontend
      return res.json({ ok: true, results: parsed.results });
    } catch (err) {
      console.error("Parse error:", err);
      return res.status(500).json({
        ok: false,
        error: "Failed to parse scanner output",
        raw: stdout,
      });
    }
  });

  py.on("error", (err) => {
    console.error("Failed to start scanner process:", err);
    return res.status(500).json({ ok: false, error: err.message });
  });
});

export default router;
