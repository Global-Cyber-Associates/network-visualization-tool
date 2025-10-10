// src/components/Logs.jsx
import React from "react";
import './logs.css'
import systemLogs from "./logs.js";
import Sidebar from "../navigation/sidenav.jsx";

const Logs = () => {
  return (

    <div className="logs-page">
      <Sidebar />
    <div className="logs-container">
      <h1 className="logs-title">System Logs</h1>
      
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
          {systemLogs.map((log) => (
            <tr key={log.time + log.user}>
              <td>{new Date(log.time).toLocaleString()}</td>
              <td>
                {log.type}
              </td>
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
