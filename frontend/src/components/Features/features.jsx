import React from "react";
import "./features.css";
import Sidebar from "../navigation/sidenav.jsx";
import { Shield, Usb, Eye, Server, Activity } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Vulnerability Scanner",
      description: "Scan your devices and systems for potential security weaknesses.",
      icon: <Shield size={26} />,
    },
    {
      title: "USB Blocker",
      description: "Prevent unauthorized USB devices from connecting to your network.",
      icon: <Usb size={26} />,
    },
    {
      title: "Logging & Monitoring",
      description: "Centralized logging and monitoring of your network activities.",
      icon: <Activity size={26} />,
    },
    {
      title: "Control & Isolation",
      description: "Remotely control or isolate infected or risky devices instantly.",
      icon: <Server size={26} />,
    },
    {
      title: "Visualizer",
      description: "Get a live visualization of your entire network and its connections.",
      icon: <Eye size={26} />,
    },
  ];

  return (
    <div className="features-layout">
      <Sidebar />
      <div className="features-content">
        <h1 className="features-title">Platform Features</h1>
        <p className="features-subtitle">Smart tools that simplify and secure your network operations.</p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
              <button className="buy-btn">Activate</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
