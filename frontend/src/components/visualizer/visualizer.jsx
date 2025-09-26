import React, { useEffect, useRef, useState } from "react";
import "./visualizer.css";

const sampleDevices = [
  {
    id: "d1",
    name: "Gateway",
    ip: "192.168.1.1",
    type: "hub",
    status: "online",
  },
  {
    id: "d2",
    name: "Workstation-01",
    ip: "192.168.1.101",
    type: "pc",
    status: "online",
  },
  {
    id: "d3",
    name: "Server-A",
    ip: "192.168.1.20",
    type: "server",
    status: "online",
  },
  {
    id: "d4",
    name: "Printer-01",
    ip: "192.168.1.55",
    type: "printer",
    status: "offline",
  },
  {
    id: "d5",
    name: "Device-X",
    ip: "192.168.1.200",
    type: "iot",
    status: "online",
  },
  {
    id: "d6",
    name: "Laptop-02",
    ip: "192.168.1.110",
    type: "pc",
    status: "online",
  },
];

// simple topology: every device connects to the hub (sampleDevices[0])
const defaultLinks = sampleDevices
  .slice(1)
  .map((dev) => ({ from: sampleDevices[0].id, to: dev.id }));

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState(sampleDevices);
  const [links, setLinks] = useState(defaultLinks);
  const [positions, setPositions] = useState({}); // { id: {x,y} }
  const [hovered, setHovered] = useState(null); // { type: 'node'|'link', id }
  const [size, setSize] = useState({ width: 800, height: 400 });

  // compute positions in a circle around the center for devices except hub
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

      // place outer devices evenly on a circle
      outer.forEach((dev, i) => {
        const angle = (i / outer.length) * Math.PI * 2 - Math.PI / 2; // start at top
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

  function handleAddDevice() {
    const id = `d${devices.length + 1}`;
    const newDev = {
      id,
      name: `Device-${devices.length + 1}`,
      ip: `192.168.1.${100 + devices.length}`,
      type: "pc",
      status: "online",
    };
    setDevices((d) => [...d, newDev]);
    setLinks((l) => [...l, { from: devices[0].id, to: id }]);
    // positions will recalc via useEffect (devices changed)
  }

  function getNodeColor(status) {
    if (status === "online") return "#0b74de"; // blue
    if (status === "offline") return "#d9534f"; // red
    return "#6c757d"; // gray
  }

  function onNodeHover(id) {
    setHovered({ type: "node", id });
  }
  function onNodeLeave() {
    setHovered(null);
  }

  function onLinkHover(linkIndex) {
    setHovered({ type: "link", id: linkIndex });
  }
  function onLinkLeave() {
    setHovered(null);
  }

  const hub = devices.find((d) => d.type === "hub") || devices[0];

  return (
    <div className="visualizer-wrap" ref={containerRef}>
      <div className="visualizer-header">
        <h1>Network Visualizer</h1>
        <div className="visualizer-actions">
          <button className="btn primary" onClick={handleAddDevice}>
            + Add Device
          </button>
          <button
            className="btn"
            onClick={() => {
              // simple randomize: toggle one device status
              setDevices((prev) =>
                prev.map((p, i) =>
                  i === 1
                    ? {
                        ...p,
                        status: p.status === "online" ? "offline" : "online",
                      }
                    : p
                )
              );
            }}
          >
            Toggle sample status
          </button>
        </div>
      </div>

      <div className="visualizer-canvas" style={{ marginLeft: "240px" }}>
        {/* SVG for edges */}
        <svg
          className="visualizer-svg"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          {/* lines */}
          {links.map((link, idx) => {
            const a = positions[link.from];
            const b = positions[link.to];
            if (!a || !b) return null;
            const isHovered =
              hovered && hovered.type === "link" && hovered.id === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => onLinkHover(idx)}
                onMouseLeave={onLinkLeave}
                style={{ cursor: "pointer" }}
              >
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={isHovered ? "#0b74de" : "#cfd8e3"}
                  strokeWidth={isHovered ? 3.5 : 2}
                  opacity={isHovered ? 1 : 0.95}
                />
                {/* small midpoint label when hovered */}
                {isHovered && (
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 8}
                    fontSize="12"
                    textAnchor="middle"
                    fill="#0b74de"
                  >
                    connected
                  </text>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {devices.map((d) => {
            const pos = positions[d.id];
            if (!pos) return null;
            const radius = d.type === "hub" ? 26 : 20;
            const isHovered =
              hovered && hovered.type === "node" && hovered.id === d.id;
            return (
              <g
                key={d.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => onNodeHover(d.id)}
                onMouseLeave={onNodeLeave}
                style={{ cursor: "pointer" }}
              >
                <circle
                  r={radius}
                  fill={getNodeColor(d.status)}
                  stroke={isHovered ? "#003f6b" : "#ffffff"}
                  strokeWidth={isHovered ? 4 : 3}
                />
                {/* icon letter */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fontSize={isHovered ? "12" : "11"}
                  fill="#fff"
                  style={{ fontWeight: 700 }}
                >
                  {d.type === "hub" ? "H" : d.name.charAt(0).toUpperCase()}
                </text>

                {/* label */}
                <foreignObject x={-80} y={radius + 8} width={160} height={60}>
                  <div
                    className={`node-label ${
                      isHovered ? "node-label--active" : ""
                    }`}
                  >
                    <div className="node-name">{d.name}</div>
                    <div className="node-ip">{d.ip}</div>
                    <div
                      className={`node-status ${
                        d.status === "online" ? "online" : "offline"
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
