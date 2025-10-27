import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./visualizer.css";
import Sidebar from "../navigation/sidenav.jsx";

export default function Visualizer() {
  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [viewMode, setViewMode] = useState("circular");
  const [positions, setPositions] = useState({});
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // ====== Fetch Devices ======
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/visualizer-");
        setupDevices(res.data);
      } catch {
        const fallback = [
          { ip: "192.168.1.1", vendor: "Cisco", noAgent: false },
          { ip: "192.168.1.2", vendor: "Dell", noAgent: false },
          { ip: "192.168.1.3", vendor: "Apple", noAgent: true },
          { ip: "192.168.1.4", vendor: "HP", noAgent: false },
          { ip: "192.168.1.5", vendor: "Lenovo", noAgent: false },
          { ip: "192.168.1.6", vendor: "Asus", noAgent: false },
        ];
        setupDevices(fallback);
      }
    };
    fetchDevices();
  }, []);

  // ====== Setup Layout ======
  const setupDevices = (data) => {
    const routerIp = data.find((d) => d.ip.endsWith(".1"))?.ip || data[0].ip;
    const nodes = data.map((d, i) => ({
      id: i,
      ip: d.ip,
      vendor: d.vendor,
      type: d.ip === routerIp ? "router" : "device",
      icon: d.ip === routerIp ? "🛰️" : "💻",
      active: !d.noAgent,
    }));

    const router = nodes.find((n) => n.type === "router");
    const others = nodes.filter((n) => n.type !== "router");

    const width = window.innerWidth;
    const height = window.innerHeight - 80;
    const radius =
      Math.min(width, height) / (others.length < 8 ? 2.8 : others.length < 14 ? 2.2 : 1.6);
    const angleStep = (2 * Math.PI) / others.length;

    const pos = {};
    pos[router.id] = { x: width / 2 - 35, y: height / 2 - 35 };
    others.forEach((d, i) => {
      const angle = i * angleStep;
      pos[d.id] = {
        x: width / 2 + radius * Math.cos(angle) - 35,
        y: height / 2 + radius * Math.sin(angle) - 35,
      };
    });

    const linkData = others.map((n) => ({ from: router.id, to: n.id }));
    setDevices(nodes);
    setLinks(linkData);
    setPositions(pos);
  };

  // ====== Dragging ======
  const handleMouseDown = (e, id) => {
    if (viewMode !== "grid") return;
    e.stopPropagation();
    setDragging(id);
    const box = e.currentTarget.getBoundingClientRect();
    setOffset({ x: e.clientX - box.left, y: e.clientY - box.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging || viewMode !== "grid") return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - offset.x;
    const newY = e.clientY - rect.top - offset.y;
    setPositions((prev) => ({ ...prev, [dragging]: { x: newX, y: newY } }));
  };

  const handleMouseUp = () => setDragging(null);

  // ====== Switch Layout ======
  const switchView = () => {
    const width = window.innerWidth;
    const height = window.innerHeight - 80;
    const sidebarWidth = 240;
    const router = devices.find((d) => d.type === "router");
    const others = devices.filter((d) => d.type !== "router");
    const newPos = {};

    if (viewMode === "grid") {
      const radius = Math.min(width, height) / (others.length < 8 ? 2.8 : others.length < 14 ? 2.2 : 1.6);
      const angleStep = (2 * Math.PI) / others.length;
      newPos[router.id] = { x: width / 2 - 35, y: height / 2 - 35 };
      others.forEach((d, i) => {
        const angle = i * angleStep;
        newPos[d.id] = {
          x: width / 2 + radius * Math.cos(angle) - 35,
          y: height / 2 + radius * Math.sin(angle) - 35,
        };
      });
      setViewMode("circular");
    } else {
      const cols = 5;
      const gap = 180;
      const startX = sidebarWidth + 60;
      const startY = 140;
      let count = 0;
      devices.forEach((d, i) => {
        const row = Math.floor(count / cols);
        const col = count % cols;
        newPos[d.id] = { x: startX + col * gap, y: startY + row * gap };
        count++;
      });
      setViewMode("grid");
    }
    setPositions(newPos);
  };

  return (
    <div
      className={`visualizer-container ${viewMode}`}
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Sidebar />

      <div className="header fixed-header">
        <span>Network Visualizer</span>
        <button onClick={switchView}>
          {viewMode === "circular" ? "Switch to Grid" : "Switch to Circular"}
        </button>
      </div>

      {viewMode === "circular" && (
        <svg className="link-layer">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00c2ff" />
              <stop offset="100%" stopColor="#0078d4" />
            </linearGradient>
          </defs>

          {links.map((l, i) => {
            const from = positions[l.from];
            const to = positions[l.to];
            if (!from || !to) return null;

            const midX = (from.x + to.x) / 2 + (to.y - from.y) * 0.15;
            const midY = (from.y + to.y) / 2 - (to.x - from.x) * 0.15;
            const path = `M${from.x + 35},${from.y + 35} Q${midX},${midY} ${to.x + 35},${to.y + 35}`;

            return (
              <path
                key={i}
                d={path}
                stroke="url(#lineGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="6 6"
                className="animated-link"
              />
            );
          })}
        </svg>
      )}

      {devices.map((d) => {
        const pos = positions[d.id] || { x: 0, y: 0 };
        return (
          <div
            key={d.id}
            className={`device-box ${d.type} ${!d.active ? "no-agent" : ""} ${
              dragging === d.id ? "dragging" : ""
            }`}
            style={{ left: pos.x, top: pos.y }}
            onMouseDown={(e) => handleMouseDown(e, d.id)}
          >
            <div className={`circle ${d.type === "router" ? "router-circle" : ""}`}>
              <div className="emoji">{d.icon}</div>
            </div>
            <div className="info-card">
              <div className="vendor">{d.vendor}</div>
              <div className="ip">{d.ip}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
