import mongoose from "mongoose";

const UsbDeviceSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    model: { type: String },
    pnpid: { type: String, unique: true, required: true },
    drive: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("UsbDevice", UsbDeviceSchema);
