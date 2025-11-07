import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  ips: [String],
  mac: String,
  vendor: String,
  mobile: Boolean,
});

const networkScanSchema = new mongoose.Schema({
  network: String,
  devices: [deviceSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("NetworkScan", networkScanSchema);