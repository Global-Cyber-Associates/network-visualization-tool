// backend/api/scanRun.js
import express from "express";
import { spawn } from "child_process";
import ScanResult from "../models/ScanResult.js";
import path from "path";

const router = express.Router();

// POST /api/scan
router.post("/", async (req, res) => {
  console.log("[*] Starting network scan (manual trigger)...");

  // Path to your scanner script (relative to backend root)
  const scannerScript = path.join(process.cwd(), "scanner", "scan_to_json.py");

  // Spawn python process
  const py = spawn("python", [scannerScript, "--auto", "--json"], {
    cwd: process.cwd(),
    shell: false,
    windowsHide: true,
    // you can set env if needed: env: process.env
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  // Safety: timeout in case python hangs (optional)
  const TIMEOUT_MS = 120_000; // 2 minutes
  const timeout = setTimeout(() => {
    timedOut = true;
    py.kill("SIGKILL");
  }, TIMEOUT_MS);

  py.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  py.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
    // still log python stderr for debugging
    console.error("Scanner stderr:", chunk.toString());
  });

  py.on("error", (err) => {
    clearTimeout(timeout);
    console.error("Failed to start scanner process:", err);
    return res.status(500).json({ ok: false, error: err.message });
  });

  py.on("close", async (code) => {
    clearTimeout(timeout);

    if (timedOut) {
      console.error("Scanner timed out.");
      return res.status(500).json({ ok: false, error: "Scanner timed out" });
    }

    if (code !== 0) {
      console.error(`Scanner exited with code ${code}`, stderr || stdout);
      return res.status(500).json({ ok: false, error: stderr || "Scan failed" });
    }

    // Attempt to extract JSON array/object from stdout even if extra logging is present
    const startIdx = stdout.indexOf("{") !== -1 ? stdout.indexOf("{") : stdout.indexOf("[");
    const endIdx = stdout.lastIndexOf("}") !== -1 ? stdout.lastIndexOf("}") : stdout.lastIndexOf("]");
    let jsonText = stdout;
    if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
      jsonText = stdout.slice(startIdx, endIdx + 1);
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Save scan result to MongoDB (if your ScanResult model expects network/devices)
      try {
        const scanDoc = new ScanResult({
          network: parsed.results?.network ?? null,
          devices: parsed.results?.devices ?? parsed.devices ?? [],
          createdAt: new Date(),
        });

        await scanDoc.save();
      } catch (saveErr) {
        // don't fail the response if saving fails — log and continue
        console.error("Failed to save scan result to DB:", saveErr);
      }

      // Return parsed results to frontend
      return res.json({ ok: true, results: parsed.results ?? parsed });
    } catch (err) {
      console.error("Parse error:", err, "raw stdout:", stdout);
      return res.status(500).json({
        ok: false,
        error: "Failed to parse scanner output",
        raw: stdout,
        stderr,
      });
    }
  });
});

export default router;
