import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/navigation/sidenav.jsx";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Visualizer from "./components/visualizer/visualizer.jsx";
import Devices from "./components/devices/devices.jsx";
import Logs from "./components/Logs/logs.jsx";
import Issues from "./components/issues/issues.jsx";
import Features from "./components/Features/features.jsx";
import Login from "./components/login/login.jsx";
import DeviceDetail from "./components/devices/deviceControl.jsx/deviceControl.jsx";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
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
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
