import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import "./visualizer.css";

// 🔹 Example network data
const networkData = {
  network: "192.168.1.1/24",
  devices: [
    { ips: ["192.168.1.1"], mac: "f4:27:56:2c:fc:3f", vendor: "Unknown" },
    { ips: ["192.168.1.2"], mac: "c8:7f:54:ce:67:44", vendor: "Unknown" },
    { ips: ["192.168.1.3"], mac: "10:ff:e0:48:a7:13", vendor: "Unknown" },
    { ips: ["192.168.1.11"], mac: "14:13:33:e2:09:89", vendor: "AzureWave Technology Inc." },
    { ips: ["192.168.1.7"], mac: "cc:6b:1e:41:e5:7d", vendor: "CLOUD NETWORK TECHNOLOGY SINGAPORE PTE. LTD." },
    { ips: ["192.168.1.12"], mac: "04:ec:d8:56:35:6a", vendor: "Intel Corporate" },
    { ips: ["192.168.1.15"], mac: "1c:ce:51:14:92:79", vendor: "Unknown" },
    { ips: ["192.168.1.9"], mac: "c8:94:02:47:0b:dd", vendor: "CHONGQING FUGUI ELECTRONICS CO.,LTD." },
  ],
};

// 🧠 Convert network data → visualizer format
const mapNetworkData = (data) => {
  if (!data || !data.devices) return [];

  return data.devices.map((dev, i) => {
    const ip = dev.ips?.[0] || "N/A";
    const isRouter = ip.endsWith(".1");
    const vendorName = dev.vendor === "Unknown" ? dev.mac : dev.vendor.split(" ")[0];

    return {
      id: i,
      name: isRouter ? "Router-Gateway" : vendorName,
      ip,
      status: "Working",
      vulnerable: false,
      icon: isRouter ? "🛜" : "💻",
      type: isRouter ? "hub" : "device",
      power: true,
    };
  });
};

// 🔗 Connect router → all devices
const makeLinks = (devices) => {
  const hub = devices.find((d) => d.type === "hub");
  if (!hub) return [];

  return devices
    .filter((d) => d.id !== hub.id)
    .map((d) => ({ from: hub.id, to: d.id }));
};

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState(mapNetworkData(networkData));
  const [links, setLinks] = useState([]);
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [showDesc, setShowDesc] = useState(true);

  // 🌀 Compute node positions (perfect circle)
  useEffect(() => {
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

  // ♻️ Compute links
  useEffect(() => {
    if (devices.length > 0) setLinks(makeLinks(devices));
  }, [devices]);

  return (
    <div className="visualizer-page">
      <Sidebar />
      <div className="visualizer-wrap" ref={containerRef}>
        <div className="visualizer-header">
          <h1>Network Visualizer</h1>
          <button
            className="desc-toggle-btn"
            onClick={() => setShowDesc((prev) => !prev)}
          >
            {showDesc ? "Hide Descriptions" : "Show Descriptions"}
          </button>
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
                <stop offset="0%" stopColor="#3db2ff" />
                <stop offset="100%" stopColor="#00bfff" />
              </linearGradient>
              <radialGradient id="hub-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#ffcc33" />
              </radialGradient>
            </defs>

            {/* 🔗 Links */}
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
                />
              );
            })}

            {/* 💻 Nodes */}
            {devices.map((d) => {
              const pos = positions[d.id];
              if (!pos) return null;
              const radius = d.type === "hub" ? 28 : 20;

              return (
                <g key={d.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Node circle */}
                  <circle
                    r={radius}
                    className={`node-circle online ${d.type === "hub" ? "hub" : ""}`}
                    fill={d.type === "hub" ? "url(#hub-gradient)" : "#00bfff"}
                  />
                  {/* Node icon */}
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="18"
                    fill="#fff"
                    fontWeight={700}
                  >
                    {d.icon}
                  </text>

                  {/* Branching lines */}
                  <g>
                    {[...Array(4)].map((_, i) => {
                      const angle = (i * Math.PI) / 2;
                      const length = 8 + Math.random() * 4;
                      return (
                        <line
                          key={i}
                          x1={0}
                          y1={0}
                          x2={Math.cos(angle) * length}
                          y2={Math.sin(angle) * length}
                          stroke="#00bfff"
                          strokeWidth={1.2}
                          className="branch-line"
                        />
                      );
                    })}
                  </g>

                  {/* 🔹 Show/hide descriptions */}
                  {showDesc && (
                    <foreignObject x={-100} y={radius + 8} width={200} height={80}>
                      <div className="node-label">
                        <div className="node-name">{d.name}</div>
                        <div className="node-ip">{d.ip}</div>
                        <div className={`node-status online`}>{d.status}</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
