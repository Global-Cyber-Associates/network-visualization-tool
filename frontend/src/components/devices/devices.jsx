// src/components/Devices.jsx
import React from "react";
import sampleData from "../../devices.js";
import "./devices.css"; // external CSS file

const Devices = () => {
  const devices = sampleData.devices; // only take devices array

  // Group devices by type
  const groupedDevices = devices.reduce((acc, device) => {
    if (!acc[device.type]) acc[device.type] = [];
    acc[device.type].push(device);
    return acc;
  }, {});

  return (
    <div className="devices-container">
      <h1 className="devices-title">Devices</h1>

      {Object.entries(groupedDevices).map(([type, devices]) => (
        <div key={type} className="device-category-section">
          <h2 className="device-category-title">{type}</h2>
          <div className="device-list">
            {devices.map((device) => (
              <div key={device.id} className="device-card">
                <div className="device-icon">{device.icon}</div>
                <strong className="device-name">{device.name}</strong>
                <span className="device-info">{device.ip}</span>
                <span className="device-info">Status: {device.status}</span>
                <span className="device-info">Dept: {device.department}</span>
                <div className="device-actions">
                  {device.remoteActions.map((action) => (
                    <button
                      key={action}
                      className="action-btn"
                      onClick={() => alert(`${action} on ${device.name}`)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Devices;
