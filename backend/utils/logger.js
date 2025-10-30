// backend/utils/logger.js
import Log from "../models/Log.js";

/**
 * Adds a log to MongoDB
 */
export const addLog = async (type, message, actor = "system", metadata = {}) => {
  try {
    if (!Log.db.readyState) {
      console.warn("⚠️ Logger skipped — MongoDB not connected yet");
      return;
    }

    const log = new Log({
      type,
      message,
      actor,
      metadata,
    });

    await log.save();
    console.log(`📘 [LOGGED] ${type}: ${message}`);
  } catch (err) {
    console.error("❌ Logger error:", err.message);
  }
};
