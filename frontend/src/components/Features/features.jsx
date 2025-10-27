import React from "react";
import "./features.css";
import Sidebar from "../navigation/sidenav.jsx";
import { Monitor, Usb, Cpu, Network, Activity } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Connected Devices",
      description: "View and manage all connected systems across your infrastructure in real-time.",
      icon: <Monitor size={26} />,
    },
    {
      title: "USB Manager",
      description: "Monitor, approve, or block USB devices connected to your endpoints instantly.",
      icon: <Usb size={26} />,
    },
    {
      title: "Task Manager",
      description: "Track and control active processes and system operations from a central interface.",
      icon: <Cpu size={26} />,
    },
    {
      title: "Network Visualizer",
      description: "Visualize your full network topology, device connections, and communication paths.",
      icon: <Network size={26} />,
    },
    {
      title: "Logs & Monitoring",
      description: "View live activity logs, alerts, and system events across all network assets.",
      icon: <Activity size={26} />,
    },
  ];

  return (
    <div className="features-layout">
      <Sidebar />
      <div className="features-content">
        <h1 className="features-title">Platform Features</h1>
        <p className="features-subtitle">
          Key modules that power monitoring, control, and visibility across your environment.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
              <button className="buy-btn">Open</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
