import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  actor: { type: String, default: "system" },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model("Log", logSchema);
