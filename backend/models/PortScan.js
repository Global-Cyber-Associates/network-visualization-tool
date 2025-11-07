import mongoose from "mongoose";

const portScanSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  timestamp: { type: String, required: true },
  type: { type: String, default: "port_scan" },
  data: {
    target: String,
    open_ports: [Number],
    scanned_range: String,
  },
});

export default mongoose.model("PortScan", portScanSchema);
