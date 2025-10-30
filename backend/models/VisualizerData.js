import mongoose from "mongoose";

const visualizerDataSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  mac: { type: String, required: true },
  vendor: { type: String },
  hostname: { type: String, default: "Unknown" }, // ✅ new field for hostname
  noAgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Optional: add an index for faster IP lookups (useful when merging)
visualizerDataSchema.index({ ip: 1 });

const VisualizerData = mongoose.model("VisualizerData", visualizerDataSchema);

export default VisualizerData;
