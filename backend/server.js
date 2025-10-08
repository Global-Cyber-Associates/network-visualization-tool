import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./db.js";

// Import routes
import authRoutes from "./api/auth.js";
import protectedRoutes from "./api/protected.js";
import portsRoutes from "./api/ports.js";
import systemRoutes from "./api/system.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api", portsRoutes);
app.use("/api", systemRoutes);

app.listen(5000, () => console.log("✅ Server running at http://localhost:5000"));
