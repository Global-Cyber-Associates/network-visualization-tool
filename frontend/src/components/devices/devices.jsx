import React from "react";
import "./devices.css";

function Group3Devices() {
  const devices = [
    {
      name: "Workstation-01",
      type: "PC",
      ip: "192.168.1.10",
      status: "Online",
      description: "Finance department workstation",
    },
    {
      name: "Laptop-Dev-02",
      type: "Laptop",
      ip: "192.168.1.22",
      status: "Offline",
      description: "Developer laptop, currently offline",
    },
    {
      name: "Server-DB-01",
      type: "Server",
      ip: "192.168.1.5",
      status: "Online",
      description: "Database server hosting internal DB",
    },
    {
      name: "Printer-HR-01",
      type: "Printer",
      ip: "192.168.1.40",
      status: "Online",
      description: "HR department network printer",
    },
  ];

  return (
    <div className="devices-module">
      <h2>Network Devices</h2>
      <table className="devices-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device, index) => (
            <tr key={index}>
              <td>{device.name}</td>
              <td>{device.type}</td>
              <td>{device.ip}</td>
              <td className={device.status === "Online" ? "online" : "offline"}>
                {device.status}
              </td>
              <td>{device.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Group3Devices;
