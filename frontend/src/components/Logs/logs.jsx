import React, { useEffect, useState } from "react";
import "./logs.css";
import Sidebar from "../navigation/sidenav.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${backendUrl}/logs`);
      const data = await res.json();

      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        console.warn("⚠ Unexpected response:", data);
      }
    } catch (err) {
      console.error("❌ Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(); // initial fetch
    const interval = setInterval(fetchLogs, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="logs-page">Loading logs...</div>;

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
              <th>Actor</th>
              <th>Message</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", opacity: 0.6 }}>
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.type}</td>
                  <td>{log.actor}</td>
                  <td>{log.message}</td>
                  <td>
                    {Object.keys(log.metadata || {}).length > 0
                      ? JSON.stringify(log.metadata)
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
