import SystemInfo from "../models/SystemInfo.js";

export const getSystemInfo = async (req, res) => {
  try {
    const { agentId } = req.params;
    const systemInfo = await SystemInfo.findOne({ agentId })
      .sort({ timestamp: -1 })
      .select("-__v")
      .lean();

    if (!systemInfo)
      return res.status(404).json({ success: false, message: "No system info found" });

    res.status(200).json({ success: true, data: systemInfo });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch system info" });
  }
};
