import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../navigation/sidenav.jsx";
import "./visualizer.css";

export default function Visualizer() {
  const containerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [positions, setPositions] = useState({});
  const [size, setSize] = useState({ width: 800, height: 400 });
  const [showDesc, setShowDesc] = useState(true);
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // 🔄 Fetch devices from API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/visualizer-data");
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data);
          return;
        }

        // 🧠 Detect router IP (.1 ending)
        const routerIp = data.find((dev) => dev.ip && dev.ip.endsWith(".1"))?.ip;

        // Map API data
        const mapped = data.map((dev, i) => {
          const ip = dev.ip || "N/A";
          const isRouter = ip === routerIp;
          const vendorName =
            dev.vendor === "Unknown" ? dev.mac || "Unknown Device" : dev.vendor.split(" ")[0];

          return {
            id: i,
            name: isRouter ? "Router" : vendorName,
            ip,
            status: dev.noAgent ? "No Agent" : "Working",
            noAgent: dev.noAgent,
            icon: isRouter ? "🛜" : dev.noAgent ? "💻" : "💻",
            type: isRouter ? "router" : "device",
          };
        });

        // If no .1 found, fallback first as router
        if (!mapped.some((d) => d.type === "router") && mapped.length > 0) {
          mapped[0].type = "router";
          mapped[0].name = "Router";
          mapped[0].icon = "🛜";
        }

        setDevices(mapped);
      } catch (err) {
        console.error("Failed to fetch visualizer data:", err);
      }
    };

    fetchDevices();
  }, []);

  // 🔗 Generate links from router to devices
  useEffect(() => {
    const makeLinks = (devices) => {
      const router = devices.find((d) => d.type === "router");
      if (!router) return [];
      return devices.filter((d) => d.id !== router.id).map((d) => ({ from: router.id, to: d.id }));
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
      const W = Math.max(600, rect.width);
      const H = Math.max(400, rect.height);
      setSize({ width: W, height: H });

      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.35;

      const router = devices.find((d) => d.type === "router") || devices[0];
      const others = devices.filter((d) => d.id !== router.id);

      const newPos = {};
      newPos[router.id] = { x: cx, y: cy };
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

  // 💾 Save positions
  useEffect(() => {
    if (Object.keys(positions).length > 0) {
      localStorage.setItem("devicePositions", JSON.stringify(positions));
    }
  }, [positions]);

  // 🖱️ Dragging
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
          <button className="desc-toggle-btn" onClick={() => setShowDesc((p) => !p)}>
            {showDesc ? "Hide Descriptions" : "Show Descriptions"}
          </button>
          <button
            className="reset-btn"
            onClick={() => {
              localStorage.removeItem("devicePositions");
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

              {/* Router gradient */}
              <radialGradient id="router-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#110eccff" />
                <stop offset="100%" stopColor="#d17a16ff" />
              </radialGradient>

              {/* No Agent gradient */}
              <radialGradient id="noagent-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff5f6d" />
                <stop offset="100%" stopColor="#df0b0bff" />
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
                  stroke="url(#link-gradient)"
                  strokeWidth="2"
                  fill="none"
                />
              );
            })}

            {/* 💻 / 🛜 Nodes */}
            {devices.map((d) => {
              const pos = positions[d.id];
              if (!pos) return null;

              let fill = "#00bfff"; // default blue
              if (d.type === "router") fill = "url(#router-gradient)";
              else if (d.noAgent) fill = "url(#noagent-gradient)";

              const radius = d.type === "router" ? 30 : 20;

              return (
                <g
                  key={d.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleMouseDown(d.id, e)}
                  style={{ cursor: "grab" }}
                >
                  <circle r={radius} fill={fill} stroke="#222" strokeWidth="1.5" />
                  <text
                    x="0"
                    y="6"
                    textAnchor="middle"
                    fontSize="18"
                    fill="#fff"
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    {d.icon}
                  </text>

                  {showDesc && (
                    <foreignObject x={-100} y={radius + 8} width={200} height={80} pointerEvents="none">
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
