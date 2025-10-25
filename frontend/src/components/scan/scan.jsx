import React, { useState, useEffect, useRef } from "react";
import "./scan.css";
import Sidebar from "../navigation/sidenav.jsx";

const Scan = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  const [autoScan, setAutoScan] = useState(true); // for live scanning toggle
  const intervalRef = useRef(null);

  // 🔁 Function to call backend scan
  const runScan = async () => {
    if (!autoScan) return; // prevent background scan when stopped
    setLoading(true);
    setError("");

    try {
      console.log("Running network scan...");
      const res = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const devicesList = data.results?.devices || data.devices || [];

      // Sort devices by IP for consistency
      const sorted = devicesList.sort((a, b) =>
        (a.ips?.[0] || "").localeCompare(b.ips?.[0] || "")
      );

      setDevices(sorted);
      if (devicesList.length === 0) setError("No devices found.");
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to fetch scan results");
    }

    setLoading(false);
  };

  // ⚙️ Start automatic scanning
  useEffect(() => {
    if (autoScan) {
      runScan(); // run immediately once
      intervalRef.current = setInterval(runScan, 15000); // every 15s
    } else {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => clearInterval(intervalRef.current);
  }, [autoScan]);

  const toggleScan = () => {
    setAutoScan((prev) => !prev);
  };

  return (
    <div className="scan-page">
      <Sidebar />
      <div className="scan-content">
        <h2>Live Network Scanner</h2>
        <p className="description">
          Continuously monitors your local network and displays connected
          devices in real-time.
        </p>

        <div className="scan-controls">
          <button onClick={toggleScan} className="toggle-btn">
            {autoScan ? "Stop Live Scan" : "Start Live Scan"}
          </button>
          {loading && <span className="live-status">🔄 Scanning...</span>}
          {!loading && autoScan && (
            <span className="live-status green">✔ Live Monitoring</span>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="scan-output-table">
          <h3>Active Devices</h3>
          <div className="table-wrapper">
            <table className="styled-scan-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>MAC</th>
                  <th>Vendor</th>
                  <th>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {devices.length > 0 ? (
                  devices.map((d, index) => (
                    <tr key={index}>
                      <td>
                        {d.ips?.length
                          ? d.ips.map((ip, i) => (
                              <span key={i} className="ip-badge">
                                {ip}
                              </span>
                            ))
                          : "-"}
                      </td>
                      <td>{d.mac || "-"}</td>
                      <td
                        className={d.vendor ? "vendor-known" : "vendor-unknown"}
                      >
                        {d.vendor || "Unknown"}
                      </td>
                      <td>
                        <span
                          className={`mobile-tag ${d.mobile ? "yes" : "no"}`}
                        >
                          {d.mobile ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      {loading
                        ? "Scanning network..."
                        : "No active devices detected."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
