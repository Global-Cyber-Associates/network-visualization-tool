import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import "./visualizer.css";

// Map backend data to frontend nodes
const mapNetworkData = (data) => {
  if (!data || !data.devices) return [];

  return data.devices.map((dev, i) => {
    const ip = dev.ip || "N/A";
    const vendorName = dev.vendor || dev.mac || "Unknown";

    return {
      id: i,
      name: i === 0 ? "Router-Gateway" : vendorName, // first device as router
      ip,
      status: "Working",
      vulnerable: false,
      icon: i === 0 ? "🛜" : "💻",
      type: i === 0 ? "hub" : "device",
      power: true,
    };
  });
};

// Generate links from hub to other devices
const makeLinks = (devices) => {
  const hub = devices.find((d) => d.type === "hub");
  if (!hub) return [];
  return devices.filter((d) => d.id !== hub.id).map((d) => ({ from: hub.id, to: d.id }));
};

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Fetch devices from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/visualizer-data");
        const json = await res.json();
        setDevices(mapNetworkData(json));
      } catch (err) {
        console.error("Failed to fetch network data:", err);
      }
    };
    fetchData();
  }, []);

  // Compute circular layout
  useEffect(() => {
    if (!devices.length) return;

    const computePositions = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const W = Math.max(600, rect.width);
      const H = Math.max(400, rect.height);
      setSize({ width: W, height: H });

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.35;

      const hub = devices.find((d) => d.type === "hub");
      const others = devices.filter((d) => d.id !== hub?.id);

      const newPos = {};
      if (hub) newPos[hub.id] = { x: cx, y: cy };
      others.forEach((dev, i) => {
        const angle = (i / others.length) * Math.PI * 2;
        newPos[dev.id] = {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        };
      });
      setPositions(newPos);
    };

    computePositions();
    window.addEventListener("resize", computePositions);
    return () => window.removeEventListener("resize", computePositions);
  }, [devices]);

  // Generate links
  useEffect(() => {
    if (devices.length > 0) setLinks(makeLinks(devices));
  }, [devices]);

  // Drag handlers
  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    const svg = e.target.ownerSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());
    const pos = positions[id];
    setDraggedNode(id);
    setOffset({ x: pos.x - cursor.x, y: pos.y - cursor.y });
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const svg = e.target.ownerSVGElement || e.target;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse());
    setPositions((prev) => ({
      ...prev,
      [draggedNode]: {
        x: cursor.x + offset.x,
        y: cursor.y + offset.y,
      },
    }));
  };

  const handleMouseUp = () => setDraggedNode(null);

  return (
    <div className="visualizer-page">
      <Sidebar />
      <div className="visualizer-wrap" ref={containerRef}>
        <div className="visualizer-header">
          <h1>Network Visualizer</h1>
          <button
            className="reset-btn"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reset Layout
          </button>
        </div>

        <div className="visualizer-canvas">
          <svg
            className="visualizer-svg"
            width={size.width}
            height={size.height}
            viewBox={`0 0 ${size.width} ${size.height}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3db2ff" />
                <stop offset="100%" stopColor="#00bfff" />
              </linearGradient>
              <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#ffcc33" />
              </radialGradient>
            </defs>

            {/* Links */}
            {links.map((link, idx) => {
              const a = positions[link.from];
              const b = positions[link.to];
              if (!a || !b) return null;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2 - 40;
              return (
                <path
                  key={idx}
                  className="wire-path alive"
                  d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
                  stroke="url(#link-gradient)"
                  strokeWidth="2"
                  fill="none"
                />
              );
            })}

            {/* Nodes */}
            {devices.map((d) => {
              const pos = positions[d.id];
              if (!pos) return null;
              const radius = d.type === "hub" ? 28 : 20;
              return (
                <g
                  key={d.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleMouseDown(d.id, e)}
                  style={{ cursor: "grab" }}
                >
                  <circle
                    r={radius}
                    className={`node-circle ${d.type === "hub" ? "hub" : "online"}`}
                    fill={d.type === "hub" ? "url(#hub-gradient)" : "#00bfff"}
                  />
                  <text x="0" y="6" textAnchor="middle" fontSize="18" fill="#fff" fontWeight={700} pointerEvents="none">
                    {d.icon}
                  </text>
                  <foreignObject x={-100} y={radius + 8} width={200} height={80} pointerEvents="none">
                    <div className="node-label">
                      <div className="node-name">{d.name}</div>
                      <div className="node-ip">{d.ip}</div>
                      <div className="node-status online">{d.status}</div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
