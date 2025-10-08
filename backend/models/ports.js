import mongoose from "mongoose";

const portSchema = new mongoose.Schema({
  port: { type: Number, required: true },
  protocol: { type: String, required: true },
  state: { type: String, required: true },
  service: { type: String },
  service_version: { type: String },
});

const portScanSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  results: [portSchema],
});

const PortScan = mongoose.model("PortScan", portScanSchema);

export default PortScan;
