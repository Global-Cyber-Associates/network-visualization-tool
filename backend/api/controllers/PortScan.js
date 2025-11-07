import PortScanData from "../models/PortScan.js";

export const getPortScan = async (req, res) => {
  try {
    const { agentId } = req.params;
    const latestScan = await PortScanData.findOne({ agentId })
      .sort({ timestamp: -1 })
      .select("-__v")
      .lean();

    if (!latestScan)
      return res.status(404).json({ success: false, message: "No port scan found" });

    res.status(200).json({ success: true, data: latestScan });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch port scan" });
  }
};
