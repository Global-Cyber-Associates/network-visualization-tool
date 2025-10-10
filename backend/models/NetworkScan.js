import mongoose from "mongoose";

const PortSchema = new mongoose.Schema({
  port: Number,
  status: String,
}, { _id: false });

const HostSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  ports: [PortSchema],
  scannedAt: { type: Date, default: Date.now }
});

const NetworkScanSchema = new mongoose.Schema({
  network: { type: String, required: true },       // e.g. "192.168.1.0/24"
  hosts: [HostSchema],
  scannedAt: { type: Date, default: Date.now }
});

export default mongoose.model("NetworkScan", NetworkScanSchema);
