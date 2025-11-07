// src/components/Devices.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../navigation/sidenav.jsx";
import socket from "../../utils/socket.js"; // your socket connection
import './devices.css';

const Devices = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Request agents from socket
    socket.emit("get_data", { type: "agents" }, (response) => {
      if (response?.error) {
        setError(response.error);
      } else {
        // Ensure it is always an array
        setAgents(Array.isArray(response) ? response : []);
      }
      setLoading(false);
    });

    // Listen for real-time agent updates
    socket.on("agent_update", (updatedAgent) => {
      setAgents((prev) => {
        const idx = prev.findIndex(a => a.agentId === updatedAgent.agentId);
        if (idx >= 0) {
          prev[idx] = updatedAgent;
          return [...prev];
        } else {
          return [...prev, updatedAgent];
        }
      });
    });

    return () => socket.off("agent_update");
  }, []);

  if (loading) return <div className="devices-container">Loading agents...</div>;
  if (error) return <div className="devices-container">{error}</div>;
  if (!agents.length) return <div className="devices-container">No agents connected.</div>;

  return (
    <div className="device-page">
      <Sidebar />
      <div className="devices-container">
        <h1 className="devices-title">Connected Agents ({agents.length})</h1>

        <div className="device-list">
          {agents.map(agent => (
            <div
              key={agent.agentId}
              className="device-card"
              onClick={() => navigate(`/devices/${agent.agentId}`)}
              style={{ cursor: "pointer" }}
            >
              {/* Left: Icon and basic info */}
              <div className="device-left">
                <div className="device-icon">🖥️</div>
                <div className="device-info-wrapper">
                  <div className="device-name">Agent ID: {agent.agentId}</div>
                  <div className="device-info">
                    <p>IP: {agent.ip || "unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="device-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Disconnect ${agent.agentId}`);
                  }}
                >
                  Disconnect
                </button>

                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tasks/${agent.agentId}`);
                  }}
                >
                  Task Manager
                </button>

                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Scan ${agent.agentId}`);
                  }}
                >
                  Scan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Devices;
