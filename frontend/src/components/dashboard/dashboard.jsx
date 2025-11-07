import React, { useEffect, useState } from "react";
import "./dashboard.css";
import Sidebar from "../navigation/sidenav.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const [visualizerData, setVisualizerData] = useState([]);
  const [systemInfo, setSystemInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vizRes, sysRes] = await Promise.all([
          fetch(`${backendUrl}/visualizer-data`),
          fetch(`${backendUrl}/system`),
        ]);

        if (!vizRes.ok || !sysRes.ok) throw new Error("Failed to fetch data");

        const [vizData, sysData] = await Promise.all([
          vizRes.json(),
          sysRes.json(),
        ]);

        // Group visualizer by latest per IP
        const latestVisualizer = Object.values(
          vizData.reduce((acc, d) => {
            if (!acc[d.ip] || new Date(d.createdAt) > new Date(acc[d.ip].createdAt)) {
              acc[d.ip] = d;
            }
            return acc;
          }, {})
        );

        setVisualizerData(latestVisualizer);
        setSystemInfo(sysData);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // auto-refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Extract agent IPs from systeminfo
  const agentIPs = systemInfo.map(
    (sys) => sys.wlan_ip?.[0]?.address || null
  ).filter(Boolean);

  // Find active agent devices (seen in network scan)
  const activeAgents = visualizerData.filter(
    (d) => !d.noAgent && agentIPs.includes(d.ip)
  );

  // Find inactive agent devices (agent exists, but missing from scan)
  const inactiveAgents = systemInfo.filter(
    (sys) => !visualizerData.some((v) => v.ip === sys.wlan_ip?.[0]?.address)
  );

  // Non-agent (unmanaged) devices
  const unmanagedDevices = visualizerData.filter((d) => d.noAgent === true);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Network & Device Overview</h1>

        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="stats-grid">
              <div className="stat-card green">
                <h2>Active Agent Devices</h2>
                <p>{activeAgents.length}</p>
              </div>
              <div className="stat-card red">
                <h2>Inactive Agent Devices</h2>
                <p>{inactiveAgents.length}</p>
              </div>
              <div className="stat-card orange">
                <h2>Unmanaged Devices</h2>
                <p>{unmanagedDevices.length}</p>
              </div>
              <div className="stat-card blue">
                <h2>Logs Today</h2>
                <p>{logsToday}</p>
              </div>
            </div>

            {/* Active Agent Table */}
            <div className="table-container">
              <h2>Active Agent Devices</h2>
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Hostname</th>
                    <th>IP</th>
                    <th>CPU Cores</th>
                    <th>RAM Usage</th>
                    <th>OS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAgents.map((d) => {
                    const sys = systemInfo.find(
                      (s) => s.wlan_ip?.[0]?.address === d.ip
                    );
                    return (
                      <tr key={d.ip}>
                        <td>{sys?.hostname || "-"}</td>
                        <td>{d.ip}</td>
                        <td>{sys?.cpu?.logical_cores || "-"}</td>
                        <td>{sys?.memory?.ram_percent
                          ? sys.memory.ram_percent + "%"
                          : "-"}</td>
                        <td>{sys?.os_type} {sys?.os_release}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inactive Agent Table */}
            <div className="table-container">
              <h2>Inactive Agent Devices</h2>
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Hostname</th>
                    <th>Last Known IP</th>
                    <th>OS</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveAgents.map((sys) => (
                    <tr key={sys._id}>
                      <td>{sys.hostname}</td>
                      <td>{sys.wlan_ip?.[0]?.address || "-"}</td>
                      <td>{sys.os_type} {sys.os_release}</td>
                      <td>{new Date(sys.collected_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Unmanaged Devices Table */}
            <div className="table-container">
              <h2>Unmanaged (No Agent) Devices</h2>
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>IP</th>
                    <th>MAC</th>
                    <th>Detected At</th>
                  </tr>
                </thead>
                <tbody>
                  {unmanagedDevices.map((d) => (
                    <tr key={d._id}>
                      <td>{d.ip}</td>
                      <td>{d.mac}</td>
                      <td>{new Date(d.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
