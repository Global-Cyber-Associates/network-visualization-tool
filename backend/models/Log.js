import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  actor: { type: String, default: "system" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

logSchema.index({ createdAt: -1 });

const Log = mongoose.model("Log", logSchema);
export default Log;
