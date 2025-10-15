import mongoose from "mongoose";

const processSchema = new mongoose.Schema({
  pid: { type: Number, required: true },
  name: { type: String, required: true },
  cpu: { type: Number, required: true },
  memory: { type: Number, required: true },
  title: { type: String },
}, { _id: false });

const taskManagerSchema = new mongoose.Schema({
  device: { type: String, required: true }, // use string for hostname/machine_id
  applications: { type: [processSchema], default: [] },
  background_processes: { type: [processSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("TaskManagerData", taskManagerSchema);
