import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/navigation/sidenav.jsx";
import Dashboard from "./components/dashboard/dashboard.jsx";
import Visualizer from "./components/visualizer/visualizer.jsx";
import Devices from "./components/devices/devices.jsx";
import Logs from "./components/logs/Logs.jsx";
import Issues from "./components/issues/Issues.jsx";
import Features from "./components/Features/features.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar stays fixed */}
        <Sidebar />

        {/* Page content changes */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/features" element={<Features />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
