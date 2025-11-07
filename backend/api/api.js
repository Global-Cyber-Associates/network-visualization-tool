import express from "express";
import { getAgents } from "../controllers/Agent.js";
import { getSystemInfo } from "../controllers/SystemInfo.js";
import { getPortScan } from "../controllers/PortScan.js";
import { getTasks } from "../controllers/TaskManager.js";
import { getInstalledApps } from "../controllers/InstalledApps.js";
import { getUSBDevices } from "../controllers/UsbDevices.js";

const router = express.Router();

router.get("/agents", getAgents);
router.get("/system/:agentId", getSystemInfo);
router.get("/ports/:agentId", getPortScan);
router.get("/tasks/:agentId", getTasks);
router.get("/apps/:agentId", getInstalledApps);
router.get("/usb/:agentId", getUSBDevices);

export default router;
