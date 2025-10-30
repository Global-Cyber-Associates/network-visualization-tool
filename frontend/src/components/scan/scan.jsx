import React, { useState } from "react";
import "./scan.css";
import Sidebar from "../navigation/sidenav.jsx";

const Scan = () => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");

  const runScan = async () => {
    setLoading(true);
    setError("");
    setDevices([]);

    try {
      console.log("Starting network scan...");
      const res = await fetch("http://localhost:5000/api/scan", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      console.log("Scan response data:", data);

      // Adjust according to your backend JSON format
      const devicesList = data.results?.devices || data.devices || [];

      if (devicesList.length === 0) {
        setError("No devices found.");
        setDevices([]);
      } else {
        setDevices(devicesList);
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to fetch scan results");
      setDevices([]);
    }

    setLoading(false);
  };

  return (
    <div className="scan-page">
      <Sidebar />
      <div className="scan-content">
        <h2>Network Scan</h2>
        <p className="description">
          Scan your network to detect connected devices and identify potential
          vulnerabilities.
        </p>

        <button onClick={runScan} disabled={loading}>
          {loading ? "Scanning..." : "Run Network Scan"}
        </button>

        {/* Wave loader animation */}
        {loading && (
          <ul className="wave-menu">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        )}

        {error && <p className="error">{error}</p>}

        {devices.length > 0 && (
          <div className="scan-output-table">
            <h3>Scan Results</h3>
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
                  {devices.map((d, index) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;