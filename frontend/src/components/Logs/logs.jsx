import React, { useEffect, useState } from "react";
import "./logs.css";
import Sidebar from "../navigation/sidenav.jsx";

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const initialLogs = [
      {
        time: new Date().toISOString(),
        type: "Login",
        user: "jayanthkrishna",
        device: "Workstation-01",
        status: "success",
        detail: "User logged in successfully from 10.20.0.12",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        type: "Access",
        user: "jayanthkrishna",
        device: "Admin-Portal",
        status: "info",
        detail: "Admin panel accessed via secure session token",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        type: "USB",
        user: "rakesh",
        device: "Laptop-02",
        status: "info",
        detail: "USB mass storage device plugged in (Kingston_32GB)",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
        type: "USB",
        user: "System",
        device: "Laptop-02",
        status: "success",
        detail: "USB device approved by policy ID #USB-ALLOW-07",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        type: "Agent",
        user: "System",
        device: "Workstation-03",
        status: "warning",
        detail: "Endpoint agent not responding for 180s",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        type: "Network",
        user: "System",
        device: "Gateway-Router",
        status: "info",
        detail: "Device connection restored — latency normalized",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        type: "Device",
        user: "System",
        device: "Workstation-04",
        status: "warning",
        detail: "Device disconnected unexpectedly from network 10.20.0.0/16",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        type: "USB",
        user: "ajay",
        device: "Laptop-03",
        status: "critical",
        detail: "Unauthorized USB device blocked by policy ID #USB-BLOCK-09",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        type: "Threat",
        user: "System",
        device: "Endpoint-07",
        status: "critical",
        detail: "Suspicious PowerShell command blocked (encoded payload)",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        type: "Logout",
        user: "admin",
        device: "Gateway-Router",
        status: "success",
        detail: "Administrator session terminated normally",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        type: "Login",
        user: "ajay",
        device: "Laptop-03",
        status: "success",
        detail: "User authenticated via SSO (AzureAD)",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
        type: "Access",
        user: "admin",
        device: "Server-01",
        status: "info",
        detail: "Configuration file modified — audit log recorded",
      },
      {
        time: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
        type: "Agent",
        user: "System",
        device: "Endpoint-05",
        status: "info",
        detail: "Agent version updated to 2.7.14",
      },
    ];

    setLogs(initialLogs);

    const interval = setInterval(() => {
      const types = ["Login", "Logout", "Agent", "USB", "Threat", "Access", "Network"];
      const users = ["jayanthkrishna", "admin", "rakesh", "ajay", "System"];
      const devices = ["Workstation-01", "Laptop-02", "Endpoint-07", "Router", "Server-01", "Firewall"];

      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];

      let status = "info";
      let detail = "";

      switch (type) {
        case "Login":
          status = "success";
          detail = `User ${user} logged in successfully from ${device}`;
          break;
        case "Logout":
          status = "success";
          detail = `User ${user} logged out from ${device}`;
          break;
        case "Agent":
          status = Math.random() > 0.5 ? "warning" : "info";
          detail =
            status === "warning"
              ? `Agent on ${device} not responding for ${Math.floor(Math.random() * 300)}s`
              : `Agent on ${device} restored connection`;
          break;
        case "USB":
          const usbActions = ["plugged in", "blocked", "approved", "removed"];
          const usbAction = usbActions[Math.floor(Math.random() * usbActions.length)];
          status =
            usbAction === "blocked"
              ? "critical"
              : usbAction === "approved"
              ? "success"
              : "info";
          detail = `USB device ${usbAction} on ${device}`;
          break;
        case "Threat":
          const threats = [
            "Suspicious PowerShell process detected",
            "Unauthorized SSH login attempt",
            "Malware signature found in temp directory",
            "Firewall rule modified without approval",
            "Unusual outbound traffic pattern detected",
          ];
          detail = threats[Math.floor(Math.random() * threats.length)];
          status = "critical";
          break;
        case "Access":
          const actions = [
            "Admin panel accessed",
            "Sensitive log viewed",
            "Configuration file edited",
            "Policy updated",
          ];
          detail = `${user} ${actions[Math.floor(Math.random() * actions.length)]}`;
          status = "info";
          break;
        case "Network":
          const networkEvents = [
            "Device disconnected from network",
            "Device reconnected successfully",
            "High latency detected on subnet 10.20.0.0/16",
          ];
          detail = networkEvents[Math.floor(Math.random() * networkEvents.length)];
          status = "warning";
          break;
        default:
          break;
      }

      const newEvent = {
        time: new Date().toISOString(),
        type,
        user,
        device,
        status,
        detail,
      };

      setLogs((prev) => [newEvent, ...prev.slice(0, 100)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="logs-page">
      <Sidebar />
      <div className="logs-container">
        <h1 className="logs-title">System Activity Logs</h1>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>User</th>
              <th>Device</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} className={`log-${log.status}`}>
                <td>{new Date(log.time).toLocaleTimeString()}</td>
                <td>{log.type}</td>
                <td>{log.user}</td>
                <td>{log.device}</td>
                <td className={`status-${log.status}`}>{log.status}</td>
                <td>{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
