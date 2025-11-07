import mongoose from "mongoose";

const installedAppSchema = new mongoose.Schema({
  name: String,
  version: String,
  publisher: String,
  install_date: String,
  install_location: String,
  uninstall_string: String,
  display_icon: String,
  registry_key: String,
});

const installedAppsSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true, ref: "Agent" },
  timestamp: { type: String, required: true },
  type: { type: String, default: "installed_apps" },
  data: {
    apps: [installedAppSchema],
    count: Number,
  },
});

export default mongoose.model("InstalledApps", installedAppsSchema);
