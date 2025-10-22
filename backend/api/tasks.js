import express from "express";
import TaskManagerData from "../models/tasks.js";

const router = express.Router();

// POST /api/tasks
router.post("/tasks", async (req, res) => {
  try {
    const { deviceId, applications, background_processes } = req.body;
    if (!deviceId || !applications || !background_processes) {
      return res.status(400).json({ success: false, error: "Invalid request body" });
    }

    const newTask = new TaskManagerData({
      device: deviceId,
      applications,
      background_processes,
    });

    const savedTask = await newTask.save();
    res.status(201).json({ success: true, data: savedTask });
  } catch (err) {
    console.error("Error saving task data:", err);
    res.status(500).json({ success: false, error: "Failed to save task data" });
  }
});

// GET /api/tasks/:deviceId
router.get("/tasks/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const tasks = await TaskManagerData.find({ device: deviceId }).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ success: false, error: "Failed to fetch tasks" });
  }
});

export default router;
