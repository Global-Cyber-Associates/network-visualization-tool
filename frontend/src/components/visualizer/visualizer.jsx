// Visualizer.jsx
import React, { useEffect, useRef, useState } from "react";
import "./visualizer.css";
import sampleData from "../../devices";

// build links dynamically: all non-hub devices connect to the hub
const makeDefaultLinks = (devices) => {
  const hub = devices.find((d) => d.type === "hub") || devices[0];
  return devices
    .filter((d) => d.id !== hub.id)
    .map((dev) => ({ from: hub.id, to: dev.id }));
};

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState(sampleData.visualizer);
  const [links, setLinks] = useState(makeDefaultLinks(sampleData.visualizer));
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });

  // compute positions in a circle
  useEffect(() => {
    function compute() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const W = Math.max(400, rect.width);
      const H = Math.max(300, rect.height);
      setSize({ width: W, height: H });

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.32;

      const hub = devices.find((d) => d.type === "hub") || devices[0];
      const outer = devices.filter((d) => d.id !== hub.id);

      const newPos = {};
      newPos[hub.id] = { x: cx, y: cy };

      outer.forEach((dev, i) => {
        const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        newPos[dev.id] = { x, y };
      });

      setPositions(newPos);
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [devices]);

  function getNodeColor(status) {
    if (status === "Working" || status === "online") return "#0b74de"; // blue
    if (status === "Offline" || status === "offline") return "#d9534f"; // red
    if (status === "Sleep") return "#6c757d"; // gray
    return "#6c757d";
  }

  const hub = devices.find((d) => d.type === "hub") || devices[0];

  return (
    <div className="visualizer-wrap" ref={containerRef}>
      <div className="visualizer-header">
        <h1>Network Visualizer</h1>
      </div>

      <div className="visualizer-canvas" style={{ marginLeft: "240px" }}>
        <svg
          className="visualizer-svg"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          {/* links */}
          {links.map((link, idx) => {
            const a = positions[link.from];
            const b = positions[link.to];
            if (!a || !b) return null;
            return (
              <line
                key={idx}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#cfd8e3"
                strokeWidth={2}
                opacity={0.9}
              />
            );
          })}

          {/* nodes */}
          {devices.map((d) => {
            const pos = positions[d.id];
            if (!pos) return null;
            const radius = d.type === "hub" ? 26 : 20;
            return (
              <g key={d.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r={radius}
                  fill={getNodeColor(d.status)}
                  stroke="#ffffff"
                  strokeWidth={3}
                />
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fontSize="80"
                  fill="#fff"
                  style={{ fontWeight: 700 }}
                >
                  {d.icon || d.name.charAt(0).toUpperCase()}
                </text>
                <foreignObject x={-80} y={radius + 8} width={160} height={60}>
                  <div className="node-label">
                    <div className="node-name">{d.name}</div>
                    <div className="node-ip">{d.ip}</div>
                    <div
                      className={`node-status ${
                        d.status === "Working" || d.status === "online"
                          ? "online"
                          : "offline"
                      }`}
                    >
                      {d.status}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="visualizer-legend" style={{ marginLeft: "240px" }}>
        <span className="legend-item">
          <span className="legend-dot online" /> Online
        </span>
        <span className="legend-item">
          <span className="legend-dot offline" /> Offline
        </span>
      </div>
    </div>
  );
}
