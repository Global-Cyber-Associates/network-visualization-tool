import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { addLog } from "../utils/logger.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ POST /api/login 
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      await addLog("LOGIN_FAIL", "Invalid username", username, { ip: clientIp });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      await addLog("LOGIN_FAIL", "Wrong password", username, { ip: clientIp });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    await addLog("LOGIN_SUCCESS", "User logged in successfully", username, {
      ip: clientIp,
    });

    return res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Login error:", err);
    await addLog("LOGIN_ERROR", "Internal server error during login", username || "unknown", {
      ip: clientIp,
      error: err.message,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
