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