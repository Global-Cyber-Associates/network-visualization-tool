// Visualizer.jsx
import React, { useEffect, useRef, useState } from "react";
import sampleData from "../../devices";
import './visualizer.css';

const makeDefaultLinks = (devices) => {
  const hub = devices.find((d) => d.type === "hub") || devices[0];
  return devices
    .filter((d) => d.id !== hub.id && d.status !== "Offline")
    .map((dev) => ({ from: hub.id, to: dev.id }));
};

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState(sampleData.visualizer);
  const [links, setLinks] = useState(makeDefaultLinks(sampleData.visualizer));
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });

  // Compute positions in a circle
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

  const hub = devices.find((d) => d.type === "hub") || devices[0];

  function getNodeClass(status) {
    if (status === "Working" || status === "online") return "online";
    if (status === "Sleep") return "sleep";
    return "offline";
  }

  return (
    <div className="visualizer-wrap" ref={containerRef}>
      <div className="visualizer-header">
        <h1>Network Visualizer</h1>
      </div>

      <div className="visualizer-canvas">
        <svg
          className="visualizer-svg"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          <defs>
            <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0b74de" />
              <stop offset="100%" stopColor="#00bfff" />
            </linearGradient>
          </defs>

          {/* Only render links for devices that are online or sleep */}
          {links.map((link, idx) => {
            const a = positions[link.from];
            const b = positions[link.to];
            if (!a || !b) return null;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const mx = a.x + dx / 2;
            const my = a.y + dy / 2 - 30;
            const targetDevice = devices.find((d) => d.id === link.to);

            // Sleep devices: dotted gray lines, Online: gradient animated
            const isSleep = targetDevice.status === "Sleep";
            return (
              <path
                key={idx}
                d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
                stroke={isSleep ? "#6c757d" : "url(#link-gradient)"}
                strokeWidth={isSleep ? 1.5 : 2}
                fill="none"
                strokeOpacity={isSleep ? 0.3 : 0.7}
                className={isSleep ? "sleep-wire" : "wire-path"}
                strokeDasharray={isSleep ? "2 4" : "6 4"}
              />
            );
          })}

          {/* Nodes */}
          {devices.map((d) => {
            const pos = positions[d.id];
            if (!pos) return null;
            const radius = d.type === "hub" ? 26 : 20;

            return (
              <g key={d.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r={radius}
                  className={`node-circle ${getNodeClass(d.status)} ${
                    d.type === "hub" ? "hub" : ""
                  }`}
                />
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fontSize="18"
                  fill="#fff"
                  style={{ fontWeight: 700 }}
                >
                  {d.icon || d.name.charAt(0).toUpperCase()}
                </text>

                {/* Tooltip label */}
                <foreignObject x={-100} y={radius + 8} width={200} height={80}>
                  <div className="node-label">
                    <div className="node-name">{d.name}</div>
                    <div className="node-ip">{d.ip}</div>
                    <div className={`node-status ${getNodeClass(d.status)}`}>
                      {d.status}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="visualizer-legend">
        <span className="legend-item">
          <span className="legend-dot online" /> Online
        </span>
        <span className="legend-item">
          <span className="legend-dot sleep" /> Sleep
        </span>
        <span className="legend-item">
          <span className="legend-dot offline" /> Offline
        </span>
      </div>
    </div>
  );
}
