import mongoose from "mongoose";
import fs from "fs";

let MONGO_URI = null;

if (fs.existsSync("./config.json")) {
  const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
  if (config.mongoURI) {
    MONGO_URI = config.mongoURI;
  }
}

const connectDB = async () => {
  if (!MONGO_URI) {
    console.log("⚠ No MongoDB URI found. Please run setup first.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
