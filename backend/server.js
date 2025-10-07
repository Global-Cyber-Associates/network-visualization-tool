import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import fs from "fs";
import mongoose from "mongoose";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = "supersecretkey"; // ✅ Move to .env later
const CONFIG_PATH = "./config.json";

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

/* ----------------------- AUTH ROUTES ----------------------- */

// Register route (used after setup)
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: passwordHash });
  await newUser.save();

  res.json({ message: "User registered successfully" });
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

// Protected example route
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    res.json({ message: "You accessed a protected route!", user: decoded });
  });
});

/* ----------------------- SERVER ----------------------- */
app.listen(5000, () => console.log("✅ Server running at http://localhost:5000"));
