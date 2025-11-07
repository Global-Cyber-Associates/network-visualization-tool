import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../../utils/socket";
import "./taskmanager.css";

const TaskManager = () => {
  const agentId = "agent_001"; // fixed agentId for now
  const [tasks, setTasks] = useState({ applications: [], background_processes: [] });
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Emit 'get_data' with a callback
    socket.emit("get_data", { type: "task_info", agentId }, (data) => {
      if (!data || !data[0]?.data) {
        setError("No task info received for this agent.");
        setLoading(false);
        return;
      }

      const doc = data[0]; // fetchData returns an array

      setDevice({
        hostname: doc.device?.hostname || `Agent ${doc.agentId}`,
        os_type: doc.device?.os_type,
        os_version: doc.device?.os_version,
        machine_id: doc.agentId
      });

      setTasks({
        applications: doc.data.applications || [],
        background_processes: doc.data.background_processes || [],
      });

      setLoading(false);
    });

    // Handle socket connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket error:", err);
      setError("Failed to connect to real-time service.");
      setLoading(false);
    });

    return () => {
      socket.off("connect_error");
    };
  }, [agentId]);

  if (loading) return <div className="pc-container">Loading Task Manager...</div>;
  if (error) return <div className="pc-container">{error}</div>;

  return (
    <div className="pc-container">
      <div className="task-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate("/devices")}>
            ← Back
          </button>
          <div>
            <h1 className="task-title">Task Manager</h1>
            <p className="task-sub">{device?.hostname}</p>
          </div>
        </div>
        <div className="header-right">
          <p><strong>OS:</strong> {device?.os_type} {device?.os_version}</p>
          <p><strong>ID:</strong> {device?.machine_id}</p>
        </div>
      </div>

      {/* Applications */}
      <div className="pc-section">
        <div className="section-header">
          <h2>🖥️ Applications</h2>
        </div>
        <div className="table">
          <div className="table-header sticky">
            <span>Name</span>
            <span>PID</span>
            <span>CPU</span>
            <span>Memory</span>
          </div>
          <div className="table-body">
            {tasks.applications.length ? (
              tasks.applications.map((app) => (
                <div key={app.pid + app.name} className="task-row">
                  <span className="task-name">{app.name} {app.title ? `- ${app.title}` : ""}</span>
                  <span>{app.pid}</span>
                  <span>{app.cpu_percent}%</span>
                  <span>{app.memory_percent}%</span>
                </div>
              ))
            ) : (
              <p className="empty">No applications running.</p>
            )}
          </div>
        </div>
      </div>

      {/* Background Processes */}
      <div className="pc-section">
        <div className="section-header">
          <h2>🧩 Background Processes</h2>
        </div>
        <div className="table">
          <div className="table-header sticky">
            <span>Name</span>
            <span>PID</span>
            <span>CPU</span>
            <span>Memory</span>
          </div>
          <div className="table-body">
            {tasks.background_processes.length ? (
              tasks.background_processes.map((proc) => (
                <div key={proc.pid + proc.name} className="task-row">
                  <span className="task-name">{proc.name}</span>
                  <span>{proc.pid}</span>
                  <span>{proc.cpu_percent}%</span>
                  <span>{proc.memory_percent}%</span>
                </div>
              ))
            ) : (
              <p className="empty">No background processes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
