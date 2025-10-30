// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Import routes
import authRoutes from "./api/auth.js";
import protectedRoutes from "./api/protected.js";
import portsRoutes from "./api/ports.js";
import systemRoutes from "./api/system.js";
import scanRunRouter from "./api/scanRun.js";
import usbRoutes from "./api/usb.js";
import tasksRoutes from "./api/tasks.js";
import visualizerDataRoute from "./api/visualizerData.js";
import installedAppsRoutes from "./api/installedAppsRoutes.js";
// ✅ Import continuous scanner (handles scan → visualizer → repeat)
import "./visualizer-script/visualizerScanner.js";



// Import models
import User from "./models/User.js";
import connectDB from "./db.js";

const app = express();
app.use(cors());
// -----------------------------
// Request / Response Logger
// -----------------------------
app.use((req, res, next) => {
  const start = Date.now();

  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);

  // Capture response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms`);
  });

  next();
});

app.use(bodyParser.json());

const JWT_SECRET = "supersecretkey"; // move to .env later
const CONFIG_PATH = "./config.json";

/* ----------------------- DATABASE CONNECTION ----------------------- */

// Connect using default URI from db.js
connectDB();


const connectToDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected dynamically");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    if (config.mongoURI) await connectToDB(config.mongoURI);
  } catch (err) {
    console.error("Error reading config file:", err.message);
  }
}

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api", portsRoutes);
app.use("/api", systemRoutes);
app.use("/api/scan", scanRunRouter);
app.use("/api", tasksRoutes);
app.use("/api/usb", usbRoutes);
app.use("/api/visualizer-data", visualizerDataRoute);
app.use("/api/installed-apps", installedAppsRoutes);

/* ----------------------- CONFIGURATION ENDPOINTS ----------------------- */

// Check if app is configured
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

// First-time setup: save Mongo URI + admin user
app.post("/api/setup", async (req, res) => {
  const { mongoURI, adminUsername, adminPassword } = req.body;
  if (!mongoURI || !adminUsername || !adminPassword)
    return res.status(400).json({ message: "All fields are required" });

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ mongoURI }, null, 2), "utf-8");
    await connectToDB(mongoURI);

    const existing = await User.findOne({ username: adminUsername });
    if (!existing) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({ username: adminUsername, password: passwordHash });
      await newAdmin.save();
      console.log("✅ Admin user created:", adminUsername);
    }

    res.json({ message: "Setup complete" });
  } catch (err) {
    console.error("Setup error:", err.message);
    res.status(500).json({ message: "Setup failed" });
  }
});

/* ----------------------- LOGIN ----------------------- */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

/* ----------------------- SERVER START ----------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log("🧠 Continuous scanner + visualizer loop active");
});