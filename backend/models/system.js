// models/SystemInfo.js
import mongoose from "mongoose";

const wlanIpSchema = new mongoose.Schema({
  interface_name: String,
  type: String,     // IPv4
  address: String,
  netmask: String,
  broadcast: String,
});

const diskSchema = new mongoose.Schema({
  mountpoint: String,
  fstype: String,
  total: Number,
  used: Number,
  free: Number,
  percent: Number,
});

const cpuSchema = new mongoose.Schema({
  physical_cores: Number,
  logical_cores: Number,
  cpu_freq_mhz: Number,
});

const memorySchema = new mongoose.Schema({
  total_ram: Number,
  available_ram: Number,
  used_ram: Number,
  ram_percent: Number,
});

const systemInfoSchema = new mongoose.Schema({
  hostname: String,
  os_type: String,
  os_version: String,
  os_release: String,
  cpu: cpuSchema,
  memory: memorySchema,
  disk: { type: Map, of: diskSchema },
  users: [String],
  machine_id: String,

  // ✅ Only WLAN (Wi-Fi) IP info
  wlan_ip: [wlanIpSchema],

  collected_at: { type: Date, default: Date.now },
});

export default mongoose.model("SystemInfo", systemInfoSchema);
