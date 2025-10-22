import express from "express";
import { exec } from "child_process";
const router = express.Router();

// Trigger visualizer.js
router.post("/run", (req, res) => {
  exec("node ./backend/test-scripts/visualizer.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ success: false, message: error.message });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
    res.json({ success: true, message: "Visualizer script triggered", output: stdout });
  });
});

export default router;
