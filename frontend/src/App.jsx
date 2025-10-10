import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/navigation/sidenav.jsx";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Visualizer from "./components/visualizer/visualizer.jsx";
import Devices from "./components/devices/devices.jsx";
import DeviceDetail from "./components/devices/deviceControl.jsx/deviceControl.jsx";
import Logs from "./components/Logs/logs.jsx";
import Issues from "./components/issues/issues.jsx";
import Features from "./components/Features/features.jsx";
import Login from "./components/login/login.jsx";
import Setup from "./components/setup/Setup.jsx"; // ✅ new setup page
import Scan from "./components/scan/scan.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConfigured, setIsConfigured] = useState(null); // null = loading

  // ✅ Check if backend is configured (config.json exists)
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/check-config");
        const data = await res.json();
        setIsConfigured(data.configured);
      } catch (err) {
        console.error("Config check failed:", err);
        setIsConfigured(false);
      }
    };
    checkConfig();
  }, []);

  if (isConfigured === null) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Setup page if not configured */}
        {!isConfigured && (
          <>
            <Route path="/setup" element={<Setup />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        )}

        {/* ✅ If configured, normal app flow */}
        {isConfigured && (
          <>
            {/* Public route: login */}
            <Route
              path="/login"
              element={<Login onLogin={() => setIsAuthenticated(true)} />}
            />

            {/* Protected area with sidebar */}
            <Route
              path="/*"
              element={
                isAuthenticated ? (
                  <div className="app-container">
                    <Sidebar />
                    <div className="page-content">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/visualizer" element={<Visualizer />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/devices/:id" element={<DeviceDetail />} />
                        <Route path="/logs" element={<Logs />} />
                        <Route path="/issues" element={<Issues />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                        <Route path="/scan" element={<Scan />} />
                      </Routes>
                    </div>
                  </div>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
