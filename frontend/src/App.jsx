import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from './components/dashboard/dashboard.jsx';
import Visualizer from "./components/visualizer/Visualizer.jsx";
import Devices from "./components/devices/Devices.jsx";
import Logs from "./components/logs/Logs.jsx";
import Issues from "./components/issues/Issues.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="visualizer" element={<Visualizer />} />
          <Route path="devices" element={<Devices />} />
          <Route path="logs" element={<Logs />} />
          <Route path="issues" element={<Issues />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
