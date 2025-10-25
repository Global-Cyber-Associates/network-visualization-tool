import express from "express";
import { exec } from "child_process";
import path from "path";
const router = express.Router();

router.post("/run-visualizer", (req, res) => {
  // Absolute path to the visualizer script
  const scriptPath = path.resolve("./visualizer-script/visualizer.js");
  console.log("[*] Triggering visualizer script...", scriptPath);

  exec(`node "${scriptPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Visualizer error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    console.log(stdout);
    res.json({ success: true, message: "Visualizer script ran successfully" });
  });
});

export default router;
