import Log from "../models/Log.js";

/**
 * @param {string} type - Type of log (e.g., LOGIN_SUCCESS, SYSTEM_ERROR)
 * @param {string} message - Log message
 * @param {string} actor - Who performed the action (default: "system")
 * @param {object} metadata - Additional context (IP, error, etc.)
 */
export const addLog = async (type, message, actor = "system", metadata = {}) => {
  try {
    // Check if Mongoose is connected before writing
    if (
      !global.mongoose ||
      !global.mongoose.connection ||
      global.mongoose.connection.readyState !== 1
    ) {
      console.warn("⚠️ Logger skipped — MongoDB not connected yet");
      return;
    }

    const log = new Log({
      type,
      message,
      actor,
      metadata,
      timestamp: new Date(),
    });

    await log.save();
    console.log(`📜 [LOGGED] ${type}: ${message}`);
  } catch (err) {
    console.error("❌ Error saving log:", err.message);
  }
};
