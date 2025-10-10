import express from "express";
import { spawn } from "child_process";
const router = express.Router();

router.post("/run", (req, res) => {
  const py = spawn("python", ["../agent/scan_to_json.py", "--auto", "--json"], { cwd: process.cwd() });

  let stdout = "";
  let stderr = "";

  py.stdout.on("data", (data) => (stdout += data.toString()));
  py.stderr.on("data", (data) => (stderr += data.toString()));

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ ok: false, error: stderr || "Python scan failed" });
    }
    try {
      const parsed = JSON.parse(stdout);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ ok: false, error: "Failed to parse scanner output", raw: stdout, stderr });
    }
  });
});

export default router;
