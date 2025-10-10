import React, { useState } from "react";
import "./scan.css";

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
      }); // match backend route
      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Scan failed");
        setDevices([]);
      } else {
        // ✅ Access devices array inside results
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
    <div className="scan-container">
      <h2>Network Scan</h2>
      <button onClick={runScan} disabled={loading}>
        {loading ? "Scanning..." : "Run Network Scan"}
      </button>

      {error && <p className="error">{error}</p>}

      {devices.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>IP(s)</th>
              <th>MAC</th>
              <th>Vendor</th>
              <th>Mobile</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d, idx) => (
              <tr key={idx}>
                <td>{d.ips?.join(", ") || "-"}</td>
                <td>{d.mac || "-"}</td>
                <td>{d.vendor || "Unknown"}</td>
                <td>{d.mobile ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Scan;
