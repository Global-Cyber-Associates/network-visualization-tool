import mongoose from "mongoose";

const visualizerDataSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  mac: { type: String, required: true },
  vendor: { type: String },
  noAgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const VisualizerData = mongoose.model("VisualizerData", visualizerDataSchema);

export default VisualizerData;  // ✅ make sure default export exists
