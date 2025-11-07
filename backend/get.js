// get.js
import Agent from "./models/Agent.js";
import SystemInfo from "./models/SystemInfo.js";
import InstalledApps from "./models/InstalledApps.js";
import USBDevice from "./models/UsbDevices.js";
import PortScanData from "./models/PortScan.js";
import TaskInfo from "./models/TaskInfo.js";

export async function fetchData({ type, agentId }) {
  try {
    let Model;

    switch (type) {
      case "system_info":
        Model = SystemInfo;
        break;
      case "installed_apps":
        Model = InstalledApps;
        break;
      case "usb_devices":
        Model = USBDevice;
        break;
      case "port_scan":
        Model = PortScanData;
        break;
      case "task_info":
        Model = TaskInfo;
        break;
      case "agents":
        return await Agent.find({});
      default:
        return [];
    }

    // Fetch based on agentId or all
    let result;
    if (agentId) {
      const doc = await Model.findOne({ agentId }).sort({ timestamp: -1 });
      result = doc ? [doc] : [];
    } else {
      result = await Model.find({});
    }

    return result;
  } catch (err) {
    console.error(`❌ Failed to fetch data [${type}] for agent ${agentId}:`, err);
    return [];
  }
}
