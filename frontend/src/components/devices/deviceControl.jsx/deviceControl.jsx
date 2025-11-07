// src/components/DeviceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../../../utils/socket.js"; // your socket connection
import './deviceControl.css';

const bytesToGB = (bytes) => (bytes / 1024 ** 3).toFixed(2);

const DeviceDetail = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    // Fetch system_info for this agent
    socket.emit("get_data", { type: "system_info", agentId: id }, (res) => {
      if (res?.error) {
        console.error(res.error);
      } else {
        setDevice(res.data);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="pc-container">Loading device details...</div>;
  if (!device) return <div className="pc-container">No data found for this device.</div>;

  const cpu = device.cpu || {};
  const memory = device.memory || {};
  const disk = device.disk || {};
  const users = device.users || [];
  const collected = device.timestamp || new Date().toISOString();

  return (
    <div className="pc-container">
      <button className="back-btn" onClick={() => navigate("/devices")}>← Back</button>
      <h1 className="pc-title">{device.hostname || id}</h1>

      {/* System Info */}
      <div className="pc-section">
        <h2>🖥️ System</h2>
        <div className="system-info">
          <p><strong>Machine ID:</strong> {device.agent_id}</p>
          <p><strong>OS:</strong> {device.os_type} {device.os_version} (Release {device.os_release})</p>
          <p><strong>CPU:</strong> {cpu.physical_cores} cores / {cpu.logical_cores} threads @ {cpu.cpu_freq_mhz} MHz</p>
          <p><strong>Memory:</strong> {bytesToGB(memory.used_ram)} / {bytesToGB(memory.total_ram)} GB ({memory.ram_percent}%)</p>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill memory-fill" style={{ width: `${memory.ram_percent || 0}%` }}></div>
        </div>
      </div>

      {/* Drives */}
      <div className="pc-section">
        <h2>🗄️ Drives</h2>
        <div className="drives">
          {Object.keys(disk).map(drive => {
            const d = disk[drive];
            return (
              <div key={drive} className="drive-card">
                <div className="drive-name">{drive}</div>
                <div className="drive-size">{bytesToGB(d.used)} / {bytesToGB(d.total)} GB</div>
                <div className="progress-bar">
                  <div className="progress-bar-fill disk-fill" style={{ width: `${d.percent || 0}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users */}
      <div className="pc-section">
        <h2>👤 Users</h2>
        <p>{users.join(", ")}</p>
      </div>

      {/* Collected */}
      <div className="pc-section collected">
        <p><strong>Collected:</strong> {new Date(collected).toLocaleString()}</p>
      </div>

      {/* Action Buttons */}
      <div className="device-actions">
        <button className="action-btn" onClick={() => alert(`Disconnect ${device.hostname}`)}>Disconnect</button>
        <button className="action-btn" onClick={() => navigate(`/tasks/${id}`)}>Task Manager</button>
        <button className="action-btn" onClick={() => alert(`Scan ${device.hostname}`)}>Scan</button>
      </div>
    </div>
  );
};

export default DeviceDetail;
