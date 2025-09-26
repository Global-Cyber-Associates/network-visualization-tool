import React from "react";
import "./dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Top stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Active Devices</h2>
          <p>24</p>
        </div>
        <div className="stat-card">
          <h2>Issues Detected</h2>
          <p>5</p>
        </div>
        <div className="stat-card">
          <h2>Logs Today</h2>
          <p>1,248</p>
        </div>
        <div className="stat-card">
          <h2>Features Bought</h2>
          <p>3</p>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <h2>Recent Activity</h2>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-09-25</td>
              <td>Vulnerability Scan Started</td>
              <td className="status-green">Completed</td>
            </tr>
            <tr>
              <td>2025-09-24</td>
              <td>USB Device Blocked</td>
              <td className="status-red">Blocked</td>
            </tr>
            <tr>
              <td>2025-09-24</td>
              <td>System Update Installed</td>
              <td className="status-green">Completed</td>
            </tr>
            <tr>
              <td>2025-09-23</td>
              <td>New Device Added</td>
              <td className="status-blue">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
