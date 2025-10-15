import React from "react";
import "./dashboard.css";
import sampleData from "../../devices.js";
import Sidebar from "../navigation/sidenav.jsx";

const Dashboard = () => {
  const activeDevices = sampleData.devices.filter((d) => d.status === "Working").length;
  const inactiveDevices = sampleData.devices.filter((d) => d.status !== "Working").length;
  const criticalIssues = sampleData.issues.filter((i) => i.severity === "High").length;
  const logsToday = sampleData.logs.length;

  // Show only critical/recent logs for management overview
  const recentCriticalLogs = sampleData.logs
    .filter((l) => l.status === "Detected" || l.status === "Failed")
    .slice(0, 5);

  // Current issues sorted by severity
  const currentIssues = sampleData.issues.sort((a, b) => {
    const severityRank = { High: 3, Medium: 2, Low: 1 };
    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">Network & Device Overview</h1>

        {/* Top KPIs */}
        <div className="stats-grid">
          <div className="stat-card green">
            <h2>Active Devices</h2>
            <p>{activeDevices}</p>
          </div>
          <div className="stat-card red">
            <h2>Inactive Devices</h2>
            <p>{inactiveDevices}</p>
          </div>
          <div className="stat-card orange">
            <h2>Critical Issues</h2>
            <p>{criticalIssues}</p>
          </div>
          <div className="stat-card blue">
            <h2>Logs Today</h2>
            <p>{logsToday}</p>
          </div>
        </div>

        {/* Recent Critical Logs */}
        <div className="table-container">
          <h2>Recent Critical Logs</h2>
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
              {recentCriticalLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.time}</td>
                  <td>{log.icon} {log.type}</td>
                  <td>{log.device}</td>
                  <td className={`status-${log.status === "Detected" ? "red" : "blue"}`}>
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Current Issues */}
        <div className="table-container">
          <h2>Current Device Issues</h2>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Issue</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {currentIssues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.device}</td>
                  <td>{issue.icon} {issue.title}</td>
                  <td className={`status-${issue.severity === "High" ? "red" : "blue"}`}>
                    {issue.severity}
                  </td>
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
