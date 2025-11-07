import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
  pid: Number,
  name: String,
  title: String,
  cpu_percent: Number,
  memory_percent: Number,
});

const processSchema = new mongoose.Schema({
  pid: Number,
  name: String,
  cpu_percent: Number,
  memory_percent: Number,
});

const taskInfoSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  timestamp: { type: String, required: true },
  type: { type: String, default: "task_info" },
  data: {
    applications: [appSchema],
    background_processes: [processSchema],
  },
});

export default mongoose.model("TaskInfo", taskInfoSchema);
