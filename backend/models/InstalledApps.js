import mongoose from "mongoose";

const InstalledAppSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
  },
  applications: [
    {
      name: String,
      version: String,
      publisher: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("InstalledApp", InstalledAppSchema);
