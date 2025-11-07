// backend/models/Agent.js
import mongoose from "mongoose";

const AgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  socketId: { type: String },
  ip: { type: String },
  lastSeen: { type: Date, default: Date.now },
});

export default mongoose.model("Agent", AgentSchema);
