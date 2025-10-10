import React from "react";
import "./dashboard.css";
import sampleData from "../../devices.js";
import Sidebar from "../navigation/sidenav.jsx";

const Dashboard = () => {
  const activeDevices = sampleData.devices.filter((d) => d.status === "Working").length;
  const issuesDetected = sampleData.issues.length;
  const logsToday = sampleData.logs.length;
  const featuresBought = sampleData.upgrade.length;

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>

        {/* Top stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h2>Active Devices</h2>
            <p>{activeDevices}</p>
          </div>
          <div className="stat-card">
            <h2>Issues Detected</h2>
            <p>{issuesDetected}</p>
          </div>
          <div className="stat-card">
            <h2>Logs Today</h2>
            <p>{logsToday}</p>
          </div>
          <div className="stat-card">
            <h2>Features Bought</h2>
            <p>{featuresBought}</p>
          </div>
        </div>

        {/* Logs */}
        <div className="table-container">
          <h2>Recent Activity</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.time}</td>
                  <td>{log.icon} {log.type}</td>
                  <td>{log.device}</td>
                  <td
                    className={
                      log.status === "Successful"
                        ? "status-green"
                        : log.status === "Detected"
                        ? "status-red"
                        : "status-blue"
                    }
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Issues */}
        <div className="table-container">
          <h2>Current Issues</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.device}</td>
                  <td>{issue.icon} {issue.title}</td>
                  <td
                    className={
                      issue.severity === "High"
                        ? "status-red"
                        : "status-blue"
                    }
                  >
                    {issue.severity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Features */}
        <div className="table-container">
          <h2>Premium Features</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.upgrade.map((feat) => (
                <tr key={feat.id}>
                  <td>{feat.icon} {feat.type}</td>
                  <td>{feat.device}</td>
                  <td className="status-blue">{feat.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
