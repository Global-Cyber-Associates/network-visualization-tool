import InstalledApps from "../models/InstalledApps.js";

export const getInstalledApps = async (req, res) => {
  try {
    const { agentId } = req.params;
    const apps = await InstalledApps.findOne({ agentId }).select("-__v");
    if (!apps) return res.status(404).json({ success: false, message: "No apps found" });
    res.status(200).json({ success: true, data: apps });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch installed apps" });
  }
};
