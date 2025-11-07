import mongoose from "mongoose";

const usbDeviceSchema = new mongoose.Schema({
  vendor_id: String,
  product_id: String,
  description: String,
  serial_number: String,
});

const usbDevicesSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  timestamp: { type: String, required: true },
  type: { type: String, default: "usb_devices" },
  data: {
    connected_devices: [usbDeviceSchema],
  },
});

export default mongoose.model("USBDevices", usbDevicesSchema);
