import React, { useState, useEffect } from "react";
import "./grid.css";

export default function Gridview({ devices, links, draggedNode, setDraggedNode }) {
  const [positions, setPositions] = useState({});
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 400 });

  // 🌀 Compute grid positions
  useEffect(() => {
    if (!devices || devices.length === 0) return;

    const computePositions = () => {
      const W = window.innerWidth * 0.7;
      const H = window.innerHeight * 0.6;
      setSize({ width: W, height: H });

      const newPos = {};
      const router = devices.find((d) => d.type === "router") || devices[0];
      const others = devices.filter((d) => d.id !== router.id);

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

      setPositions(newPos);
    };

    computePositions();
    window.addEventListener("resize", computePositions);
    return () => window.removeEventListener("resize", computePositions);
  }, [devices]);

  // 🖱️ Drag handlers
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
      [draggedNode]: { x: cursor.x + offset.x, y: cursor.y + offset.y },
    }));
  };

  const handleMouseUp = () => setDraggedNode(null);

  return (
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

        const midX = (a.x + b.x) / 2;
        const path = `M${a.x},${a.y} L${midX - 20},${a.y} L${midX + 20},${b.y} L${b.x},${b.y}`;
        return (
          <path
            key={idx}
            className="wire-path alive"
            d={path}
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
                <div className={`node-status ${d.noAgent ? "no-agent" : "online"}`}>
                  {d.status}
                </div>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
