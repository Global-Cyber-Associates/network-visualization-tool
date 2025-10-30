import Log from "../models/Log.js";

export const addLog = async (type, message, actor = "system", metadata = {}) => {
  try {
    const log = new Log({
      type,
      message,
      actor,
      metadata,
    });
    await log.save();
    console.log(`📜 [LOGGED] ${type}: ${message}`);
  } catch (err) {
    console.error("❌ Error saving log:", err);
  }
};
