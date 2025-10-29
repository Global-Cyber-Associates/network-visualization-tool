import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import VisualizerControls from "./visualizerControls";
import "./visualizer.css";

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [showDesc, setShowDesc] = useState(true);

  // 💾 Restore saved positions
  useEffect(() => {
    const saved = localStorage.getItem("devicePositions");
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  // 🔄 Fetch devices from backend
  const fetchDevices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visualizer-data");
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const routerIp = data.find((dev) => dev.ip && dev.ip.endsWith(".1"))?.ip;

      setDevices((prevDevices) => {
        const newDevicesMap = {};

        data.forEach((dev) => {
          const ip = dev.ip || "N/A";
          const isRouter = ip === routerIp;
          const displayName =
            dev.hostname && dev.hostname !== "Unknown"
              ? dev.hostname
              : "Unknown Device";

          newDevicesMap[ip] = {
            ip,
            name: isRouter ? "Router" : displayName,
            status: dev.noAgent ? "No Agent" : "Working",
            noAgent: dev.noAgent,
            icon: isRouter ? "🛜" : "💻",
            type: isRouter ? "router" : "device",
          };
        });

        // 🧩 Merge updates
        const updatedDevices = prevDevices.map((d) => {
          const newData = newDevicesMap[d.ip];
          return newData ? { ...d, ...newData } : d;
        });

        // ➕ Add new devices
        const existingIps = new Set(prevDevices.map((d) => d.ip));
        Object.values(newDevicesMap).forEach((dev) => {
          if (!existingIps.has(dev.ip))
            updatedDevices.push({ ...dev, id: updatedDevices.length });
        });

        // 🛜 Ensure one router
        if (
          !updatedDevices.some((d) => d.type === "router") &&
          updatedDevices.length > 0
        ) {
          updatedDevices[0].type = "router";
          updatedDevices[0].name = "Router";
          updatedDevices[0].icon = "🛜";
        }

        return updatedDevices;
      });
    } catch (err) {
      console.error("❌ Failed to fetch visualizer data:", err);
    }
  };

  // 🔁 Fetch once when mounted (no auto-refresh)
  useEffect(() => {
    fetchDevices();
  }, []);

  // 🔗 Create links (router → devices)
  useEffect(() => {
    const makeLinks = (devices) => {
      const router = devices.find((d) => d.type === "router");
      if (!router) return [];
      return devices
        .filter((d) => d.id !== router.id)
        .map((d) => ({ from: router.id, to: d.id }));
    };

    if (devices.length > 0) setLinks(makeLinks(devices));
  }, [devices]);

  // 🌀 Compute circular layout
  useEffect(() => {
    if (!devices || devices.length === 0) return;

    const computePositions = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const headerEl = document.querySelector(".visualizer-header");
      const headerHeight = headerEl ? headerEl.offsetHeight : 0;

      const W = Math.max(600, rect.width);
      const H = Math.max(400, rect.height);
      setSize({ width: W, height: H });

      const cx = W / 2;
      const cy = (H - headerHeight) / 2 + headerHeight;
      const radius = Math.min(W, H - headerHeight) * 0.35;

      const router = devices.find((d) => d.type === "router") || devices[0];
      const others = devices.filter((d) => d.id !== router.id);
      const newPos = { ...positions };

      if (!newPos[router.id]) newPos[router.id] = { x: cx, y: cy };

      others.forEach((dev, i) => {
        if (!newPos[dev.id]) {
          const angle = (i / others.length) * Math.PI * 2;
          newPos[dev.id] = {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
          };
        }
      });

      setPositions(newPos);
    };

    computePositions();
    window.addEventListener("resize", computePositions);
    return () => window.removeEventListener("resize", computePositions);
  }, [devices]);

  // 💾 Save positions
  useEffect(() => {
    if (Object.keys(positions).length > 0) {
      localStorage.setItem("devicePositions", JSON.stringify(positions));
    }
  }, [positions]);

  return (
    <div className="visualizer-page">
      <Sidebar />
      <div className="visualizer-wrap" ref={containerRef}>
        <div className="visualizer-header">
          <h1>Network Visualizer</h1>
          <VisualizerControls showDesc={showDesc} setShowDesc={setShowDesc} />
        </div>

        <div className="visualizer-canvas">
          <svg
            className="visualizer-svg"
            width="100%"
            height="100%"
            viewBox={`0 0 ${size.width} ${size.height}`}
          >
            <defs>
              <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3f5e96ff" />
                <stop offset="100%" stopColor="#000000ff" />
              </linearGradient>

              <radialGradient id="router-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffc504ff" />
                <stop offset="100%" stopColor="#000000ff" />
              </radialGradient>

              <radialGradient id="noagent-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f50014ff" />
                <stop offset="100%" stopColor="#201212ff" />
              </radialGradient>
            </defs>

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

            {devices.map((d) => {
              const pos = positions[d.id];
              if (!pos) return null;

              let fill = "#6ebbceff";
              if (d.type === "router") fill = "url(#router-gradient)";
              else if (d.noAgent) fill = "url(#noagent-gradient)";

              const radius = d.type === "router" ? 30 : 20;

              return (
                <g key={d.id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle
                    r={radius}
                    fill={fill}
                    stroke="#222"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="18"
                    fill="#ff2929ff"
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    {d.icon}
                  </text>

                  {showDesc && (
                    <foreignObject
                      x={-100}
                      y={radius + 8}
                      width={200}
                      height={80}
                      pointerEvents="none"
                    >
                      <div className="node-label">
                        <div className="node-name">{d.name}</div>
                        <div className="node-ip">{d.ip}</div>
                        <div
                          className={`node-status ${
                            d.noAgent ? "no-agent" : "online"
                          }`}
                        >
                          {d.status}
                        </div>
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
