import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./taskmanager.css";

const TaskManager = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState({ applications: [], background_processes: [] });
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const systemRes = await axios.get("http://localhost:5000/api/system");
        const foundDevice = systemRes.data.find((d) => d._id === id);
        if (!foundDevice) throw new Error("Device not found");
        setDevice(foundDevice);

        const res = await axios.get(`http://localhost:5000/api/tasks/${foundDevice.machine_id}`);
        if (res.data.success && res.data.data.length) {
          setTasks(res.data.data[0]);
        } else {
          setTasks({ applications: [], background_processes: [] });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch task manager data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

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
                <div key={app.pid} className="task-row">
                  <span className="task-name">{app.name}</span>
                  <span>{app.pid}</span>
                  <span>{app.cpu}%</span>
                  <span>{app.memory}%</span>
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
                <div key={proc.pid} className="task-row">
                  <span className="task-name">{proc.name}</span>
                  <span>{proc.pid}</span>
                  <span>{proc.cpu}%</span>
                  <span>{proc.memory}%</span>
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
