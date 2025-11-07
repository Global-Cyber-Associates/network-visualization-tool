import mongoose from "mongoose";

const AgentLogSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  eventType: { type: String },
  payload: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("AgentLog", AgentLogSchema);
