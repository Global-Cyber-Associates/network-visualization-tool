// src/components/DeviceList.jsx
import React, { useState } from "react";
import "./DeviceList.css"; // External CSS for Devices

function DeviceList({ devices }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusColor = (status) => {
    switch(status?.toLowerCase()) {
      case "working": return "#4CAF50";
      case "offline": return "#F44336";
      case "sleep": return "#FF9800";
      case "online": return "#4CAF50";
      default: return "#607D8B";
    }
  };

  return (
    <div className="device-list">
      {devices.map((device) => (
        <div 
          key={device.id} 
          className={`device-card ${expandedId === device.id ? "expanded" : ""}`}
          onClick={() => toggleExpand(device.id)}
        >
          <div className="device-header">
            <h3>{device.name}</h3>
            <span className="status" style={{ backgroundColor: statusColor(device.status) }}>
              {device.status}
            </span>
          </div>
          {expandedId === device.id && (
            <div className="device-body">
              <p><strong>Type:</strong> {device.type}</p>
              <p><strong>IP:</strong> {device.ip}</p>
              <p><strong>Department:</strong> {device.department}</p>
              {device.remoteActions?.length > 0 && (
                <div className="actions">
                  {device.remoteActions.map((action, idx) => (
                    <button key={idx} className="action-btn">{action}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DeviceList;
