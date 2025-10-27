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
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [professional, setProfessional] = useState(false);

  // 💾 Restore saved positions
  useEffect(() => {
    const saved = localStorage.getItem("devicePositions");
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  // 🔄 Fetch devices
  const fetchDevices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visualizer-data");
      if (!res.ok) throw new Error("API not reachable");
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid data");

      const routerIp = data.find((d) => d.ip && d.ip.endsWith(".1"))?.ip;

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
          icon: isRouter ? "🛜" : "💻",
          type: isRouter ? "router" : "device",
        };
      });

      if (!mapped.some((d) => d.type === "router") && mapped.length > 0) {
        mapped[0].type = "router";
        mapped[0].name = "Router";
        mapped[0].icon = "🛜";
      }

      setDevices(mapped);
    } catch (err) {
      console.warn("⚠️ Using fallback demo data:", err.message);
      // fallback for local testing
      const mock = [
        { id: 0, name: "Router", type: "router", ip: "192.168.1.1", icon: "🛜" },
        { id: 1, name: "Laptop", type: "device", ip: "192.168.1.10", icon: "💻" },
        { id: 2, name: "PC", type: "device", ip: "192.168.1.11", icon: "💻" },
        { id: 3, name: "Phone", type: "device", ip: "192.168.1.12", icon: "📱" },
      ];
      setDevices(mock);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // 🔗 Generate links
  useEffect(() => {
    if (!devices.length) return;
    const router = devices.find((d) => d.type === "router");
    if (!router) return;
    const deviceLinks = devices
      .filter((d) => d.id !== router.id)
      .map((d) => ({ from: router.id, to: d.id }));
    setLinks(deviceLinks);
  }, [devices]);

  // 🌀 Compute positions
  useEffect(() => {
    if (!devices.length) return;

    const computePositions = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const W = Math.max(600, rect.width);
      const H = Math.max(400, rect.height);
      setSize({ width: W, height: H });

      const newPos = {};
      const router = devices.find((d) => d.type === "router") || devices[0];
      const others = devices.filter((d) => d.id !== router.id);

      if (professional) {
        // Grid layout
        const cols = Math.ceil(Math.sqrt(others.length));
        const spacingX = 180;
        const spacingY = 140;
        const startX = W / 2 - ((cols - 1) * spacingX) / 2;
        const startY = H / 2 - ((Math.ceil(others.length / cols) - 1) * spacingY) / 2 + 80;
        newPos[router.id] = { x: W / 2, y: 100 };
        others.forEach((dev, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          newPos[dev.id] = {
            x: startX + col * spacingX,
            y: startY + row * spacingY,
          };
        });
      } else {
        // Circular layout
        const cx = W / 2;
        const cy = H / 2;
        const radius = Math.min(W, H) * 0.35;
        newPos[router.id] = { x: cx, y: cy };
        others.forEach((dev, i) => {
          const angle = (i / others.length) * Math.PI * 2;
          newPos[dev.id] = {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
          };
        });
      }
      setPositions(newPos);
    };

    computePositions();
    window.addEventListener("resize", computePositions);
    return () => window.removeEventListener("resize", computePositions);
  }, [devices, professional]);

  // 💾 Save positions
  useEffect(() => {
    if (Object.keys(positions).length)
      localStorage.setItem("devicePositions", JSON.stringify(positions));
  }, [positions]);

  // 🖱️ Dragging
  const handleMouseDown = (id, e) => {
    e.stopPropagation();
    const svg = e.target.ownerSVGElement;
    const ctm = svg?.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(ctm.inverse());
    const pos = positions[id];
    setDraggedNode(id);
    setOffset({ x: pos.x - cursor.x, y: pos.y - cursor.y });
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const svg = e.target.ownerSVGElement || e.target;
    const ctm = svg?.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursor = pt.matrixTransform(ctm.inverse());
    setPositions((prev) => ({
      ...prev,
      [draggedNode]: { x: cursor.x + offset.x, y: cursor.y + offset.y },
    }));
  };

  const handleMouseUp = () => setDraggedNode(null);

  // ▶️ Run visualizer
  const handleRunVisualizer = async () => {
    setLoading(true);
    setMessage("Running visualizer...");
    try {
      const res = await fetch("http://localhost:5000/api/visualizerTrigger/run-visualizer", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Visualizer updated successfully!");
        await fetchDevices();
      } else setMessage("Failed to run visualizer.");
    } catch (err) {
      console.error(err);
      setMessage("Error running visualizer.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // 🧩 Render
  return (
    <div className="visualizer-page">
      <Sidebar />
      <div className="visualizer-wrap" ref={containerRef}>
        <div className="visualizer-header">
          <h1>Network Visualizer</h1>
          <VisualizerControls
            loading={loading}
            message={message}
            showDesc={showDesc}
            setShowDesc={setShowDesc}
            handleRunVisualizer={handleRunVisualizer}
          />
          <button className="view-toggle-btn" onClick={() => setProfessional((p) => !p)}>
            {professional ? "Default View" : "Professional View"}
          </button>
        </div>

        {devices.length > 0 && Object.keys(positions).length > 0 ? (
          <div className="visualizer-canvas">
            <svg
              className="visualizer-svg"
              width="100%"
              height="100%"
              viewBox={`0 0 ${size.width} ${size.height}`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <defs>
                <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3db2ff" />
                  <stop offset="100%" stopColor="#00bfff" />
                </linearGradient>
                <radialGradient id="router-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#110eccff" />
                  <stop offset="100%" stopColor="#d17a16ff" />
                </radialGradient>
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

                if (professional) {
                  const midX = (a.x + b.x) / 2;
                  const path = `M${a.x},${a.y} L${midX - 20},${a.y} L${midX + 20},${b.y} L${b.x},${b.y}`;
                  return (
                    <path
                      key={idx}
                      d={path}
                      stroke="url(#link-gradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                  );
                } else {
                  const mx = (a.x + b.x) / 2;
                  const my = (a.y + b.y) / 2 - 40;
                  return (
                    <path
                      key={idx}
                      d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
                      stroke="url(#link-gradient)"
                      strokeWidth="2"
                      fill="none"
                    />
                  );
                }
              })}

              {/* 💻 / 🛜 Nodes */}
              {devices.map((d) => {
                const pos = positions[d.id];
                if (!pos) return null;

                let fill = "#00bfff";
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
                            className={`node-status ${d.noAgent ? "no-agent" : "online"}`}
                          >
                            {d.noAgent ? "No Agent" : "Online"}
                          </div>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="loading-msg">Loading devices...</div>
        )}
      </div>
    </div>
  );
}
