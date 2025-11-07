import Agent from "../models/Agent.js";

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select("-__v").sort({ lastSeen: -1 });
    res.status(200).json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch agents" });
  }
};
