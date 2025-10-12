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
    try {
      const res = await fetch("http://localhost:5000/api/scan/run", {
        method: "POST",
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Scan failed");
        setDevices([]);
      } else {
        setDevices(data.results?.devices || []);
      }
    } catch (err) {
      console.error(err);
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
          Scan your network to detect connected devices and identify potential vulnerabilities.
        </p>
        <button onClick={runScan} disabled={loading}>
          {loading ? "Scanning..." : "Run Network Scan"}
        </button>

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
                {d.ips?.length ? (
                  d.ips.map((ip, i) => (
                    <span key={i} className="ip-badge">
                      {ip}
                    </span>
                  ))
                ) : (
                  "-"
                )}
              </td>
              <td>{d.mac || "-"}</td>
              <td className={d.vendor ? "vendor-known" : "vendor-unknown"}>
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
