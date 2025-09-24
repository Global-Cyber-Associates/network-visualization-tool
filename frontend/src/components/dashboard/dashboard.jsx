import React, { useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import devicesData from "../devices/devices.js"; // Import your devices/sampleData
import "./dashboard.css";

function Dashboard() {
  const [active, setActive] = useState(1);

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "working": return "#4CAF50";
      case "offline": return "#F44336";
      case "sleep": return "#FF9800";
      case "online": return "#4CAF50";
      default: return "#607D8B";
    }
  };

  const renderCards = (items, type) => (
    <div className="grid-container">
      {items.map((item) => (
        <div key={item.id} className="card">
          <div
            className="card-header"
          >
            {item.icon} {item.name || item.title || item.type}
          </div>
          <div className="card-body">
            {type === "visualizer" && (
              <>
                <p><strong>IP:</strong> {item.ip}</p>
                <p><strong>Status:</strong> <span style={{ color: statusColor(item.status) }}>{item.status}</span></p>
                <p><strong>Vulnerable:</strong> {item.vulnerable ? "Yes" : "No"}</p>
              </>
            )}
            {type === "devices" && (
              <>
                <p><strong>Type:</strong> {item.type}</p>
                <p><strong>IP:</strong> {item.ip}</p>
                <p><strong>Status:</strong> <span style={{ color: statusColor(item.status) }}>{item.status}</span></p>
                <p><strong>Dept:</strong> {item.department}</p>
                {item.remoteActions?.length > 0 && (
                  <div className="actions">
                    {item.remoteActions.map((action, idx) => (
                      <button key={idx} className="action-btn">{action}</button>
                    ))}
                  </div>
                )}
              </>
            )}
            {type === "logs" && (
              <>
                {item.user && <p><strong>User:</strong> {item.user}</p>}
                {item.device && <p><strong>Device:</strong> {item.device}</p>}
                {item.time && <p><strong>Time:</strong> {item.time}</p>}
                <p><strong>Status:</strong> {item.status}</p>
              </>
            )}
            {type === "issues" && (
              <>
                <p><strong>Device:</strong> {item.device}</p>
                <p><strong>Severity:</strong> {item.severity}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (active) {
      case 1: return renderCards(devicesData.visualizer, "visualizer");
      case 2: return renderCards(devicesData.devices, "devices"); // <-- Use imported devices
      case 3: return renderCards(devicesData.logs, "logs");
      case 4: return renderCards(devicesData.issues, "issues");
      case 5: return renderCards(devicesData.upgrade, "logs");
      default: return <div>Select a module</div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar active={active} setActive={setActive} />
      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default Dashboard;
