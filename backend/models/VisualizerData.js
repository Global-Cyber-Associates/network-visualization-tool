import mongoose from "mongoose";

const visualizerDataSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  ip: { type: String, required: true },
  mac: { type: String, required: true },
  vendor: String,
  hostname: { type: String, default: "Unknown" },
  noAgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

visualizerDataSchema.index({ ip: 1 });

const VisualizerData = mongoose.model("VisualizerData", visualizerDataSchema);

export default VisualizerData;