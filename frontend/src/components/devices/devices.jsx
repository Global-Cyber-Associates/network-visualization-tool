// src/components/Devices.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './devices.css';
import Sidebar from "../navigation/sidenav.jsx";


const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/system");
        setDevices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load devices.");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  if (loading) return <div className="devices-container">Loading devices...</div>;
  if (error) return <div className="devices-container">{error}</div>;
  if (!devices.length) return <div className="devices-container">No devices found.</div>;

  return (
    <div className="device-page">
          <Sidebar />

    <div className="devices-container">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
      <h1 className="devices-title">Connected Devices</h1>
      <div className="device-list">
        {devices.map(device => (
          <div
            key={device._id}
            className="device-card"
            onClick={() => navigate(`/devices/${device._id}`)}
          >
            <div className="device-icon">🖥️</div>
            <div className="device-name">{device.hostname}</div>
            <div className="device-info">
              <p>{device.os_type} {device.os_version}</p>
              <p>Machine ID: {device.machine_id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Devices;
