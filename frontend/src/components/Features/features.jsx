import React from "react";
import "./features.css"; // CSS file

const Features = () => {
  const features = [
    {
      title: "Vulnerability Scanner",
      description:
        "Scan your devices and systems for potential security weaknesses.",
    },
    {
      title: "USB Blocker",
      description:
        "Prevent unauthorized USB devices from connecting to your network.",
    },
    {
      title: "logging and monitering",
      description: "This is a placeholder for a future feature.",
    },
    {
      title: "control and isolate devices",
      description: "This is a placeholder for a future feature.",
    },
    {
      title: "visualizer",
      description: "this will visualizer your entire network and its device",
    },
  ];

  return (
    <div className="features-container">
      <h1 className="features-title">Features</h1>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <button className="buy-btn">Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
