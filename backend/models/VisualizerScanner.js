import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  mac: { type: String, default: null },
  ips: [{ type: String }],
  vendor: { type: String, default: "Unknown" },
  mobile: { type: Boolean, default: false },
  ping_only: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
});

// Optional: create a compound index on first IP, but not unique
deviceSchema.index({ "ips.0": 1 });

export default mongoose.model("VisualizerScanner", deviceSchema);
