import mongoose from "mongoose";

const InstalledAppsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  applications: [
    {
      name: { type: String, required: true },
      version: { type: String },
      publisher: { type: String }
    }
  ],
}, { timestamps: true });

export default mongoose.model("InstalledApp", InstalledAppsSchema);
