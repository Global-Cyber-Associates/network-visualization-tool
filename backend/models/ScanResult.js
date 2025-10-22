import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  ips: [String],
  mac: String,
  vendor: String,
  mobile: Boolean,
});

const scanResultSchema = new mongoose.Schema({
  network: String,
  devices: [deviceSchema],
  createdAt: { type: Date, default: Date.now },
});

const ScanResult = mongoose.model("ScanResult", scanResultSchema);

export default ScanResult;
