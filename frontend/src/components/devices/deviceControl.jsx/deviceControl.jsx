// src/components/DeviceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import './deviceControl.css';

const bytesToGB = (bytes) => (bytes / 1024 ** 3).toFixed(2);

const DeviceDetail = () => {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/system");
        const d = res.data.find(item => item._id === id);
        setDevice(d);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDevice();
  }, [id]);

  if (!device) return <div className="pc-container">Loading device details...</div>;

  return (
    <div className="pc-container">
      <button className="back-btn" onClick={() => navigate("/devices")}>← Back</button>
      <h1 className="pc-title">{device.hostname}</h1>

      {/* System Info */}
      <div className="pc-section">
        <h2>🖥️ System</h2>
        <div className="system-info">
          <p><strong>Machine ID:</strong> {device.machine_id}</p>
          <p><strong>OS:</strong> {device.os_type} {device.os_version} (Release {device.os_release})</p>
          <p><strong>CPU:</strong> {device.cpu.physical_cores} cores / {device.cpu.logical_cores} threads @ {device.cpu.cpu_freq_mhz} MHz</p>
          <p><strong>Memory:</strong> {bytesToGB(device.memory.used_ram)} / {bytesToGB(device.memory.total_ram)} GB ({device.memory.ram_percent}%)</p>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill memory-fill" style={{ width: `${device.memory.ram_percent}%` }}></div>
        </div>
      </div>

      {/* Drives */}
      <div className="pc-section">
        <h2>🗄️ Drives</h2>
        <div className="drives">
          {Object.keys(device.disk).map(drive => {
            const d = device.disk[drive];
            return (
              <div key={drive} className="drive-card">
                <div className="drive-name">{drive}</div>
                <div className="drive-size">{bytesToGB(d.used)} / {bytesToGB(d.total)} GB</div>
                <div className="progress-bar">
                  <div className="progress-bar-fill disk-fill" style={{ width: `${d.percent}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Users */}
      <div className="pc-section">
        <h2>👤 Users</h2>
        <p>{device.users.join(", ")}</p>
      </div>

      {/* Collected */}
      <div className="pc-section collected">
        <p><strong>Collected:</strong> {new Date(device.collected_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DeviceDetail;
