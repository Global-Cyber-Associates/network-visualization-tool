import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";
import jwt from "jsonwebtoken";

// Import routes
import authRoutes from "./api/auth.js";
import protectedRoutes from "./api/protected.js";
import portsRoutes from "./api/ports.js";
import systemRoutes from "./api/system.js";
import networkScanRoutes from "./api/networkScan.js";  // 👈 NEW

import bcrypt from "bcrypt";
import fs from "fs";
import mongoose from "mongoose";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = "supersecretkey"; // ✅ Move to .env later
const CONFIG_PATH = "./config.json";
// Connect to MongoDB
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api", portsRoutes);
app.use("/api", systemRoutes);
app.use("/api/network-scan", networkScanRoutes);

// ✅ Function to connect to MongoDB dynamically
const connectToDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

// ✅ Check config file on startup
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    if (config.mongoURI) {
      connectToDB(config.mongoURI);
    }
  } catch (err) {
    console.error("Error reading config file:", err.message);
  }
}

/* ----------------------- SETUP ROUTES ----------------------- */

// ✅ Check if app is configured
app.get("/api/check-config", (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      return res.json({ configured: !!config.mongoURI });
    } else {
      return res.json({ configured: false });
    }
  } catch (error) {
    console.error("Config check error:", error.message);
    return res.json({ configured: false });
  }
});

// ✅ First-time setup route: saves Mongo URI + admin user
app.post("/api/setup", async (req, res) => {
  const { mongoURI, adminUsername, adminPassword } = req.body;

  if (!mongoURI || !adminUsername || !adminPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Save config.json
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify({ mongoURI }, null, 2),
      "utf-8"
    );

    // 2. Connect to DB
    await connectToDB(mongoURI);

    // 3. Check if admin exists, else create
    const existing = await User.findOne({ username: adminUsername });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({
        username: adminUsername,
        password: passwordHash,
      });
      await newAdmin.save();
      console.log("✅ Admin user created:", adminUsername);
    }

    res.json({ message: "Setup complete" });
  } catch (err) {
    console.error("Setup error:", err.message);
    res.status(500).json({ message: "Setup failed" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

/* ----------------------- SERVER ----------------------- */
app.listen(5000, () => console.log("✅ Server running at http://localhost:5000"));
