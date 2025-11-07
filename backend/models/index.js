import Agent from './Agent.js';
import InstalledApps from './InstalledApps.js';
import Log from './Log.js';
import NetworkScan from './NetworkScan.js';
import Ports from './PortScan.js';
import ScanResult from './ScanResult.js';
import SystemInfo from './SystemInfo.js';
import TaskManager from './TaskInfo.js';
import UsbDevices from './UsbDevices.js';
import VisualizerData from './VisualizerData.js';
import mongoose from 'mongoose';

// Agent Model
const AgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  hostname: String,
  ipAddress: String,
  socketId: String,
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
});

// Installed Apps Model
const InstalledAppsSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  applications: [{
    name: String,
    version: String,
    publisher: String,
    installLocation: String,
    installDate: String
  }],
  count: Number,
  collected_at: { type: Date, default: Date.now }
});

// System Info Model
const SystemInfoSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  hostname: String,
  platform: String,
  arch: String,
  cpu: {
    model: String,
    cores: Number,
    speed: Number
  },
  memory: {
    total: Number,
    free: Number,
    used: Number
  },
  disk: [{
    drive: String,
    total: Number,
    free: Number
  }],
  collected_at: { type: Date, default: Date.now }
});

// Task Manager Model
const TaskManagerSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  processes: [{
    pid: Number,
    name: String,
    cpu: Number,
    memory: Number,
    status: String
  }],
  collected_at: { type: Date, default: Date.now }
});

// USB Devices Model
const UsbDevicesSchema = new mongoose.Schema({
  agentId: { type: String, required: true },
  action: { type: String, enum: ['connected', 'removed'] },
  device: {
    vendorId: String,
    productId: String,
    serialNumber: String,
    manufacturer: String,
    product: String
  },
  timestamp: { type: Date, default: Date.now }
});

export const models = {
  Agent: mongoose.model('Agent', AgentSchema),
  InstalledApps: mongoose.model('InstalledApps', InstalledAppsSchema),
  SystemInfo: mongoose.model('SystemInfo', SystemInfoSchema),
  TaskManager: mongoose.model('TaskManager', TaskManagerSchema),
  UsbDevices: mongoose.model('UsbDevices', UsbDevicesSchema)
};

export {
  Agent,
  InstalledApps,
  Log,
  NetworkScan,
  Ports,
  ScanResult, 
  SystemInfo,
  TaskManager,
  UsbDevices,
  VisualizerData
};