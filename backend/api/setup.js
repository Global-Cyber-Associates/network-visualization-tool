
/* ----------------------- SETUP ROUTES ----------------------- */



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
