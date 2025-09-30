import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt"; 
import connectDB from "./db.js";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = "supersecretkey"; // move to .env later

// connect to MongoDB
connectDB();

// Register route (add new users)
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

// Protected route example
app.get("/protected", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    res.json({ message: "You accessed a protected route!", user: decoded });
  });
});

app.listen(5000, () => console.log("✅ Server running at http://localhost:5000"));
