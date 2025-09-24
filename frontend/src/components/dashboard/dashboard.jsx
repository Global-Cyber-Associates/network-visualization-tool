// src/components/Dashboard.jsx
import React, { useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import "./dashboard.css";

function Dashboard() {
  const [active, setActive] = useState(1);

  const renderContent = () => {
    switch (active) {
      case 1:
        return (
          <div className="module-card">
            <h2>Authentication</h2>
            <p>Login using organization email. Single Sign-On and security enforced.</p>
          </div>
        );
      case 2:
        return (
          <div className="module-card">
            <h2>Role Based Access</h2>
            <p>Assign roles to users and restrict access to features accordingly.</p>
          </div>
        );
      case 3:
        return (
          <div className="module-card">
            <h2>Devices</h2>
            <ul>
              <li>Detect all devices</li>
              <li>Classify device types</li>
              <li>Detect new devices</li>
              <li>Realtime status: Online / Offline</li>
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="module-card">
            <h2>Ports & Vulnerabilities</h2>
            <ul>
              <li>List open ports and map to devices</li>
              <li>Detect vulnerabilities and list CVEs</li>
            </ul>
          </div>
        );
      case 5:
        return (
          <div className="module-card">
            <h2>Logs & Activity</h2>
            <ul>
              <li>Realtime logs analyzer</li>
              <li>Malicious activity detection</li>
            </ul>
          </div>
        );
      case 6:
        return (
          <div className="module-card">
            <h2>Endpoint Management</h2>
            <ul>
              <li>Manage endpoints</li>
              <li>Isolate computers</li>
              <li>Kill system processes (task manager)</li>
            </ul>
          </div>
        );
      case 7:
        return (
          <div className="module-card">
            <h2>Network Topology</h2>
            <ul>
              <li>Visualize network topology</li>
              <li>Render device images</li>
              <li>Change color when suspicious</li>
              <li>Draggable layout to reflect office setup</li>
            </ul>
          </div>
        );
      case 8:
        return (
          <div className="module-card">
            <h2>Issues</h2>
            <ul>
              <li>Agents not responding</li>
              <li>No agents installed on new device</li>
            </ul>
          </div>
        );
      default:
        return <div>Select a module</div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar active={active} setActive={setActive} />
      <main className="dashboard-main">{renderContent()}</main>
    </div>
  );
}

export default Dashboard;
