import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Visualizer from "./components/visualizer/visualizer.jsx";
import Devices from "./components/devices/devices.jsx";
import DeviceDetail from "./components/devices/deviceControl.jsx/deviceControl.jsx";
import Logs from "./components/Logs/logs.jsx";
import Issues from "./components/issues/issues.jsx";
import Features from "./components/Features/features.jsx";
import Login from "./components/login/login.jsx";
import Setup from "./components/setup/Setup.jsx";
import Scan from "./components/scan/scan.jsx";
import TaskManager from "./components/devices/Taskmanager/taskmanager.jsx";
import UsbControl from "./components/usb/usb.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isConfigured, setIsConfigured] = useState(null);

  // ✅ Check config on load
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

  // ✅ Check token on mount to persist login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (isConfigured === null) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Setup flow */}
        {!isConfigured && (
          <>
            <Route path="/setup" element={<Setup />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        )}

        {/* Main app flow */}
        {isConfigured && (
          <>
            {/* Public route: login */}
            <Route
              path="/login"
              element={<Login onLogin={() => setIsAuthenticated(true)} />}
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                isAuthenticated ? (
                  <div className="app-container">
                    <div className="page-content">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/visualizer" element={<Visualizer />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/devices/:id" element={<DeviceDetail />} />
                        <Route path="/tasks/:id" element={<TaskManager />} />
                        <Route path="/logs" element={<Logs />} />
                        <Route path="/issues" element={<Issues />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/scan" element={<Scan />} />
                        <Route path="/usb" element={<UsbControl />} />
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
