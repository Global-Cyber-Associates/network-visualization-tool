import USBDevice from "../models/UsbDevices.js";

export const getUSBDevices = async (req, res) => {
  try {
    const { agentId } = req.params;
    const devices = await USBDevice.find({ agentId }).select("-__v").sort({ timestamp: -1 });
    if (!devices.length) return res.status(404).json({ success: false, message: "No USB devices found" });
    res.status(200).json({ success: true, count: devices.length, data: devices });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch USB devices" });
  }
};
